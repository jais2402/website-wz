import { brand } from '@/content/site'

/** Builds a mailto: URL from the enquiry. Nothing is sent anywhere until the visitor sends it from their own mail app. */
export function buildMailto(topics: string[], name: string, message: string): string {
  const subject = `Enquiry: ${topics.length ? topics.join(', ') : 'General'}`
  const body = [`Hi Wezigns,`, '', message.trim() || '(Tell us what is not working)', '', name ? `— ${name}` : ''].join('\n')
  return `mailto:${brand.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}
