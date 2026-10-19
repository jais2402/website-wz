import { marketingOptIn } from '@/content/site'
import { setAnalyticsSink } from './analytics'
import { type Enquiry, enquiryConfig, enquiryMailto, enquiryPayload, formatIst, isSpam, marketingLine, submitEnquiry, trackLead, validateEnquiry } from './enquiry'

const valid: Enquiry = {
  name: 'Asha Rao',
  email: 'asha@example.com',
  company: 'Rao Logistics',
  phone: '+91 98400 12345',
  topics: ['A new system'],
  message: 'Our orders live in three spreadsheets.',
  website: '',
  marketing: false,
}
// 20 Oct 2026, 09:02 UTC = 14:32 IST.
const at = new Date('2026-10-20T09:02:00Z')

describe('validateEnquiry', () => {
  it('accepts a complete enquiry', () => {
    expect(validateEnquiry(valid)).toEqual({})
  })

  it('requires name, email and message', () => {
    const errors = validateEnquiry({ ...valid, name: ' ', email: '', message: '' })
    expect(Object.keys(errors).sort()).toEqual(['email', 'message', 'name'])
  })

  it('checks the email format and message length', () => {
    expect(validateEnquiry({ ...valid, email: 'asha@' }).email).toBeTruthy()
    expect(validateEnquiry({ ...valid, message: 'Help' }).message).toBeTruthy()
    expect(validateEnquiry({ ...valid, message: 'x'.repeat(2001) }).message).toBeTruthy()
  })

  it('treats phone as optional but validates it when given', () => {
    expect(validateEnquiry({ ...valid, phone: '' }).phone).toBeUndefined()
    expect(validateEnquiry({ ...valid, phone: 'call me' }).phone).toBeTruthy()
  })
})

describe('payload, honeypot and mailto', () => {
  it('trims fields and drops empty optional ones', () => {
    const p = enquiryPayload({ ...valid, name: '  Asha ', company: '', phone: ' ' })
    expect(p.name).toBe('Asha')
    expect(p.company).toBeUndefined()
    expect(p.phone).toBeUndefined()
    expect(p).not.toHaveProperty('website')
  })

  it('flags filled honeypots as spam', () => {
    expect(isSpam(valid)).toBe(false)
    expect(isSpam({ ...valid, website: 'http://spam' })).toBe(true)
  })

  it('builds a mailto with subject and all details', () => {
    const url = enquiryMailto(valid)
    expect(url.startsWith('mailto:contact@wezigns.com?subject=')).toBe(true)
    const params = new URLSearchParams(url.split('?')[1])
    expect(params.get('subject')).toBe('Enquiry: A new system (Rao Logistics)')
    const body = params.get('body')!
    for (const part of ['three spreadsheets', 'Asha Rao', 'asha@example.com', '+91 98400 12345']) expect(body).toContain(part)
    expect(body).toContain('Marketing emails: No')
  })
})

describe('marketing opt-in', () => {
  it('is off unless the box is ticked, and travels in the payload as a boolean', () => {
    expect(enquiryPayload(valid).marketing).toBe(false)
    expect(enquiryPayload({ ...valid, marketing: true }).marketing).toBe(true)
  })

  it('formats the consent time in IST, across the date line too', () => {
    expect(formatIst(at)).toBe('20 Oct 2026, 14:32 IST')
    expect(formatIst(new Date('2026-12-31T20:00:00Z'))).toBe('1 Jan 2027, 01:30 IST')
  })

  it('records the choice, and for a yes the time and the exact wording', () => {
    expect(marketingLine(false, at)).toBe('Marketing emails: No')
    expect(marketingLine(true, at)).toBe(`Marketing emails: Yes (opted in on 20 Oct 2026, 14:32 IST: '${marketingOptIn.label}')`)
  })

  it('states the choice in the mailto body', () => {
    const body = new URLSearchParams(enquiryMailto({ ...valid, marketing: true }, at).split('?')[1]).get('body')!
    expect(body).toContain(`Marketing emails: Yes (opted in on 20 Oct 2026, 14:32 IST: '${marketingOptIn.label}')`)
  })
})

