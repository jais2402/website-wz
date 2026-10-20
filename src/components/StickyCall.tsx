import { useEffect, useState } from 'react'
import { brand, quickContact, whatsappHref } from '@/content/site'
import { track } from '@/lib/analytics'
import './stickyCall.css'

/**
 * Phones only (CSS hides it from 900px): a floating "Call us / Email" pill. Shows once the first screen has
 * scrolled away and hides again when the contact block (#contact), or a card with its own call and email
 * buttons (`data-own-contact`), comes into view.
 */
export function StickyCall() {
  const [shown, setShown] = useState(false)

  useEffect(() => {
    let raf = 0
    const check = () => {
      raf = 0
      const h = window.innerHeight
      const contact = document.getElementById('contact')
      const atContact = !!contact && contact.getBoundingClientRect().top < h * 0.9
      // Cards with their own call/email buttons (data-own-contact): the pill would only cover them.
      const ownContact = [...document.querySelectorAll('[data-own-contact]')].some((el) => {
        const r = el.getBoundingClientRect()
        return r.bottom > 0 && r.top < h
      })
      setShown(window.scrollY > h * 0.9 && !atContact && !ownContact)
    }
    const on = () => {
      if (!raf) raf = requestAnimationFrame(check)
    }
    check()
    window.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', on)
      window.removeEventListener('resize', on)
    }
  }, [])

  return (
    <div className={`sticky-call${shown ? ' is-shown' : ''}`} aria-hidden={!shown} inert={!shown}>
      <a
        href={brand.phoneHref}
        className="sticky-call-btn is-call"
        onClick={() => track('cta_click', { label: 'call', location: 'sticky_call' })}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path
            d="M6.6 10.8a15.2 15.2 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.6a1 1 0 0 1-.25 1z"
            fill="currentColor"
          />
        </svg>
        {quickContact.call}
      </a>
      <a
        href={`mailto:${brand.email}`}
        className="sticky-call-btn"
        onClick={() => track('cta_click', { label: 'email', location: 'sticky_call' })}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path
            d="M4 6h16v12H4z M4 7l8 6 8-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
        {quickContact.email}
      </a>
      {whatsappHref && (
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="sticky-call-btn"
          onClick={() => track('cta_click', { label: 'whatsapp', location: 'sticky_call' })}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path
              d="M4 20l1.3-3.9A8 8 0 1 1 8 19z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
          </svg>
          {quickContact.whatsapp}
        </a>
      )}
    </div>
  )
}
