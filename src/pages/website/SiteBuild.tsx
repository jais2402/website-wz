import type { CSSProperties } from 'react'
import { websitePage } from '@/content/pages'

const step = (i: number) => ({ '--i': i }) as CSSProperties

/**
 * Website hero visual: a browser window putting itself together (nav, headline, cards), a pre-launch check card whose
 * ring closes as each check passes, and a new enquiry arriving on its way to email and a Google Sheet. Plain HTML and
 * CSS; builds once on load and is shown complete under reduced motion. Decorative: the facts are in the sections below.
 */
export function SiteBuild() {
  const v = websitePage.visual
  return (
    <div className="wd-build" aria-hidden="true">
      <div className="wd-browser">
        <div className="wd-bar">
          <span className="wd-dots">
            <i />
            <i />
            <i />
          </span>
          <span className="wd-url mono">
            <svg viewBox="0 0 12 12" width="10" height="10">
              <rect x="2" y="5.5" width="8" height="5.5" rx="1.2" fill="currentColor" />
              <path d="M4 5.5V4a2 2 0 0 1 4 0v1.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
            </svg>
            {v.url}
          </span>
        </div>
        <div className="wd-site">
          <div className="wd-site-nav wd-in" style={step(0)}>
            <span className="wd-logo" />
            <span className="wd-site-links">
              {v.nav.map((n) => (
                <span key={n}>{n}</span>
              ))}
            </span>
          </div>
          <div className="wd-site-hero wd-in" style={step(1)}>
            <p className="wd-site-title">{v.headline}</p>
            <span className="wd-line" />
            <span className="wd-line is-short" />
            <span className="wd-site-btn">{v.button}</span>
          </div>
          <div className="wd-site-cards">
            {[0, 1, 2].map((i) => (
              <span key={i} className={`wd-site-card wd-in tone-${['lime', 'violet', 'coral'][i]}`} style={step(2 + i)}>
                <i />
                <span className="wd-line" />
                <span className="wd-line is-short" />
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="wd-checks glass-card">
        <svg className="wd-ring" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="20" className="wd-ring-track" />
          <circle cx="24" cy="24" r="20" className="wd-ring-fill" pathLength={1} />
          <path d="M16.5 24.5l5 5 10-11" className="wd-ring-tick" pathLength={1} />
        </svg>
        <div className="wd-checks-body">
          <p className="mono wd-checks-title">{v.checksTitle}</p>
          <ul>
            {v.checks.map((c, i) => (
              <li key={c} className="wd-check" style={step(i)}>
                <span>{c}</span>
                <b>{v.pass}</b>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="wd-toast glass-card">
        <span className="wd-toast-dot" />
        <div>
          <p className="mono wd-toast-label">{v.enquiry.label}</p>
          <p className="wd-toast-text">{v.enquiry.text}</p>
          <p className="wd-toast-to">{v.enquiry.to}</p>
        </div>
      </div>
    </div>
  )
}
