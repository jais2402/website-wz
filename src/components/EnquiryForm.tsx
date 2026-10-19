import { type FormEvent, useEffect, useId, useRef, useState } from 'react'
import { brand, enquiryTopics, marketingOptIn, privacyNotice } from '@/content/site'
import { type Enquiry, type EnquiryErrors, LIMITS, submitEnquiry, trackLead, validateEnquiry } from '@/lib/enquiry'
import './enquiry.css'

export type SendStatus =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'sent'; via: 'endpoint' | 'mailto' }
  | { kind: 'error'; message: string }

const firstName = (name: string) => name.trim().split(/\s+/)[0] || 'there'

/** Success panel shared by both enquiry forms. Takes focus so keyboard and screen-reader users land on it. */
export function EnquirySent({
  name,
  via,
  onReset,
  heading: Heading = 'h3',
}: {
  name: string
  via: 'endpoint' | 'mailto'
  onReset: () => void
  heading?: 'h2' | 'h3'
}) {
  const ref = useRef<HTMLHeadingElement>(null)
  useEffect(() => ref.current?.focus(), [])
  return (
    <div className="ef-done" role="status">
      <span className="ef-done-icon" aria-hidden="true">
        ✓
      </span>
      <Heading ref={ref} tabIndex={-1}>
        Thanks, {firstName(name)}.
      </Heading>
      {via === 'endpoint' ? (
        <p>Your message is with us. We reply within one working day.</p>
      ) : (
        <p>
          Your email app should have opened with your message ready. Press send there and we reply within one working
          day. If nothing opened, write to <a href={`mailto:${brand.email}`}>{brand.email}</a> or call{' '}
          <a href={brand.phoneHref}>{brand.phone}</a>.
        </p>
      )}
      <button type="button" className="btn btn-ghost" onClick={onReset}>
        Send another message
      </button>
    </div>
  )
}

/** Error area shared by both forms. Always rendered so the live region exists before the message arrives. */
export function EnquiryError({ status, onRetry }: { status: SendStatus; onRetry: () => void }) {
  return (
    <div className="ef-error-box" role="alert">
      {status.kind === 'error' && (
        <>
          <p>{status.message}</p>
          <p className="ef-error-alt">
            <button type="button" className="ef-retry" onClick={onRetry}>
              Try again
            </button>{' '}
            or reach us directly: <a href={`mailto:${brand.email}`}>{brand.email}</a>
            <span className="ef-sep" aria-hidden="true" />
            <a href={brand.phoneHref}>{brand.phone}</a>
          </p>
        </>
      )}
    </div>
  )
}

/** The one-line privacy notice beside each form's submit button. */
export function PrivacyNote() {
  return (
    <p className="ef-privacy">
      {privacyNotice.text} <a href={privacyNotice.link.href}>{privacyNotice.link.label}</a>.
    </p>
  )
}

/**
 * The optional, unticked marketing opt-in shared by both forms. Its own labelled checkbox, separate from sending the
 * enquiry: leaving it unticked changes nothing about the enquiry.
 */
export function MarketingOptIn({
  id,
  checked,
  onChange,
}: {
  id: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <div className="ef-optin">
      <input
        type="checkbox"
        id={id}
        name="marketing"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        aria-describedby={`${id}-hint`}
      />
      <label htmlFor={id}>
        {marketingOptIn.label}
        <span className="ef-optin-hint" id={`${id}-hint`}>
          {marketingOptIn.hint}
        </span>
      </label>
    </div>
  )
}

const EMPTY: Enquiry = {
  name: '',
  email: '',
  company: '',
  phone: '',
  topics: [],
  message: '',
  website: '',
  marketing: false,
}
type Field = 'name' | 'email' | 'message'
const FIELDS: Field[] = ['name', 'email', 'message']

