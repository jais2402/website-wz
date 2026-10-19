import { type FormEvent, useRef, useState } from 'react'
import { enquiryTopics } from '@/content/site'
import { type Enquiry, type EnquiryErrors, LIMITS, submitEnquiry, validateEnquiry } from '@/lib/enquiry'
import { EnquiryError, EnquirySent, PrivacyNote, type SendStatus } from './EnquiryForm'

const EMPTY: Enquiry = { name: '', email: '', company: '', phone: '', topics: [], message: '', website: '' }
type Field = keyof EnquiryErrors

/** Full enquiry form for the Contact page: inline validation, honeypot, and sending / success / error states. */
export function ContactForm() {
  const [data, setData] = useState<Enquiry>(EMPTY)
  const [errors, setErrors] = useState<EnquiryErrors>({})
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({})
  const [status, setStatus] = useState<SendStatus>({ kind: 'idle' })
  const formRef = useRef<HTMLFormElement>(null)

  const set = <K extends keyof Enquiry>(k: K, v: Enquiry[K]) => {
    const next = { ...data, [k]: v }
    setData(next)
    // Re-validate a field the visitor has already left, so the error clears as soon as it is fixed.
    if (k in touched) setErrors(validateEnquiry(next))
  }
  const blur = (k: Field) => () => {
    setTouched((t) => ({ ...t, [k]: true }))
    setErrors(validateEnquiry(data))
  }
  const toggleTopic = (t: string) => set('topics', data.topics.includes(t) ? data.topics.filter((x) => x !== t) : [...data.topics, t])

  const send = async () => {
    const found = validateEnquiry(data)
    setErrors(found)
    setTouched({ name: true, email: true, phone: true, message: true })
    const first = (['name', 'email', 'phone', 'message'] as Field[]).find((f) => found[f])
    if (first) {
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus()
      return
    }
    setStatus({ kind: 'sending' })
    const result = await submitEnquiry(data, undefined, { source: 'wezigns.com/contact-us' })
    setStatus(result.ok ? { kind: 'sent', via: result.via } : { kind: 'error', message: result.error })
  }
  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (status.kind !== 'sending') void send()
  }

  const err = (k: Field) => (touched[k] ? errors[k] : undefined)
  const fieldProps = (k: Field) => ({
    name: k,
    id: `cf-${k}`,
    'aria-invalid': !!err(k),
    'aria-describedby': err(k) ? `cf-${k}-error` : undefined,
    onBlur: blur(k),
  })

  if (status.kind === 'sent') {
    return (
      <EnquirySent
        heading="h2"
        name={data.name}
        via={status.via}
        onReset={() => {
          setData(EMPTY)
          setTouched({})
          setErrors({})
          setStatus({ kind: 'idle' })
        }}
      />
    )
  }

  return (
    <form ref={formRef} className="cf ef" noValidate onSubmit={onSubmit} aria-busy={status.kind === 'sending'}>
      <div className="cf-row">
        <div className="cf-field">
          <label htmlFor="cf-name">
            Your name <span aria-hidden="true">*</span>
          </label>
          <input {...fieldProps('name')} autoComplete="name" required maxLength={LIMITS.name} value={data.name} onChange={(e) => set('name', e.target.value)} />
          {err('name') && <span className="cf-error" id="cf-name-error">{err('name')}</span>}
        </div>
        <div className="cf-field">
          <label htmlFor="cf-email">
            Email <span aria-hidden="true">*</span>
          </label>
          <input {...fieldProps('email')} type="email" autoComplete="email" required maxLength={LIMITS.email} value={data.email} onChange={(e) => set('email', e.target.value)} />
          {err('email') && <span className="cf-error" id="cf-email-error">{err('email')}</span>}
        </div>
      </div>

      <div className="cf-row">
        <div className="cf-field">
          <label htmlFor="cf-company">
            Company <em>optional</em>
          </label>
          <input id="cf-company" name="company" autoComplete="organization" maxLength={LIMITS.company} value={data.company} onChange={(e) => set('company', e.target.value)} />
        </div>
        <div className="cf-field">
          <label htmlFor="cf-phone">
            Phone <em>optional</em>
          </label>
          <input {...fieldProps('phone')} type="tel" autoComplete="tel" maxLength={LIMITS.phone} value={data.phone} onChange={(e) => set('phone', e.target.value)} />
          {err('phone') && <span className="cf-error" id="cf-phone-error">{err('phone')}</span>}
        </div>
      </div>

      <fieldset className="cf-topics">
        <legend>I need help with</legend>
        <div className="chip-row">
          {enquiryTopics.map((t) => (
            <button type="button" key={t} className={`chip chip-btn${data.topics.includes(t) ? ' is-on' : ''}`} aria-pressed={data.topics.includes(t)} onClick={() => toggleTopic(t)}>
              {t}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="cf-field">
        <label htmlFor="cf-message">
          What is slowing your team down? <span aria-hidden="true">*</span>
        </label>
        <textarea {...fieldProps('message')} rows={5} required maxLength={LIMITS.message} value={data.message} onChange={(e) => set('message', e.target.value)} />
        {err('message') && <span className="cf-error" id="cf-message-error">{err('message')}</span>}
      </div>

      {/* Honeypot: hidden from people and screen readers; bots tend to fill every field. */}
      <div className="cf-hp" aria-hidden="true">
        <label htmlFor="cf-website">Website</label>
        <input id="cf-website" name="website" tabIndex={-1} autoComplete="off" value={data.website} onChange={(e) => set('website', e.target.value)} />
      </div>

      <div className="cf-foot">
        <button type="submit" className="btn btn-lime btn-lg" disabled={status.kind === 'sending'}>
          {status.kind === 'sending' ? 'Sending…' : 'Send message'} <span aria-hidden="true">→</span>
        </button>
        <span className="cf-note">We reply within one working day.</span>
        <PrivacyNote />
      </div>
      <EnquiryError status={status} onRetry={() => void send()} />
    </form>
  )
}
