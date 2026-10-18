import { brand } from '@/content/site'

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
}

export type EnquiryErrors = Partial<Record<'name' | 'email' | 'phone' | 'message', string>>

/**
 * How enquiries are sent. Decided later by the client:
 * - 'mailto': opens the visitor's email app with everything filled in (no backend).
 * - 'endpoint': POSTs JSON to `endpoint` (a Vercel function, Formspree, Web3Forms, …).
 */
export const enquiryConfig: { method: 'mailto' | 'endpoint'; endpoint: string } = {
  method: 'mailto',
  endpoint: '',
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

/** The JSON body sent to an endpoint. Trimmed, honeypot removed. */
export function enquiryPayload(e: Enquiry) {
  return {
    name: e.name.trim(),
    email: e.email.trim(),
    company: e.company.trim() || undefined,
    phone: e.phone.trim() || undefined,
    topics: e.topics,
    message: e.message.trim(),
    source: 'wezigns.com/contact',
  }
}

export function enquiryMailto(e: Enquiry): string {
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
  ].filter((l, i, a) => l !== '' || a[i - 1] !== '')
  return `mailto:${brand.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`
}

export type SubmitResult = { ok: true; via: 'mailto' | 'endpoint' } | { ok: false; error: string }

export async function submitEnquiry(e: Enquiry, config = enquiryConfig): Promise<SubmitResult> {
  // Bots that fill the honeypot get a fake success and nothing is sent.
  if (isSpam(e)) return { ok: true, via: config.method }

  if (config.method === 'endpoint' && config.endpoint) {
    try {
      const res = await fetch(config.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(enquiryPayload(e)),
      })
      return res.ok ? { ok: true, via: 'endpoint' } : { ok: false, error: `The server replied ${res.status}.` }
    } catch {
      return { ok: false, error: 'We could not reach the server. Check your connection and try again.' }
    }
  }

  window.location.href = enquiryMailto(e)
  return { ok: true, via: 'mailto' }
}