/** Short enquiry form in the contact block on every page. Sends through /api/enquiry (mailto fallback). */
export function EnquiryForm() {
  const uid = useId()
  const [data, setData] = useState<Enquiry>(EMPTY)
  const [errors, setErrors] = useState<EnquiryErrors>({})
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({})
  const [status, setStatus] = useState<SendStatus>({ kind: 'idle' })
  const formRef = useRef<HTMLFormElement>(null)

  const set = <K extends keyof Enquiry>(k: K, v: Enquiry[K]) => {
    const next = { ...data, [k]: v }
    setData(next)
    if (k in touched) setErrors(validateEnquiry(next))
  }
  const toggle = (t: string) =>
    set('topics', data.topics.includes(t) ? data.topics.filter((x) => x !== t) : [...data.topics, t])

  const send = async () => {
    const found = validateEnquiry(data)
    setErrors(found)
    setTouched({ name: true, email: true, message: true })
    const first = FIELDS.find((f) => found[f])
    if (first) {
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus()
      return
    }
    setStatus({ kind: 'sending' })
    const result = await submitEnquiry(data, undefined, { source: `${location.pathname} (contact block)` })
    if (result.ok) trackLead('contact_block', data)
    setStatus(result.ok ? { kind: 'sent', via: result.via } : { kind: 'error', message: result.error })
  }
  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (status.kind !== 'sending') void send()
  }

  if (status.kind === 'sent') {
    return (
      <EnquirySent
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

  const id = (k: string) => `${uid}-${k}`
  const err = (k: Field) => (touched[k] ? errors[k] : undefined)
  const fieldProps = (k: Field) => ({
    name: k,
    id: id(k),
    'aria-invalid': !!err(k),
    'aria-describedby': err(k) ? id(`${k}-error`) : undefined,
    onBlur: () => {
      setTouched((t) => ({ ...t, [k]: true }))
      setErrors(validateEnquiry(data))
    },
  })
  const error = (k: Field) =>
    err(k) && (
      <span className="ef-error" id={id(`${k}-error`)}>
        {err(k)}
      </span>
    )
  const sending = status.kind === 'sending'

  return (
    <form ref={formRef} className="composer ef" noValidate onSubmit={onSubmit} aria-busy={sending}>
      <fieldset>
        <legend className="mono">I need help with</legend>
        <div className="chip-row">
          {enquiryTopics.map((t) => (
            <button
              type="button"
              key={t}
              className={`chip chip-btn${data.topics.includes(t) ? ' is-on' : ''}`}
              aria-pressed={data.topics.includes(t)}
              onClick={() => toggle(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </fieldset>
      <div className="ef-row">
        <div className="ef-field">
          <label className="field" htmlFor={id('name')}>
            <span className="mono">Your name</span>
            <input
              {...fieldProps('name')}
              autoComplete="name"
              required
              maxLength={LIMITS.name}
              value={data.name}
              onChange={(e) => set('name', e.target.value)}
            />
          </label>
          {error('name')}
        </div>
        <div className="ef-field">
          <label className="field" htmlFor={id('email')}>
            <span className="mono">Email</span>
            <input
              {...fieldProps('email')}
              type="email"
              autoComplete="email"
              required
              maxLength={LIMITS.email}
              value={data.email}
              onChange={(e) => set('email', e.target.value)}
            />
          </label>
          {error('email')}
        </div>
      </div>
      <div className="ef-field">
        <label className="field" htmlFor={id('message')}>
          <span className="mono">What is slowing your team down?</span>
          <textarea
            {...fieldProps('message')}
            rows={3}
            required
            maxLength={LIMITS.message}
            value={data.message}
            onChange={(e) => set('message', e.target.value)}
          />
        </label>
        {error('message')}
      </div>
      <MarketingOptIn id={id('marketing')} checked={data.marketing} onChange={(v) => set('marketing', v)} />

      {/* Honeypot: hidden from people and screen readers; bots tend to fill every field. */}
      <div className="ef-hp" aria-hidden="true">
        <label htmlFor={id('website')}>Website</label>
        <input
          id={id('website')}
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={data.website}
          onChange={(e) => set('website', e.target.value)}
        />
      </div>

      <div className="composer-foot">
        <button type="submit" className="btn btn-lime btn-lg" disabled={sending}>
          {sending ? 'Sending…' : 'Start the conversation'} <span aria-hidden="true">→</span>
        </button>
        <span className="mono composer-alt">
          or <a href={`mailto:${brand.email}`}>{brand.email}</a>
          <span className="ef-sep" aria-hidden="true" />
          <a href={brand.phoneHref}>{brand.phone}</a>
        </span>
        <PrivacyNote />
      </div>
      <EnquiryError status={status} onRetry={() => void send()} />
    </form>
  )
}