describe('trackLead', () => {
  const sink = vi.fn()
  beforeEach(() => setAnalyticsSink(sink))
  afterEach(() => {
    setAnalyticsSink(null)
    sink.mockReset()
  })

  it('sends generate_lead with the form and the opt-in choice only, no personal data', () => {
    trackLead('contact_page', { ...valid, marketing: true })
    trackLead('contact_block', valid)
    expect(sink).toHaveBeenNthCalledWith(1, 'generate_lead', { form: 'contact_page', marketing_opt_in: true })
    expect(sink).toHaveBeenNthCalledWith(2, 'generate_lead', { form: 'contact_block', marketing_opt_in: false })
    expect(JSON.stringify(sink.mock.calls)).not.toMatch(/Asha|example\.com|98400|spreadsheets/)
  })

  it('does not count spam', () => {
    trackLead('contact_page', { ...valid, website: 'http://spam' })
    expect(sink).not.toHaveBeenCalled()
  })
})

describe('submitEnquiry', () => {
  const cfg = { method: 'endpoint' as const, endpoint: '/api/enquiry' }
  const reply = (body: unknown, status: number) => new Response(typeof body === 'string' ? body : JSON.stringify(body), { status })
  let fetchSpy: ReturnType<typeof vi.spyOn>
  const open = vi.fn()

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, 'fetch')
    open.mockReset()
  })
  afterEach(() => fetchSpy.mockRestore())

  it('defaults to the /api/enquiry endpoint', () => {
    expect(enquiryConfig).toEqual({ method: 'endpoint', endpoint: '/api/enquiry' })
  })

  it('fakes success for spam without sending anything', async () => {
    const r = await submitEnquiry({ ...valid, website: 'x' }, cfg, { open })
    expect(r.ok).toBe(true)
    expect(fetchSpy).not.toHaveBeenCalled()
    expect(open).not.toHaveBeenCalled()
  })

  it('posts JSON to the endpoint and reports success', async () => {
    fetchSpy.mockResolvedValueOnce(reply({ ok: true }, 200))
    expect(await submitEnquiry(valid, cfg, { open, source: '/about' })).toEqual({ ok: true, via: 'endpoint' })
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/api/enquiry')
    const body = JSON.parse(init.body as string)
    expect(body).toMatchObject({ email: 'asha@example.com', source: '/about' })
    expect(body).not.toHaveProperty('website')
    expect(open).not.toHaveBeenCalled()
  })

  it('falls back to mailto when the function is not configured (503)', async () => {
    fetchSpy.mockResolvedValueOnce(reply({ ok: false, error: 'not-configured' }, 503))
    expect(await submitEnquiry(valid, cfg, { open })).toEqual({ ok: true, via: 'mailto', fallback: true })
    expect(open).toHaveBeenCalledWith(enquiryMailto(valid))
  })

  it('falls back to mailto when there is no function (404) or a 200 that is not our JSON', async () => {
    fetchSpy.mockResolvedValueOnce(reply('Not found', 404))
    expect(await submitEnquiry(valid, cfg, { open })).toEqual({ ok: true, via: 'mailto', fallback: true })
    fetchSpy.mockResolvedValueOnce(reply('<!doctype html>', 200))
    expect(await submitEnquiry(valid, cfg, { open })).toEqual({ ok: true, via: 'mailto', fallback: true })
    expect(open).toHaveBeenCalledTimes(2)
  })

  it('falls back to mailto when the network fails', async () => {
    fetchSpy.mockRejectedValueOnce(new TypeError('Failed to fetch'))
    expect(await submitEnquiry(valid, cfg, { open })).toEqual({ ok: true, via: 'mailto', fallback: true })
    expect(open).toHaveBeenCalledOnce()
  })

  it('shows an error (no mailto) when the server fails to send (500 / 502)', async () => {
    fetchSpy.mockResolvedValueOnce(reply({ ok: false, error: 'send-failed' }, 500))
    const r = await submitEnquiry(valid, cfg, { open })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error).toContain('500')
    fetchSpy.mockResolvedValueOnce(reply({ ok: false, error: 'invalid', fields: ['email'] }, 400))
    expect((await submitEnquiry(valid, cfg, { open })).ok).toBe(false)
    expect(open).not.toHaveBeenCalled()
  })

  it('uses mailto directly when configured that way', async () => {
    expect(await submitEnquiry(valid, { method: 'mailto', endpoint: '' }, { open })).toEqual({ ok: true, via: 'mailto', fallback: false })
    expect(fetchSpy).not.toHaveBeenCalled()
    expect(open).toHaveBeenCalledOnce()
  })
})
