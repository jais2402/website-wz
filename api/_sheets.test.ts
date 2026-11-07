// @vitest-environment node
// Underscore prefix: Vercel does not deploy this file as a function.
import { createVerify, generateKeyPairSync } from 'node:crypto'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  SHEET_HEADER,
  handleEnquiry,
  resetRateLimit,
  resetSheetToken,
  sheetConfig,
  sheetRow,
  signedAssertion,
} from './enquiry.ts'

const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 })
const pem = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString()

// As the key arrives from an env file: one line, with literal \n.
const sheetEnv = {
  GOOGLE_SHEETS_CLIENT_EMAIL: 'sheets-writer@example.iam.gserviceaccount.com',
  GOOGLE_SHEETS_PRIVATE_KEY: pem.replace(/\n/g, '\\n'),
  GOOGLE_SHEET_ID: 'sheet-123',
  GOOGLE_SHEET_TAB_NAME: 'Contact_Form',
}

const valid = {
  name: 'Asha Rao',
  email: 'asha@example.com',
  company: 'Rao Logistics',
  phone: '+91 98400 12345',
  topics: ['A website', 'A software product'],
  message: '=HYPERLINK("http://evil") our orders live in three spreadsheets.',
  marketing: false,
  source: 'wezigns.com/contact-us',
}

const post = (body: unknown) =>
  new Request('https://wezigns.com/api/enquiry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'https://www.wezigns.com' },
    body: JSON.stringify(body),
  })

type Call = { url: string; init?: RequestInit }

/** A fake Google: token, header read (empty or not) and append; `fail` makes the append fail. */
function fakeGoogle({ empty = true, fail = false, resend = true } = {}) {
  const calls: Call[] = []
  const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
    calls.push({ url, init })
    if (url.startsWith('https://oauth2.googleapis.com/token')) return Response.json({ access_token: 'tok', expires_in: 3600 })
    if (url.includes(':append')) return fail ? new Response('nope', { status: 403 }) : Response.json({})
    if (url.includes('sheets.googleapis.com')) return Response.json(empty ? {} : { values: [['Received (IST)']] })
    if (url.startsWith('https://api.resend.com')) return resend ? Response.json({ id: 'e1' }) : new Response('down', { status: 500 })
    throw new Error(`unexpected ${url}`)
  })
  vi.stubGlobal('fetch', fetchMock)
  return calls
}

beforeEach(() => {
  resetRateLimit()
  resetSheetToken()
  vi.spyOn(console, 'error').mockImplementation(() => {})
})
afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('sheetConfig', () => {
  it('needs the email, key and sheet id; the tab defaults to Contact_Form', () => {
    expect(sheetConfig({})).toBeNull()
    expect(sheetConfig({ ...sheetEnv, GOOGLE_SHEET_ID: '' })).toBeNull()
    const cfg = sheetConfig({ ...sheetEnv, GOOGLE_SHEET_TAB_NAME: undefined })!
    expect(cfg.tab).toBe('Contact_Form')
    // Literal \n from the env file become real line breaks.
    expect(cfg.privateKey).toContain('-----BEGIN PRIVATE KEY-----\n')
  })
})

describe('signedAssertion', () => {
  it('is an RS256 JWT for the Sheets scope that the service account key verifies', () => {
    const jwt = signedAssertion(sheetConfig(sheetEnv)!, 1_800_000_000)
    const [head, claims, sig] = jwt.split('.')
    const verifier = createVerify('RSA-SHA256')
    verifier.update(`${head}.${claims}`)
    expect(verifier.verify(publicKey, Buffer.from(sig, 'base64url'))).toBe(true)
    const c = JSON.parse(Buffer.from(claims, 'base64url').toString())
    expect(c).toMatchObject({
      iss: sheetEnv.GOOGLE_SHEETS_CLIENT_EMAIL,
      scope: 'https://www.googleapis.com/auth/spreadsheets',
      aud: 'https://oauth2.googleapis.com/token',
      exp: 1_800_000_000 + 3600,
    })
  })
})

describe('enquiries into the Sheet', () => {
  it('writes the header row first on an empty tab, then the enquiry, as RAW text', async () => {
    const calls = fakeGoogle({ empty: true })
    const res = await handleEnquiry(post(valid), sheetEnv)
    expect(res.status).toBe(200)
    const append = calls.find((c) => c.url.includes(':append'))!
    expect(append.url).toContain('valueInputOption=RAW')
    expect(decodeURIComponent(append.url)).toContain("'Contact_Form'!A1")
    const { values } = JSON.parse(String(append.init!.body))
    expect(values[0]).toEqual(SHEET_HEADER)
    expect(values[1]).toHaveLength(SHEET_HEADER.length)
    expect(values[1].slice(1, 3)).toEqual(['Asha Rao', 'asha@example.com'])
    expect(values[1][5]).toBe('A website, A software product')
  })

  it('appends only the enquiry once the header is there', async () => {
    const calls = fakeGoogle({ empty: false })
    await handleEnquiry(post(valid), sheetEnv)
    const { values } = JSON.parse(String(calls.find((c) => c.url.includes(':append'))!.init!.body))
    expect(values).toHaveLength(1)
  })

  it('works with the Sheet alone, without Resend', async () => {
    fakeGoogle()
    expect((await handleEnquiry(post(valid), sheetEnv)).status).toBe(200)
  })

  it('still succeeds when one of email and Sheet fails, and fails only when both do', async () => {
    const both = { ...sheetEnv, RESEND_API_KEY: 're_test' }
    fakeGoogle({ fail: true, resend: true })
    expect((await handleEnquiry(post(valid), both)).status).toBe(200)
    resetRateLimit()
    fakeGoogle({ fail: false, resend: false })
    expect((await handleEnquiry(post(valid), both)).status).toBe(200)
    resetRateLimit()
    fakeGoogle({ fail: true, resend: false })
    const res = await handleEnquiry(post(valid), both)
    expect(res.status).toBe(502)
    expect(await res.json()).toEqual({ ok: false, error: 'send-failed' })
  })

  it('reuses the access token on a warm instance', async () => {
    const calls = fakeGoogle()
    await handleEnquiry(post(valid), sheetEnv)
    resetRateLimit()
    await handleEnquiry(post(valid), sheetEnv)
    expect(calls.filter((c) => c.url.includes('oauth2')).length).toBe(1)
  })

  it('keeps the row in header order', () => {
    const row = sheetRow({ ...valid, marketing: true }, new Date('2026-10-20T09:02:00Z'))
    expect(row[0]).toBe('20 Oct 2026, 14:32 IST')
    expect(row[7]).toMatch(/^Yes \(opted in on 20 Oct 2026, 14:32 IST/)
    expect(row[8]).toBe('wezigns.com/contact-us')
  })
})
