import { aboutPage, aiPage, notFoundPage, servicesPage, systemPages, systemsSection } from '@/content/pages'
import { brand, faq, loom, stats } from '@/content/site'
import { escapeHtml, pageForFile, snapshot, snapshotPages } from './snapshot'

const html = (id: string) => {
  const out = snapshot(id)
  if (!out) throw new Error(`no snapshot for ${id}`)
  return out
}
const count = (s: string, re: RegExp) => (s.match(re) ?? []).length
const h1Text = (s: string) => s.match(/<h1>(.*?)<\/h1>/)?.[1]
const hrefs = (s: string) => [...s.matchAll(/href="([^"]*)"/g)].map((m) => m[1])

// Every page a crawler should be able to reach from any page.
const PAGES = [
  '/our-services',
  ...systemPages.map((s) => `/systems/${s.slug}`),
  '/ai',
  '/technology',
  '/about-us',
  '/contact-us',
]

describe('snapshot', () => {
  it.each(snapshotPages)('%s has one H1, a header nav, a main and a footer', (id) => {
    const s = html(id)
    expect(count(s, /<h1>/g)).toBe(1)
    expect(count(s, /<main>/g)).toBe(1)
    expect(s).toMatch(/^<div class="snapshot"><header>.*<nav aria-label="Primary">/)
    expect(s).toMatch(/<footer>.*<\/footer><\/div>$/)
  })

  it.each(snapshotPages)('%s links to every page and to Work', (id) => {
    const links = hrefs(html(id))
    for (const href of PAGES) expect(links).toContain(href)
    expect(links.some((h) => h.endsWith('#work'))).toBe(true)
  })

  it.each(snapshotPages)('%s carries the NAP and the copyright line', (id) => {
    const s = html(id)
    expect(s).toContain(escapeHtml(brand.legal))
    for (const l of brand.address) expect(s).toContain(escapeHtml(l))
    expect(s).toContain(brand.phone)
    expect(s).toContain(`href="${brand.phoneHref}"`)
    expect(s).toContain(`mailto:${brand.email}`)
    expect(s).toContain(`© 2026 ${brand.legal}`)
  })

  it('home: the hero H1, its key H2s, every FAQ and the stat values', () => {
    const s = html('home')
    expect(h1Text(s)).toBe('Every loose thread, woven into one system.')
    for (const h of [
      loom.weave.title,
      'Simplify.',
      'Twelve years of building software for growing businesses.',
      'Every corner of the business, connected.',
      'Our Work',
      'Four stages. No surprises.',
      'Priced on outcomes, not hours.',
      'Straight answers.',
      'Hand us the tangle.',
    ])
      expect(s).toContain(`<h2>${escapeHtml(h)}</h2>`)
    for (const f of faq) {
      expect(s).toContain(`<h3>${escapeHtml(f.q)}</h3>`)
      expect(s).toContain(escapeHtml(f.a))
    }
    expect(stats.map((x) => `${x.value}${x.suffix}`)).toEqual(['20+', '11', '2012'])
    for (const v of ['20+', '11', '2012']) expect(s).toContain(`<strong>${v}</strong>`)
    // Case-study metrics are in the text.
    expect(s).toContain('−80%')
    expect(s).toContain('300 → 4,500')
  })

  it('inner pages: real headlines and section headings', () => {
    expect(h1Text(html('about'))).toBe(aboutPage.title.join(' '))
    expect(html('about')).toContain(`<h2>${aboutPage.whyTitle}</h2>`)
    expect(h1Text(html('ai'))).toBe(aiPage.title.join(' '))
    expect(html('ai')).toContain(`<h2>${aiPage.howTitle}</h2>`)
    expect(h1Text(html('services'))).toBe(servicesPage.title.join(' '))
    expect(html('services')).toContain(`<h2>${servicesPage.systemsTitle}</h2>`)
    expect(h1Text(html('technology'))).toBe('The stack behind the systems we build.')
    expect(h1Text(html('contact'))).toBe('Tell us what is not working.')
    expect(h1Text(html('notFound'))).toBe(notFoundPage.title.join(' '))
    for (const sp of systemPages) {
      const s = html(`system:${sp.slug}`)
      expect(h1Text(s)).toBe(escapeHtml(`${sp.title}. ${sp.promise}`))
      for (const h of [systemsSection.painsTitle, systemsSection.buildTitle, systemsSection.impactTitle])
        expect(s).toContain(`<h2>${h}</h2>`)
      for (const m of Object.keys(sp.modules)) expect(s).toContain(`<h3>${escapeHtml(m)}</h3>`)
    }
  })

  it('in-page anchors point back to the home page from other pages', () => {
    expect(hrefs(html('home'))).toContain('#work')
    expect(hrefs(html('about'))).toContain('/#work')
    expect(hrefs(html('about'))).not.toContain('#work')
  })

  it('escapes text', () => {
    expect(escapeHtml(`<script>alert("x")</script> & 'y'`)).toBe(
      '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; &#39;y&#39;',
    )
    for (const id of snapshotPages) expect(html(id)).not.toMatch(/<script|<style| style=/)
    // "People & workforce" is in every nav.
    expect(html('home')).toContain('People &amp; workforce')
    expect(html('home')).not.toContain('People & workforce')
  })

  it('returns null for unknown pages', () => {
    expect(snapshot('loom')).toBeNull()
    expect(snapshot('system:nope')).toBeNull()
  })
})

describe('pageForFile', () => {
  it('maps each HTML file to its page', () => {
    expect(pageForFile('index.html')).toBe('home')
    expect(pageForFile('/contact-us.html')).toBe('contact')
    expect(pageForFile('about-us.html')).toBe('about')
    expect(pageForFile('our-services.html')).toBe('services')
    expect(pageForFile('ai.html')).toBe('ai')
    expect(pageForFile('technology.html')).toBe('technology')
    expect(pageForFile('404.html')).toBe('notFound')
    expect(pageForFile('systems/people.html')).toBe('system:people')
    expect(pageForFile('systems\\finance.html')).toBe('system:finance')
  })

  it('leaves the internal loom page and unknown files alone', () => {
    expect(pageForFile('loom.html')).toBeNull()
    expect(pageForFile('systems/nope.html')).toBeNull()
    expect(pageForFile('src/index.html')).toBeNull()
  })
})
