// Vercel Function: POST /api/enquiry → validates the enquiry and emails it to Wezigns through Resend.
// Dependency-free (web-standard Request/Response/fetch). Env: RESEND_API_KEY, ENQUIRY_TO, ENQUIRY_FROM.
// Validation mirrors src/lib/enquiry.ts (duplicated on purpose: that file imports site copy through the
// `@/` alias, which the function bundle cannot resolve). api/_enquiry.test.ts keeps the two in step.

export const LIMITS = { name: 80, email: 120, company: 120, phone: 30, message: 2000, minMessage: 10, topic: 60, topics: 10, source: 60 }
const MAX_BODY = 16 * 1024

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PHONE_RE = /^[+()\d\s-]{6,}$/

export type CleanEnquiry = {
  name: string
  email: string
  company: string
  phone: string
  topics: string[]
  message: string
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

export function enquiryEmail(e: CleanEnquiry) {
  const subject = line(`Enquiry: ${e.topics.length ? e.topics.join(', ') : 'General'}${e.company ? ` (${e.company})` : ''} from ${e.name}`)
  const rows: [string, string][] = [
    ['Name', e.name],
    ['Email', e.email],
    ['Company', e.company],
    ['Phone', e.phone],
    ['Help with', e.topics.join(', ')],
    ['Sent from', e.source],
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

export async function handleEnquiry(request: Request, env: Env = process.env): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ ok: false, error: 'method-not-allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json; charset=utf-8', Allow: 'POST' },
    })
  }
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
  if (!key) return json({ ok: false, error: 'not-configured' }, 503)

  const { subject, html, text } = enquiryEmail(parsed.value)
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
    if (!res.ok) {
      // Log the status and Resend's reason (no visitor data) for the Vercel logs.
      console.error('enquiry: resend replied', res.status, (await res.text()).slice(0, 300))
      return json({ ok: false, error: 'send-failed' }, 502)
    }
  } catch (err) {
    console.error('enquiry: resend unreachable', err instanceof Error ? err.message : err)
    return json({ ok: false, error: 'send-failed' }, 502)
  }
  return json({ ok: true })
}

// Vercel Function: a named POST export with web-standard Request/Response. Other methods get 405 from the platform.
export function POST(request: Request) {
  return handleEnquiry(request)
}
