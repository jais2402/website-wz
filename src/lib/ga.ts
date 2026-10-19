// Google Analytics 4 behind Google Consent Mode v2, basic mode: no Google script, request or cookie until the
// visitor accepts. Ads storage is always denied (the site runs no ads). Every page load is one page view (MPA).
// Without VITE_GA_MEASUREMENT_ID nothing here runs at all.
import { setAnalyticsSink, track, type TrackParams } from './analytics'
import { getConsent, onConsentChange } from './consent'

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

const ENV_ID = String(import.meta.env.VITE_GA_MEASUREMENT_ID ?? '').trim()

/** Only a well-formed GA4 ID counts, so a typo can never inject an odd script URL. */
export const validId = (id: string) => /^G-[A-Z0-9]{4,16}$/.test(id)

/** True when a GA ID is configured, i.e. there is something to ask consent for. */
export const analyticsConfigured = (id = ENV_ID) => validId(id)

let started = false
let configured = false

// gtag must push the `arguments` object itself, not an array: gtag.js ignores arrays.
function gtag(..._args: unknown[]) {
  // eslint-disable-next-line prefer-rest-params
  window.dataLayer!.push(arguments)
}

/** Starts consent-aware GA. Safe to call more than once; never throws. */
export function initAnalytics(id = ENV_ID) {
  if (started || !validId(id) || typeof window === 'undefined') return
  started = true
  try {
    window.dataLayer = window.dataLayer || []
    window.gtag = gtag
    gtag('consent', 'default', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied',
      wait_for_update: 500,
    })
    apply(id, getConsent()?.analytics === true)
    onConsentChange((c) => apply(id, c.analytics))
    document.addEventListener('click', onClick, true)
  } catch {
    // Analytics must never break the page.
  }
}

function apply(id: string, granted: boolean) {
  try {
    // Google's documented opt-out flag: while set, gtag.js sends nothing for this ID.
    ;(window as unknown as Record<string, boolean>)[`ga-disable-${id}`] = !granted
    if (granted) {
      gtag('consent', 'update', { analytics_storage: 'granted' })
      if (!configured) {
        configured = true
        gtag('js', new Date())
        gtag('config', id, { anonymize_ip: true })
        loadScript(id)
      }
      setAnalyticsSink((name, params) => gtag('event', name, params ?? {}))
    } else {
      setAnalyticsSink(null)
      gtag('consent', 'update', { analytics_storage: 'denied' })
      clearGaCookies()
    }
  } catch {
    // Ignore.
  }
}

function loadScript(id: string) {
  if (document.querySelector('script[data-wz-ga]')) return
  const s = document.createElement('script')
  s.async = true
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`
  s.dataset.wzGa = ''
  document.head.appendChild(s)
}

/** Domains a GA cookie may sit on: the host itself and each parent (www.wezigns.com → wezigns.com). */
export function cookieDomains(host: string): string[] {
  const parts = host.split('.').filter(Boolean)
  if (parts.length < 2 || /^\d+$/.test(parts[parts.length - 1])) return [host]
  const out: string[] = []
  for (let i = 0; i <= parts.length - 2; i++) {
    const d = parts.slice(i).join('.')
    out.push(d, `.${d}`)
  }
  return out
}

/** GA4 cookies: _ga, _ga_<container>, plus the legacy _gid / _gat ones in case an old tag set them. */
export const isGaCookie = (name: string) => /^(_ga|_ga_.+|_gid|_gat.*)$/.test(name)

/** Deletes GA cookies on this host and its parent domains (e.g. .wezigns.com). */
export function clearGaCookies() {
  try {
    const names = document.cookie
      .split(';')
      .map((c) => c.split('=')[0].trim())
      .filter(isGaCookie)
    const expired = 'expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; path=/'
    for (const name of names) {
      document.cookie = `${name}=; ${expired}`
      for (const d of cookieDomains(location.hostname)) document.cookie = `${name}=; ${expired}; domain=${d}`
    }
  } catch {
    // Ignore.
  }
}

// --- Click tracking -------------------------------------------------------------------------------------------
// One delegated listener covers phone, email and outbound links on every page, so components stay untouched.
// It only ever sends where the click happened and a domain, never the number, address or link text.

/** Where on the page a link sits, as a short fixed label. */
export function linkLocation(el: Element): string {
  if (el.closest('.sticky-call')) return 'sticky_call'
  if (el.closest('header.nav')) return 'nav'
  if (el.closest('.loom-hero, .pg-hero, .cp-head')) return 'hero'
  if (el.closest('footer')) return 'footer'
  const section = el.closest('section[id]')
  return section ? section.id.slice(0, 40) : 'page'
}

/** The GA4 event for a link click, or null if it is an ordinary internal link. */
export function classifyLink(href: string, host: string): { name: string; params: TrackParams } | null {
  const h = href.trim().toLowerCase()
  if (h.startsWith('tel:')) return { name: 'click_to_call', params: {} }
  if (h.startsWith('mailto:')) return { name: 'click_to_email', params: {} }
  try {
    const url = new URL(href, `https://${host}/`)
    if (!/^https?:$/.test(url.protocol) || url.host === host) return null
    // Origin and path only: query strings (e.g. the AI prompt) are left out.
    return {
      name: 'outbound_click',
      params: { link_domain: url.hostname, link_url: `${url.origin}${url.pathname}`, outbound: true },
    }
  } catch {
    return null
  }
}

function onClick(e: MouseEvent) {
  try {
    const a = (e.target as Element | null)?.closest?.('a[href]')
    if (!a) return
    const location = linkLocation(a)
    const hit = classifyLink(a.getAttribute('href') ?? '', window.location.host)
    if (hit) track(hit.name, { ...hit.params, location })
    // Hero primary buttons (the hero components are not instrumented themselves).
    if (location === 'hero' && a.classList.contains('btn-lime')) {
      track('cta_click', { label: (a.textContent ?? '').replace(/[→↗]/g, '').trim().slice(0, 60), location })
    }
  } catch {
    // Ignore.
  }
}
