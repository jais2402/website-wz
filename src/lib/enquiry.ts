import { brand, marketingOptIn } from '@/content/site'
import { track } from '@/lib/analytics'

// Contact-page enquiry: validation, spam check and the (switchable) way it is sent. Pure apart from submitEnquiry.

export type Enquiry = {
  name: string
  email: string
  company: string
  phone: string
  topics: string[]
  message: string
  /** Hidden honeypot field. Real people leave it empty. */
  website: string
  /** The separate, optional, unticked "email me occasional updates" box. Not needed to send the enquiry. */
  marketing: boolean
}

export type EnquiryErrors = Partial<Record<'name' | 'email' | 'phone' | 'message', string>>

/**
 * How enquiries are sent:
 * - 'endpoint' (default): POSTs JSON to `endpoint` (the Vercel function in api/enquiry.ts). If the function is not
 *   there or not set up yet (404, 405, 501, 503, network failure), it falls back to mailto so nothing is lost.
 * - 'mailto': opens the visitor's email app with everything filled in (no backend).
 */
export const enquiryConfig: { method: 'mailto' | 'endpoint'; endpoint: string } = {
  method: 'endpoint',
  endpoint: '/api/enquiry',
}

export const LIMITS = { name: 80, email: 120, company: 120, phone: 30, message: 2000, minMessage: 10 }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PHONE_RE = /^[+()\d\s-]{6,}$/

export function validateEnquiry(e: Enquiry): EnquiryErrors {
  const errors: EnquiryErrors = {}
  const name = e.name.trim()
  const email = e.email.trim()
  const phone = e.phone.trim()
  const message = e.message.trim()

  if (!name) errors.name = 'Please tell us your name.'
  else if (name.length > LIMITS.name) errors.name = `Please keep your name under ${LIMITS.name} characters.`

  if (!email) errors.email = 'Please add your email so we can reply.'
  else if (!EMAIL_RE.test(email) || email.length > LIMITS.email) errors.email = 'That email address does not look right.'

  if (phone && !PHONE_RE.test(phone)) errors.phone = 'Use digits, spaces, + or - only.'

  if (!message) errors.message = 'Tell us a little about what is not working.'
  else if (message.length < LIMITS.minMessage) errors.message = `A few more words, please (at least ${LIMITS.minMessage} characters).`
  else if (message.length > LIMITS.message) errors.message = `Please keep it under ${LIMITS.message} characters.`

  return errors
}

export const isSpam = (e: Enquiry) => e.website.trim().length > 0

/**
 * Records a sent enquiry as a GA4 'generate_lead' event (a no-op until the visitor accepts analytics). Sends only which
 * form it was and the opt-in choice, never personal data. Call it after a successful submit (endpoint or mailto).
 */
export function trackLead(form: 'contact_page' | 'contact_block', e: Enquiry) {
  if (!isSpam(e)) track('generate_lead', { form, marketing_opt_in: e.marketing === true })
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** '20 Oct 2026, 14:32 IST'. India has no daylight saving, so IST is always UTC+5:30. Mirrored in api/enquiry.ts. */
export function formatIst(date: Date): string {
  const d = new Date(date.getTime() + 330 * 60_000)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}, ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())} IST`
}

/** The consent record in the enquiry email: the choice, and for a yes, when and to which exact wording. */
export function marketingLine(marketing: boolean, at: Date, wording = marketingOptIn.label): string {
  return marketing ? `Marketing emails: Yes (opted in on ${formatIst(at)}: '${wording}')` : 'Marketing emails: No'
}

/** The JSON body sent to an endpoint. Trimmed, honeypot removed. `source` says which form sent it. */
export function enquiryPayload(e: Enquiry, source = 'wezigns.com/contact-us') {
  return {
    name: e.name.trim(),
    email: e.email.trim(),
    company: e.company.trim() || undefined,
    phone: e.phone.trim() || undefined,
    topics: e.topics,
    message: e.message.trim(),
    marketing: e.marketing === true,
    source,
  }
}

export function enquiryMailto(e: Enquiry, now = new Date()): string {
  const p = enquiryPayload(e)
  const subject = `Enquiry: ${p.topics.length ? p.topics.join(', ') : 'General'}${p.company ? ` (${p.company})` : ''}`
  const lines = [
    'Hi Wezigns,',
    '',
    p.message,
    '',
    `— ${p.name}`,
    p.company ? `Company: ${p.company}` : '',
    `Email: ${p.email}`,
    p.phone ? `Phone: ${p.phone}` : '',
    '',
    marketingLine(p.marketing, now),
  ].filter((l, i, a) => l !== '' || a[i - 1] !== '')
  return `mailto:${brand.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`
}

export type SubmitResult =
  | { ok: true; via: 'endpoint' }
  /** `fallback` is true when the endpoint was tried first and could not take the message. */
  | { ok: true; via: 'mailto'; fallback: boolean }
  | { ok: false; error: string }

type SubmitOptions = { source?: string; open?: (url: string) => void; timeoutMs?: number }

// Statuses that mean "no working function here" rather than "your message failed": hand over to mailto.
const FALLBACK_STATUS = new Set([404, 405, 501, 503])

const openUrl = (url: string) => {
  window.location.href = url
}

export async function submitEnquiry(e: Enquiry, config = enquiryConfig, opts: SubmitOptions = {}): Promise<SubmitResult> {
  const open = opts.open ?? openUrl
  // Bots that fill the honeypot get a fake success and nothing is sent.
  if (isSpam(e)) return config.method === 'endpoint' ? { ok: true, via: 'endpoint' } : { ok: true, via: 'mailto', fallback: false }

  const mailto = (fallback: boolean): SubmitResult => {
    open(enquiryMailto(e))
    return { ok: true, via: 'mailto', fallback }
  }

  if (config.method !== 'endpoint' || !config.endpoint) return mailto(false)

  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), opts.timeoutMs ?? 15000)
  let res: Response
  try {
    res = await fetch(config.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(enquiryPayload(e, opts.source)),
      signal: ctrl.signal,
    })
  } catch (err) {
    // A timeout may still have reached us, so do not open a second copy in the mail app.
    if (err instanceof DOMException && err.name === 'AbortError') {
      return { ok: false, error: 'The server took too long to answer. Please try again in a moment.' }
    }
    return mailto(true)
  } finally {
    clearTimeout(timer)
  }

  if (FALLBACK_STATUS.has(res.status)) return mailto(true)

  const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null
  if (res.ok) {
    // A 200 that is not our JSON (e.g. a static host answering with index.html) means there is no function.
    return data?.ok ? { ok: true, via: 'endpoint' } : mailto(true)
  }
  if (res.status === 400 && data?.error === 'invalid') return { ok: false, error: 'Some details did not pass our check. Please review the form and try again.' }
  if (res.status === 413) return { ok: false, error: `Your message is too long. Please keep it under ${LIMITS.message} characters.` }
  return { ok: false, error: `We could not send your message just now (error ${res.status}).` }
}
