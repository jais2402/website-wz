import {
  CONSENT_KEY,
  CONSENT_MAX_AGE_MS,
  CONSENT_OPEN_EVENT,
  getConsent,
  onConsentChange,
  openConsentSettings,
  setConsent,
} from './consent'

const NOW = Date.parse('2026-10-20T10:00:00Z')

describe('consent store', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => vi.restoreAllMocks())

  it('returns null when nothing is stored', () => {
    expect(getConsent(NOW)).toBeNull()
  })

  it('stores and reads back a choice', () => {
    setConsent(true, NOW)
    expect(JSON.parse(localStorage.getItem(CONSENT_KEY)!)).toEqual({
      analytics: true,
      ts: '2026-10-20T10:00:00.000Z',
      v: 1,
    })
    expect(getConsent(NOW)).toEqual({ analytics: true, ts: '2026-10-20T10:00:00.000Z', v: 1 })
    setConsent(false, NOW)
    expect(getConsent(NOW)?.analytics).toBe(false)
  })

  it('asks again after 12 months', () => {
    setConsent(true, NOW)
    expect(getConsent(NOW + CONSENT_MAX_AGE_MS - 1000)).not.toBeNull()
    expect(getConsent(NOW + CONSENT_MAX_AGE_MS + 1000)).toBeNull()
  })

  it('asks again when the version changes or the value is malformed', () => {
    const bad = [
      JSON.stringify({ analytics: true, ts: new Date(NOW).toISOString(), v: 2 }),
      JSON.stringify({ analytics: 'yes', ts: new Date(NOW).toISOString(), v: 1 }),
      JSON.stringify({ analytics: true, ts: 'not a date', v: 1 }),
      JSON.stringify(null),
      '{oops',
    ]
    for (const raw of bad) {
      localStorage.setItem(CONSENT_KEY, raw)
      expect(getConsent(NOW)).toBeNull()
    }
  })

  it('never throws when storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    const cb = vi.fn()
    const off = onConsentChange(cb)
    expect(getConsent(NOW)).toBeNull()
    expect(() => setConsent(true, NOW)).not.toThrow()
    expect(cb).toHaveBeenCalledWith(expect.objectContaining({ analytics: true }))
    off()
  })

  it('notifies listeners until they unsubscribe', () => {
    const cb = vi.fn()
    const off = onConsentChange(cb)
    setConsent(true, NOW)
    expect(cb).toHaveBeenCalledTimes(1)
    off()
    setConsent(false, NOW)
    expect(cb).toHaveBeenCalledTimes(1)
  })

  it('openConsentSettings fires the reopen event', () => {
    const cb = vi.fn()
    window.addEventListener(CONSENT_OPEN_EVENT, cb)
    openConsentSettings()
    expect(cb).toHaveBeenCalledTimes(1)
    window.removeEventListener(CONSENT_OPEN_EVENT, cb)
  })
})
