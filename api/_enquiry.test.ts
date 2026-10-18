// @vitest-environment node
// Underscore prefix: Vercel does not deploy this file as a function.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { enquiryEmail, escapeHtml, handleEnquiry, parseEnquiry } from './enquiry.ts'

const valid = {
  name: 'Asha Rao',
  email: 'asha@example.com',
  company: 'Rao Logistics',
  phone: '+91 98400 12345',
  topics: ['A new system'],
  message: 'Our orders live in three spreadsheets.',
  source: 'wezigns.com/contact',
}
const env = { RESEND_API_KEY: 're_test' }

const post = (body: unknown, headers: Record<string, string> = {}) =>
  new Request('https://wezigns.com/api/enquiry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
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
