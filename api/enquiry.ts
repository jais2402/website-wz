// Vercel Function: POST /api/enquiry → validates the enquiry, emails it to Wezigns through Resend and adds it as a
// row in the enquiries Google Sheet (bottom of this file). Either one is enough: the visitor sees success when at least one
// configured destination took the enquiry, so a lead is never lost to one service being down.
// Dependency-free (web-standard Request/Response/fetch, node:crypto). Env: RESEND_API_KEY, ENQUIRY_TO, ENQUIRY_FROM,
// and the GOOGLE_SHEETS_* / GOOGLE_SHEET_* settings below.
// One file on purpose: Vercel bundles the function from this file alone, and a local import (`./_sheets.ts`) crashed
// it on load in production (FUNCTION_INVOCATION_FAILED on every request). api/_enquiry.test.ts keeps it import-free.
// Validation mirrors src/lib/enquiry.ts (duplicated on purpose: that file imports site copy through the
// `@/` alias, which the function bundle cannot resolve). api/_enquiry.test.ts keeps the two in step.

import { createSign } from 'node:crypto'

export const LIMITS = { name: 80, email: 120, company: 120, phone: 30, message: 2000, minMessage: 10, topic: 60, topics: 10, source: 60 }
const MAX_BODY = 16 * 1024

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PHONE_RE = /^[+()\d\s-]{6,}$/

