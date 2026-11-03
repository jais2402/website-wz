// Microsoft Clarity (heatmaps and session recordings), behind the same analytics consent as GA4: no Clarity script,
// request or cookie until the visitor accepts. Withdrawing consent tells Clarity to stop and deletes its cookies.
// The project: VITE_CLARITY_ID when set, else Wezigns' project on Vercel deployments (production and preview, same
// as GA4). Local dev stays off.
import { getConsent, onConsentChange } from './consent'
import { cookieDomains } from './ga'

declare global {
  interface Window {
    clarity?: ((...args: unknown[]) => void) & { q?: unknown[] }
  }
}

/** Wezigns' Clarity project (public: it appears in every page that loads it). */
export const CLARITY_PROJECT = 'z80jzy0skf'

/** Only a plain project id counts, so a typo can never inject an odd script URL. */
export const validClarityId = (id: string) => /^[a-z0-9]{6,16}$/.test(id)

/** The project to use: an explicit setting wins; otherwise Wezigns' project on production and preview deployments. */
export const resolveClarityId = (envId: string, vercelEnv: string) =>
  envId.trim() || (vercelEnv === 'production' || vercelEnv === 'preview' ? CLARITY_PROJECT : '')

const ID = resolveClarityId(String(import.meta.env.VITE_CLARITY_ID ?? ''), String(import.meta.env.VITE_VERCEL_ENV ?? ''))

/** Clarity's cookies: _clck (user) and _clsk (session). */
export const isClarityCookie = (name: string) => /^(_clck|_clsk|CLID|ANONCHK|MR|MUID|SM)$/.test(name)

let started = false
let loaded = false

/** Starts consent-aware Clarity. Safe to call more than once; never throws. */
export function initClarity(id = ID) {
  if (started || !validClarityId(id) || typeof window === 'undefined') return
  started = true
  try {
    apply(id, getConsent()?.analytics === true)
    onConsentChange((c) => apply(id, c.analytics))
  } catch {
    // Analytics must never break the page.
  }
}

function apply(id: string, granted: boolean) {
  try {
    if (granted) {
      if (!loaded) load(id)
      window.clarity?.('consent')
    } else if (loaded) {
      // Clarity's own opt-out: stops recording and clears its cookies; ours below catches any left on parent domains.
      window.clarity?.('consent', false)
      clearClarityCookies()
    }
  } catch {
    // Ignore.
  }
}

/** Microsoft's loader: a queue until the script arrives, then the tag itself. */
function load(id: string) {
  loaded = true
  const c = (window.clarity ||= Object.assign((...args: unknown[]) => (c.q ||= []).push(args), { q: [] as unknown[] }))
  const s = document.createElement('script')
  s.async = true
  s.src = `https://www.clarity.ms/tag/${encodeURIComponent(id)}`
  s.dataset.wzClarity = ''
  document.head.appendChild(s)
}

/** Deletes Clarity cookies on this host and its parent domains. */
export function clearClarityCookies() {
  try {
    const names = document.cookie
      .split(';')
      .map((c) => c.split('=')[0].trim())
      .filter(isClarityCookie)
    const expired = 'expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; path=/'
    for (const name of names) {
      document.cookie = `${name}=; ${expired}`
      for (const d of cookieDomains(location.hostname)) document.cookie = `${name}=; ${expired}; domain=${d}`
    }
  } catch {
    // Ignore.
  }
}
