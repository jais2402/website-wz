// Cookie consent store. The choice lives in localStorage under `wz-consent`; that storage is strictly necessary
// (it only remembers the answer), so it needs no consent itself. Every access is wrapped: storage can throw
// (private mode, blocked site data) and the site must work without it.

export const CONSENT_KEY = 'wz-consent'
export const CONSENT_VERSION = 1
/** Ask again after 12 months. */
export const CONSENT_MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000
/** Window event that reopens the banner (fired by openConsentSettings()). */
export const CONSENT_OPEN_EVENT = 'wz:consent-open'

export type Consent = { analytics: boolean; ts: string; v: 1 }

type Listener = (consent: Consent) => void

const listeners = new Set<Listener>()

/** Reads a stored, valid, unexpired choice; null means "ask". */
export function getConsent(now = Date.now()): Consent | null {
  try {
    const raw = window.localStorage.getItem(CONSENT_KEY)
    if (!raw) return null
    const c = JSON.parse(raw) as Partial<Consent> | null
    if (!c || c.v !== CONSENT_VERSION || typeof c.analytics !== 'boolean' || typeof c.ts !== 'string') return null
    const at = Date.parse(c.ts)
    if (!Number.isFinite(at) || now - at > CONSENT_MAX_AGE_MS || at - now > 60_000) return null
    return { analytics: c.analytics, ts: c.ts, v: CONSENT_VERSION }
  } catch {
    return null
  }
}

/** Stores the visitor's choice and tells every listener. Listeners run even if storage fails. */
export function setConsent(analytics: boolean, now = Date.now()): Consent {
  const consent: Consent = { analytics, ts: new Date(now).toISOString(), v: CONSENT_VERSION }
  try {
    window.localStorage.setItem(CONSENT_KEY, JSON.stringify(consent))
  } catch {
    // Not remembered; the banner simply asks again on the next page.
  }
  listeners.forEach((cb) => {
    try {
      cb(consent)
    } catch {
      // One bad listener must not stop the others.
    }
  })
  return consent
}

/** Subscribe to choices made on this page. Returns an unsubscribe function. */
export function onConsentChange(cb: Listener): () => void {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}

/** Reopens the cookie banner (footer "Cookie settings"). */
export function openConsentSettings() {
  try {
    window.dispatchEvent(new CustomEvent(CONSENT_OPEN_EVENT))
  } catch {
    // No window (tests, SSR snapshot): nothing to open.
  }
}
