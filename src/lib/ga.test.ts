import { CONSENT_KEY } from './consent'

// ga.ts keeps module state (started once), so each test loads a fresh copy.
async function load() {
  vi.resetModules()
  const ga = await import('./ga')
  const consent = await import('./consent')
  const analytics = await import('./analytics')
  return { ...ga, ...consent, ...analytics }
}

const gaScript = () => document.querySelector('script[src*="googletagmanager.com"]')
// dataLayer holds `arguments` objects; turn them into arrays to compare.
const calls = () => (window.dataLayer ?? []).map((a) => Array.from(a as ArrayLike<unknown>))

describe('ga loader', () => {
  beforeEach(() => {
    localStorage.clear()
    document.head.innerHTML = ''
    delete window.dataLayer
    delete window.gtag
  })

  it('does nothing without a valid measurement ID', async () => {
    const { initAnalytics } = await load()
    initAnalytics('')
    initAnalytics('not-an-id')
    expect(window.dataLayer).toBeUndefined()
    expect(gaScript()).toBeNull()
  })

  it('sets denied defaults and loads no script before consent', async () => {
    const { initAnalytics } = await load()
    initAnalytics('G-TEST123')
    expect(calls()[0]).toEqual([
      'consent',
      'default',
      {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        analytics_storage: 'denied',
        wait_for_update: 500,
      },
    ])
    expect(gaScript()).toBeNull()
  })

  it('loads the script, grants analytics only and sends events after Accept', async () => {
    const { initAnalytics, setConsent, track } = await load()
    initAnalytics('G-TEST123')
    initAnalytics('G-TEST123') // second call is a no-op
    setConsent(true)
    expect(gaScript()?.getAttribute('src')).toBe('https://www.googletagmanager.com/gtag/js?id=G-TEST123')
    const c = calls()
    expect(c.filter((x) => x[0] === 'consent' && x[1] === 'default')).toHaveLength(1)
    expect(c).toContainEqual(['consent', 'update', { analytics_storage: 'granted' }])
    expect(c).toContainEqual(['config', 'G-TEST123', { anonymize_ip: true }])
    expect(c.some((x) => x[0] === 'consent' && JSON.stringify(x).includes('ad_storage":"granted'))).toBe(false)
    track('cta_click', { label: 'Hi', location: 'nav' })
    expect(calls()).toContainEqual(['event', 'cta_click', { label: 'Hi', location: 'nav' }])
  })

  it('honours a stored Accept on the next page load', async () => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ analytics: true, ts: new Date().toISOString(), v: 1 }))
    const { initAnalytics } = await load()
    initAnalytics('G-TEST123')
    expect(gaScript()).not.toBeNull()
  })

  it('stops events, denies storage and deletes _ga cookies on withdrawal', async () => {
    const { initAnalytics, setConsent, track } = await load()
    initAnalytics('G-TEST123')
    setConsent(true)
    document.cookie = '_ga=GA1.1.123; path=/'
    document.cookie = '_ga_TEST123=GS1.1.456; path=/'
    document.cookie = 'keep=1; path=/'
    setConsent(false)
    expect(document.cookie).not.toMatch(/_ga/)
    expect(document.cookie).toMatch(/keep=1/)
    expect(calls().at(-1)).toEqual(['consent', 'update', { analytics_storage: 'denied' }])
    const before = calls().length
    track('cta_click', { label: 'x', location: 'nav' })
    expect(calls()).toHaveLength(before)
  })
})

describe('ga helpers', () => {
  it('lists the host and its parent domains', async () => {
    const { cookieDomains } = await load()
    expect(cookieDomains('www.wezigns.com')).toEqual([
      'www.wezigns.com',
      '.www.wezigns.com',
      'wezigns.com',
      '.wezigns.com',
    ])
    expect(cookieDomains('localhost')).toEqual(['localhost'])
    expect(cookieDomains('127.0.0.1')).toEqual(['127.0.0.1'])
  })

  it('matches GA cookie names only', async () => {
    const { isGaCookie } = await load()
    expect(['_ga', '_ga_ABC123', '_gid', '_gat_gtag_x'].every(isGaCookie)).toBe(true)
    expect(['_gax', 'ga', 'wz-consent', '_garden'].some(isGaCookie)).toBe(false)
  })

  it('classifies phone, email and outbound links without personal data', async () => {
    const { classifyLink } = await load()
    expect(classifyLink('tel:+914400000000', 'wezigns.com')).toEqual({ name: 'click_to_call', params: {} })
    expect(classifyLink('mailto:hello@wezigns.com', 'wezigns.com')).toEqual({ name: 'click_to_email', params: {} })
    expect(classifyLink('https://chatgpt.com/?q=Tell%20me', 'wezigns.com')).toEqual({
      name: 'outbound_click',
      params: { link_domain: 'chatgpt.com', link_url: 'https://chatgpt.com/', outbound: true },
    })
    expect(classifyLink('/contact-us', 'wezigns.com')).toBeNull()
    expect(classifyLink('#work', 'wezigns.com')).toBeNull()
    expect(classifyLink('https://wezigns.com/about-us', 'wezigns.com')).toBeNull()
    expect(classifyLink('javascript:void(0)', 'wezigns.com')).toBeNull()
  })

  it('names where a link sits', async () => {
    const { linkLocation } = await load()
    document.body.innerHTML = `
      <header class="nav"><a id="n" href="/x">x</a></header>
      <section id="top" class="loom-hero"><a id="h" href="/x">x</a></section>
      <section id="pricing"><a id="p" href="/x">x</a></section>
      <div class="sticky-call"><a id="s" href="tel:1">x</a></div>
      <footer><a id="f" href="/x">x</a></footer>
      <a id="o" href="/x">x</a>`
    const loc = (id: string) => linkLocation(document.getElementById(id)!)
    expect([loc('n'), loc('h'), loc('p'), loc('s'), loc('f'), loc('o')]).toEqual([
      'nav',
      'hero',
      'pricing',
      'sticky_call',
      'footer',
      'page',
    ])
  })
})
