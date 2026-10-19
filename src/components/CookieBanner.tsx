import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { consentCopy } from '@/content/consent'
import { CONSENT_OPEN_EVENT, getConsent, openConsentSettings, setConsent, type Consent } from '@/lib/consent'
import { analyticsConfigured } from '@/lib/ga'
import './cookieBanner.css'

/**
 * Opt-in cookie banner: bottom-left on desktop, full width on phones (the phone call pill moves up above it).
 * Shown when a GA ID is configured and no choice is stored; `ready` holds it back until the home preloader is done.
 * The footer's "Cookie settings" reopens it. Accept and Reject carry equal weight; Escape never counts as a choice.
 */
export function CookieBanner({ ready = true }: { ready?: boolean }) {
  const [open, setOpen] = useState(() => analyticsConfigured() && getConsent() === null)
  const [current, setCurrent] = useState<Consent | null>(null)
  const root = useRef<HTMLDivElement>(null)
  const first = useRef<HTMLButtonElement>(null)
  const opener = useRef<HTMLElement | null>(null)
  const visible = open && ready

  // Reopen from "Cookie settings": show the current state and move focus into the banner.
  useEffect(() => {
    if (!analyticsConfigured()) return
    const reopen = () => {
      opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
      setCurrent(getConsent())
      setOpen(true)
      requestAnimationFrame(() => first.current?.focus())
    }
    window.addEventListener(CONSENT_OPEN_EVENT, reopen)
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, reopen)
  }, [])

  // While shown: publish the banner height so the phone call pill can sit above it.
  useLayoutEffect(() => {
    const el = root.current
    if (!visible || !el) return
    const doc = document.documentElement
    const size = () => doc.style.setProperty('--cookie-banner-h', `${el.offsetHeight}px`)
    size()
    doc.classList.add('has-cookie-banner')
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(size)
    ro?.observe(el)
    return () => {
      ro?.disconnect()
      doc.classList.remove('has-cookie-banner')
      doc.style.removeProperty('--cookie-banner-h')
    }
  }, [visible])

  const close = () => {
    setOpen(false)
    setCurrent(null)
    opener.current?.focus?.()
    opener.current = null
  }

  const choose = (analytics: boolean) => {
    setConsent(analytics)
    close()
  }

  if (!visible) return null
  return (
    <div
      ref={root}
      className="cookie-banner"
      role="region"
      aria-label={consentCopy.label}
      onKeyDown={(e) => {
        // Escape only dismisses a reopened banner (the stored choice stays); it is never an answer.
        if (e.key === 'Escape' && current) close()
      }}
    >
      <p className="cookie-banner-text">
        {consentCopy.body}{' '}
        <a href={consentCopy.link.href} className="cookie-banner-link">
          {consentCopy.link.label}
        </a>
      </p>
      {current && (
        <p className="cookie-banner-state mono">
          {current.analytics ? consentCopy.current.on : consentCopy.current.off}
        </p>
      )}
      <div className="cookie-banner-actions">
        <button ref={first} type="button" className="btn btn-ghost cookie-banner-btn" onClick={() => choose(false)}>
          {consentCopy.reject}
        </button>
        <button type="button" className="btn btn-ghost cookie-banner-btn" onClick={() => choose(true)}>
          {consentCopy.accept}
        </button>
      </div>
    </div>
  )
}

/** Footer link-style button that reopens the banner. Hidden when analytics is not configured. */
export function CookieSettingsButton() {
  if (!analyticsConfigured()) return null
  return (
    <button type="button" className="cookie-settings-btn" onClick={openConsentSettings}>
      {consentCopy.settings}
    </button>
  )
}
