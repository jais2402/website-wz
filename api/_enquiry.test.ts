// @vitest-environment node
// Underscore prefix: Vercel does not deploy this file as a function.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { marketingOptIn } from '../src/content/site.ts'
import {
  MARKETING_WORDING,
  RATE,
  enquiryEmail,
  escapeHtml,
  formatIst,
  handleEnquiry,
  originAllowed,
  parseEnquiry,
  rateLimited,
  resetRateLimit,
} from './enquiry.ts'

const valid = {
  name: 'Asha Rao',
  email: 'asha@example.com',
  company: 'Rao Logistics',
  phone: '+91 98400 12345',
  topics: ['A new system'],
  message: 'Our orders live in three spreadsheets.',
  marketing: false,
  source: 'wezigns.com/contact-us',
}
// 20 Oct 2026, 09:02 UTC = 14:32 IST.
const at = new Date('2026-10-20T09:02:00Z')
const env = { RESEND_API_KEY: 're_test' }

const post = (body: unknown, headers: Record<string, string> = {}) =>
  new Request('https://wezigns.com/api/enquiry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'https://www.wezigns.com', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })

describe('parseEnquiry (mirrors src/lib/enquiry.ts validateEnquiry)', () => {
  it('accepts a complete enquiry and trims it', () => {
    const r = parseEnquiry({ ...valid, name: '  Asha Rao ' })
    expect(r.ok && r.value.name).toBe('Asha Rao')
  })

  it('rejects missing or malformed required fields', () => {
    const r = parseEnquiry({ ...valid, name: ' ', email: 'asha@', message: 'Help' })
    expect(!r.ok && r.fields.sort()).toEqual(['email', 'message', 'name'])
    expect(parseEnquiry({ ...valid, message: 'x'.repeat(2001) }).ok).toBe(false)
    expect(parseEnquiry({ ...valid, phone: 'call me' }).ok).toBe(false)
    expect(parseEnquiry({ ...valid, phone: '' }).ok).toBe(true)
    expect(parseEnquiry(null).ok).toBe(false)
  })

  it('reads the marketing opt-in as a boolean that defaults to false', () => {
    const { marketing: _omit, ...withoutMarketing } = valid
    const value = (input: unknown) => {
      const r = parseEnquiry(input)
      return r.ok ? r.value.marketing : 'invalid'
    }
    expect(value(withoutMarketing)).toBe(false)
    expect(value({ ...valid, marketing: true })).toBe(true)
    expect(value({ ...valid, marketing: false })).toBe(false)
    for (const odd of ['true', 'yes', 1, null, {}]) expect(value({ ...valid, marketing: odd })).toBe(false)
  })
})

describe('marketing consent record', () => {
  it('uses the same wording as the forms (src/content/site.ts)', () => {
    expect(MARKETING_WORDING).toBe(marketingOptIn.label)
  })

  it('formats the time in IST', () => {
    expect(formatIst(at)).toBe('20 Oct 2026, 14:32 IST')
  })

  it('states the choice in the email, with the time and wording for a yes', () => {
    const no = enquiryEmail(valid, at)
    expect(no.text).toContain('Marketing emails: No')
    const yes = enquiryEmail({ ...valid, marketing: true }, at)
    expect(yes.text).toContain(`Marketing emails: Yes (opted in on 20 Oct 2026, 14:32 IST: '${MARKETING_WORDING}')`)
    expect(yes.html).toContain('Marketing emails')
    expect(yes.html).toContain('opted in on 20 Oct 2026, 14:32 IST: &#39;Email me occasional updates')
  })
})

describe('enquiryEmail', () => {
  it('escapes visitor input in the HTML and keeps the subject on one line', () => {
    const { html, subject } = enquiryEmail({ ...valid, name: '<b>x</b>\r\nBcc: a', message: '<script>alert(1)</script> & more' })
    expect(html).not.toContain('<script>')
    expect(html).toContain('&lt;script&gt;')
    expect(html).toContain('&amp; more')
    expect(subject).not.toMatch(/[\r\n]/)
    expect(escapeHtml(`"'`)).toBe('&quot;&#39;')
  })
})

describe('handleEnquiry', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>
  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{"id":"1"}', { status: 200 }))
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterEach(() => vi.restoreAllMocks())

  it('rejects other methods with 405', async () => {
    const res = await handleEnquiry(new Request('https://wezigns.com/api/enquiry'), env)
    expect(res.status).toBe(405)
    expect(res.headers.get('allow')).toBe('POST')
  })

  it('rejects non-JSON, oversized and invalid bodies', async () => {
    expect((await handleEnquiry(post('a=1', { 'Content-Type': 'text/plain' }), env)).status).toBe(415)
    expect((await handleEnquiry(post({ ...valid, message: 'x'.repeat(20000) }), env)).status).toBe(413)
    expect((await handleEnquiry(post('{nope'), env)).status).toBe(400)
    const res = await handleEnquiry(post({ ...valid, email: '' }), env)
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ ok: false, error: 'invalid', fields: ['email'] })
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('drops honeypot submissions with a fake 200', async () => {
    const res = await handleEnquiry(post({ ...valid, website: 'http://spam' }), env)
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true })
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('answers 503 not-configured without a Resend key', async () => {
    const res = await handleEnquiry(post(valid), {})
    expect(res.status).toBe(503)
    expect(await res.json()).toEqual({ ok: false, error: 'not-configured' })
  })

  it('sends through Resend with defaults and reply_to set to the visitor', async () => {
    const res = await handleEnquiry(post(valid), env)
    expect(await res.json()).toEqual({ ok: true })
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('https://api.resend.com/emails')
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer re_test')
    const body = JSON.parse(init.body as string)
    expect(body).toMatchObject({ from: 'Wezigns website <website@wezigns.com>', to: ['contact@wezigns.com'], reply_to: 'asha@example.com' })
    expect(body.text).toContain('Marketing emails: No')
  })

  it('records an opt-in with the time the server received it', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(at)
    try {
      await handleEnquiry(post({ ...valid, marketing: true }), env)
    } finally {
      vi.useRealTimers()
    }
    const body = JSON.parse((fetchSpy.mock.calls[0][1] as RequestInit).body as string)
    expect(body.text).toContain(`Marketing emails: Yes (opted in on 20 Oct 2026, 14:32 IST: '${MARKETING_WORDING}')`)
  })

  it('uses ENQUIRY_TO / ENQUIRY_FROM when set', async () => {
    await handleEnquiry(post(valid), { ...env, ENQUIRY_TO: 'a@wezigns.com, b@wezigns.com', ENQUIRY_FROM: 'Site <site@wezigns.com>' })
    const body = JSON.parse((fetchSpy.mock.calls[0][1] as RequestInit).body as string)
    expect(body.to).toEqual(['a@wezigns.com', 'b@wezigns.com'])
    expect(body.from).toBe('Site <site@wezigns.com>')
  })

  it('returns 502 when Resend fails or is unreachable', async () => {
    fetchSpy.mockResolvedValueOnce(new Response('{"message":"domain not verified"}', { status: 403 }))
    expect((await handleEnquiry(post(valid), env)).status).toBe(502)
    fetchSpy.mockRejectedValueOnce(new TypeError('fetch failed'))
    const res = await handleEnquiry(post(valid), env)
    expect(res.status).toBe(502)
    expect(await res.json()).toEqual({ ok: false, error: 'send-failed' })
  })
})