/** The exact opt-in wording on both forms (marketingOptIn.label in src/content/site.ts; the test checks they match). */
export const MARKETING_WORDING = 'Email me occasional updates from Wezigns. You can unsubscribe at any time.'
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** '20 Oct 2026, 14:32 IST' (IST is always UTC+5:30). Mirrors formatIst in src/lib/enquiry.ts. */
export function formatIst(date: Date): string {
  const d = new Date(date.getTime() + 330 * 60_000)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}, ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())} IST`
}

/** The record of the marketing choice. The time is when the server received the enquiry. */
export const marketingLine = (marketing: boolean, at: Date) =>
  marketing ? `Yes (opted in on ${formatIst(at)}: '${MARKETING_WORDING}')` : 'No'

export type CleanEnquiry = {
  name: string
  email: string
  company: string
  phone: string
  topics: string[]
  message: string
  /** Opted in to marketing emails. Anything but a literal `true` counts as no. */
  marketing: boolean
  source: string
}

type Env = Record<string, string | undefined>

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  })

const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '')
// One line only: used in the subject, so no line breaks.
const line = (v: string) => v.replace(/[\r\n]+/g, ' ')

/** Server-side check. Returns the cleaned enquiry, or the names of the fields that failed. */
export function parseEnquiry(input: unknown): { ok: true; value: CleanEnquiry } | { ok: false; fields: string[] } {
  const o = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>
  const v: CleanEnquiry = {
    name: line(str(o.name)),
    email: str(o.email),
    company: line(str(o.company)),
    phone: str(o.phone),
    topics: Array.isArray(o.topics) ? o.topics.map(str).filter(Boolean).map(line) : [],
    message: str(o.message),
    marketing: o.marketing === true,
    source: line(str(o.source)),
  }
  const fields: string[] = []
  if (!v.name || v.name.length > LIMITS.name) fields.push('name')
  if (!v.email || v.email.length > LIMITS.email || !EMAIL_RE.test(v.email)) fields.push('email')
  if (v.company.length > LIMITS.company) fields.push('company')
  if (v.phone && (v.phone.length > LIMITS.phone || !PHONE_RE.test(v.phone))) fields.push('phone')
  if (v.message.length < LIMITS.minMessage || v.message.length > LIMITS.message) fields.push('message')
  if (v.topics.length > LIMITS.topics || v.topics.some((t) => t.length > LIMITS.topic)) fields.push('topics')
  if (v.source.length > LIMITS.source) fields.push('source')
  return fields.length ? { ok: false, fields } : { ok: true, value: v }
}

export const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

export function enquiryEmail(e: CleanEnquiry, receivedAt = new Date()) {
  const subject = line(`Enquiry: ${e.topics.length ? e.topics.join(', ') : 'General'}${e.company ? ` (${e.company})` : ''} from ${e.name}`)
  const rows: [string, string][] = [
    ['Name', e.name],
    ['Email', e.email],
    ['Company', e.company],
    ['Phone', e.phone],
    ['Help with', e.topics.join(', ')],
    ['Sent from', e.source],
    ['Marketing emails', marketingLine(e.marketing, receivedAt)],
  ]
  const filled = rows.filter(([, val]) => val)
  const html = [
    '<div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.5;color:#111">',
    '<table cellpadding="4" style="border-collapse:collapse">',
    ...filled.map(([k, val]) => `<tr><td style="color:#666;padding-right:16px">${k}</td><td>${escapeHtml(val)}</td></tr>`),
    '</table>',
    `<p style="white-space:pre-wrap;margin-top:20px">${escapeHtml(e.message)}</p>`,
    '<p style="color:#888;font-size:13px">Reply to this email to answer the visitor directly.</p>',
    '</div>',
  ].join('')
  const text = [...filled.map(([k, val]) => `${k}: ${val}`), '', e.message].join('\n')
  return { subject, html, text }
}

/** The enquiry as a Sheet row, in the order of SHEET_HEADER below. */
export const sheetRow = (e: CleanEnquiry, receivedAt: Date) => [
  formatIst(receivedAt),
  e.name,
  e.email,
  e.company,
  e.phone,
  e.topics.join(', '),
  e.message,
  marketingLine(e.marketing, receivedAt),
  e.source,
]

// Browsers send Origin on every POST from a page. Only the site itself (any host it is served from, e.g. a Vercel
// preview) and local development may post. This stops other sites from using the form as a mail relay.
const ALLOWED_ORIGINS = new Set(['https://www.wezigns.com', 'https://wezigns.com'])
const LOCAL_ORIGIN = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/

export function originAllowed(origin: string | null, requestUrl: string): boolean {
  if (!origin) return false
  if (ALLOWED_ORIGINS.has(origin) || LOCAL_ORIGIN.test(origin)) return true
  try {
    return origin === new URL(requestUrl).origin
  } catch {
    return false
  }
}

// Best-effort per-IP limit (per function instance, so it only slows a burst down). The firm limit is a Vercel
// Firewall rate-limit rule on /api/enquiry: see docs/enquiry-setup.md.
export const RATE = { max: 5, windowMs: 10 * 60_000 }
const hits = new Map<string, number[]>()

export function rateLimited(ip: string, now = Date.now()): boolean {
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE.windowMs)
  const limited = recent.length >= RATE.max
  if (!limited) recent.push(now)
  hits.set(ip, recent)
  // Keep the map small on a long-lived instance.
  if (hits.size > 5000) hits.clear()
  return limited
}

export const resetRateLimit = () => hits.clear()

const clientIp = (request: Request) => (request.headers.get('x-forwarded-for') ?? '').split(',')[0].trim()

export async function handleEnquiry(request: Request, env: Env = process.env): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ ok: false, error: 'method-not-allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json; charset=utf-8', Allow: 'POST' },
    })
  }
  if (!originAllowed(request.headers.get('origin'), request.url)) return json({ ok: false, error: 'forbidden-origin' }, 403)
  const ip = clientIp(request)
  if (ip && rateLimited(ip)) return json({ ok: false, error: 'rate-limited' }, 429)
  if (!(request.headers.get('content-type') ?? '').includes('application/json')) return json({ ok: false, error: 'unsupported-type' }, 415)
  if (Number(request.headers.get('content-length') ?? 0) > MAX_BODY) return json({ ok: false, error: 'too-large' }, 413)

  let raw: string
  try {
    raw = await request.text()
  } catch {
    return json({ ok: false, error: 'bad-request' }, 400)
  }
  // Content-Length can be missing or wrong, so check the real size too.
  if (raw.length > MAX_BODY) return json({ ok: false, error: 'too-large' }, 413)

  let body: unknown
  try {
    body = JSON.parse(raw)
  } catch {
    return json({ ok: false, error: 'bad-json' }, 400)
  }

  // Honeypot filled: pretend it worked so bots learn nothing.
  if (body && typeof body === 'object' && str((body as Record<string, unknown>).website)) return json({ ok: true })

  const parsed = parseEnquiry(body)
  if (!parsed.ok) return json({ ok: false, error: 'invalid', fields: parsed.fields }, 400)

  const key = env.RESEND_API_KEY
  const sheet = sheetConfig(env)
  if (!key && !sheet) return json({ ok: false, error: 'not-configured' }, 503)

  const receivedAt = new Date()
  const sendEmail = async () => {
    const { subject, html, text } = enquiryEmail(parsed.value, receivedAt)
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: env.ENQUIRY_FROM || 'Wezigns website <website@wezigns.com>',
          to: (env.ENQUIRY_TO || 'contact@wezigns.com').split(',').map((s) => s.trim()).filter(Boolean),
          reply_to: parsed.value.email,
          subject,
          html,
          text,
        }),
      })
      if (res.ok) return true
      // Log the status and Resend's reason (no visitor data) for the Vercel logs.
      console.error('enquiry: resend replied', res.status, (await res.text()).slice(0, 300))
    } catch (err) {
      console.error('enquiry: resend unreachable', err instanceof Error ? err.message : err)
    }
    return false
  }
  const saveRow = async () => {
    try {
      await appendRow(sheet!, sheetRow(parsed.value, receivedAt))
      return true
    } catch (err) {
      // Google's reason only (no visitor data), for the Vercel logs.
      console.error('enquiry: sheet failed', err instanceof Error ? err.message : err)
      return false
    }
  }

  const results = await Promise.all([key ? sendEmail() : null, sheet ? saveRow() : null])
  if (!results.some((r) => r === true)) return json({ ok: false, error: 'send-failed' }, 502)
  return json({ ok: true })
}

// Vercel Function: a named POST export with web-standard Request/Response. Other methods get 405 from the platform.
export function POST(request: Request) {
  return handleEnquiry(request)
}

// ---------------------------------------------------------------------------------------------------------------
// Google Sheet: appends each enquiry as a row, through a service account with Editor access on that Sheet. The
// service-account JWT is signed with node:crypto and exchanged for an access token, then the row goes in through the
// Sheets REST API. Env: GOOGLE_SHEETS_CLIENT_EMAIL, GOOGLE_SHEETS_PRIVATE_KEY, GOOGLE_SHEET_ID,
// GOOGLE_SHEET_TAB_NAME (default Contact_Form).

export type SheetConfig = { clientEmail: string; privateKey: string; sheetId: string; tab: string }

/** The Sheet settings, or null when any required one is missing (then the Sheet is simply skipped). */
export function sheetConfig(env: Env): SheetConfig | null {
  const clientEmail = env.GOOGLE_SHEETS_CLIENT_EMAIL?.trim()
  // Env files and the Vercel dashboard keep the key's line breaks as literal \n.
  const privateKey = env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n').trim()
  const sheetId = env.GOOGLE_SHEET_ID?.trim()
  if (!clientEmail || !privateKey || !sheetId) return null
  return { clientEmail, privateKey, sheetId, tab: env.GOOGLE_SHEET_TAB_NAME?.trim() || 'Contact_Form' }
}

export const SHEET_HEADER = ['Received (IST)', 'Name', 'Email', 'Company', 'Phone', 'Help with', 'Message', 'Marketing emails', 'Sent from']

const b64url = (s: string | Buffer) => Buffer.from(s).toString('base64url')

/** A signed service-account assertion for the Sheets scope, valid for one hour. */
export function signedAssertion(cfg: SheetConfig, nowSec = Math.floor(Date.now() / 1000)): string {
  const head = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const claims = b64url(
    JSON.stringify({
      iss: cfg.clientEmail,
      scope: 'https://www.googleapis.com/auth/spreadsheets',
      aud: 'https://oauth2.googleapis.com/token',
      iat: nowSec,
      exp: nowSec + 3600,
    }),
  )
  const signer = createSign('RSA-SHA256')
  signer.update(`${head}.${claims}`)
  return `${head}.${claims}.${b64url(signer.sign(cfg.privateKey))}`
}

// One token per warm function instance, refreshed a minute before it runs out.
let cached: { token: string; until: number; key: string } | null = null
export const resetSheetToken = () => {
  cached = null
}

async function accessToken(cfg: SheetConfig): Promise<string> {
  const now = Date.now()
  if (cached && cached.key === cfg.clientEmail && cached.until > now) return cached.token
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: signedAssertion(cfg) }),
    signal: AbortSignal.timeout(8000),
  })
  if (!res.ok) throw new Error(`token ${res.status} ${(await res.text()).slice(0, 200)}`)
  const body = (await res.json()) as { access_token: string; expires_in?: number }
  cached = { token: body.access_token, until: now + ((body.expires_in ?? 3600) - 60) * 1000, key: cfg.clientEmail }
  return body.access_token
}

const range = (cfg: SheetConfig, cells: string) => encodeURIComponent(`'${cfg.tab.replace(/'/g, "''")}'!${cells}`)

/**
 * Adds one row (and the header row first, if the tab is still empty). Values go in RAW, so a visitor's text that
 * starts with "=" stays text and never runs as a formula.
 */
export async function appendRow(cfg: SheetConfig, row: string[]): Promise<void> {
  const token = await accessToken(cfg)
  const base = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(cfg.sheetId)}/values`
  const auth = { Authorization: `Bearer ${token}` }

  const head = await fetch(`${base}/${range(cfg, 'A1:A1')}`, { headers: auth, signal: AbortSignal.timeout(8000) })
  if (!head.ok) throw new Error(`read ${head.status} ${(await head.text()).slice(0, 200)}`)
  const empty = !((await head.json()) as { values?: unknown[] }).values?.length

  const res = await fetch(`${base}/${range(cfg, 'A1')}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, {
    method: 'POST',
    headers: { ...auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ values: empty ? [SHEET_HEADER, row] : [row] }),
    signal: AbortSignal.timeout(8000),
  })
  if (!res.ok) throw new Error(`append ${res.status} ${(await res.text()).slice(0, 200)}`)
}
