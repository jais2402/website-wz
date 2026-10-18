import { useState } from 'react'
import { brand, enquiryTopics } from '@/content/site'
import { buildMailto } from '@/lib/mailto'

/** Enquiry composer shared by both pages. Opens the visitor's own mail app; nothing is sent by the site. */
export function EnquiryForm() {
  const [topics, setTopics] = useState<string[]>([])
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')

  const toggle = (t: string) => setTopics((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]))

  return (
    <form
      className="composer"
      onSubmit={(e) => {
        e.preventDefault()
        window.location.href = buildMailto(topics, name, message)
      }}
    >
      <fieldset>
        <legend className="mono">I need help with</legend>
        <div className="chip-row">
          {enquiryTopics.map((t) => (
            <button
              type="button"
              key={t}
              className={`chip chip-btn${topics.includes(t) ? ' is-on' : ''}`}
              aria-pressed={topics.includes(t)}
              onClick={() => toggle(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </fieldset>
      <label className="field">
        <span className="mono">Your name</span>
        <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={80} />
      </label>
      <label className="field">
        <span className="mono">What is slowing your team down?</span>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} maxLength={2000} />
      </label>
      <div className="composer-foot">
        <button type="submit" className="btn btn-lime btn-lg">
          Start the conversation <span aria-hidden="true">→</span>
        </button>
        <span className="mono composer-alt">
          or <a href={`mailto:${brand.email}`}>{brand.email}</a> · <a href={brand.phoneHref}>{brand.phone}</a>
        </span>
      </div>
    </form>
  )
}
