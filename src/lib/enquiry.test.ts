import { type Enquiry, enquiryMailto, enquiryPayload, isSpam, submitEnquiry, validateEnquiry } from './enquiry'

const valid: Enquiry = {
  name: 'Asha Rao',
  email: 'asha@example.com',
  company: 'Rao Logistics',
  phone: '+91 98400 12345',
  topics: ['A new system'],
  message: 'Our orders live in three spreadsheets.',
  website: '',
}

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
  })
})

describe('submitEnquiry', () => {
  it('fakes success for spam without sending anything', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const r = await submitEnquiry({ ...valid, website: 'x' }, { method: 'endpoint', endpoint: '/api/enquiry' })
    expect(r.ok).toBe(true)
    expect(fetchSpy).not.toHaveBeenCalled()
    fetchSpy.mockRestore()
  })

  it('posts JSON to the endpoint and reports failures', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response('{}', { status: 200 }))
    expect(await submitEnquiry(valid, { method: 'endpoint', endpoint: '/api/enquiry' })).toEqual({ ok: true, via: 'endpoint' })
    const body = JSON.parse((fetchSpy.mock.calls[0][1] as RequestInit).body as string)
    expect(body.email).toBe('asha@example.com')

    fetchSpy.mockResolvedValueOnce(new Response('nope', { status: 500 }))
    expect((await submitEnquiry(valid, { method: 'endpoint', endpoint: '/api/enquiry' })).ok).toBe(false)
    fetchSpy.mockRestore()
  })
})