describe('abuse limits', () => {
  beforeEach(() => resetRateLimit())

  it('accepts the site, its own host and local development, and refuses other origins', () => {
    const url = 'https://wezigns-git-main-team.vercel.app/api/enquiry'
    expect(originAllowed('https://www.wezigns.com', url)).toBe(true)
    expect(originAllowed('https://wezigns-git-main-team.vercel.app', url)).toBe(true)
    expect(originAllowed('http://localhost:5173', url)).toBe(true)
    expect(originAllowed('https://evil.example', url)).toBe(false)
    expect(originAllowed(null, url)).toBe(false)
  })

  it('answers 403 to a post from another site or with no Origin', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    expect((await handleEnquiry(post(valid, { Origin: 'https://evil.example' }), env)).status).toBe(403)
    const bare = new Request('https://wezigns.com/api/enquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(valid),
    })
    expect((await handleEnquiry(bare, env)).status).toBe(403)
    expect(fetchMock).not.toHaveBeenCalled()
    vi.unstubAllGlobals()
  })

  it('limits each IP to a few enquiries per window, then lets it through again', () => {
    const now = 1_000_000
    for (let i = 0; i < RATE.max; i++) expect(rateLimited('203.0.113.7', now + i)).toBe(false)
    expect(rateLimited('203.0.113.7', now + RATE.max)).toBe(true)
    expect(rateLimited('198.51.100.2', now)).toBe(false)
    expect(rateLimited('203.0.113.7', now + RATE.windowMs + RATE.max)).toBe(false)
  })

  it('answers 429 once an IP is over the limit', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', { status: 200 })))
    const ip = { 'X-Forwarded-For': '203.0.113.9, 10.0.0.1' }
    for (let i = 0; i < RATE.max; i++) expect((await handleEnquiry(post(valid, ip), env)).status).toBe(200)
    expect((await handleEnquiry(post(valid, ip), env)).status).toBe(429)
    vi.unstubAllGlobals()
  })
})
