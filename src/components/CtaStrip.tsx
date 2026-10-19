import { ctas } from '@/content/site'
import { scrollToTarget } from '@/hooks/motion'
import './ctaStrip.css'

type Link = { label: string; href: string }

/**
 * A mid-page call to action: a line of copy and two actions, placed where a visitor has just seen enough to act.
 * The primary action is always the shared contact link.
 */
export function CtaStrip({ title, body, secondary }: { title: string; body?: string; secondary?: Link }) {
  const primary = ctas.contact
  return (
    <aside className="cta-strip wrap" aria-label={title} data-reveal>
      <div className="cta-strip-card">
        <div className="cta-strip-copy">
          <p className="cta-strip-title">{title}</p>
          {body && <p className="cta-strip-body">{body}</p>}
        </div>
        <div className="cta-strip-actions">
          <a className="btn btn-lime" href={primary.href}>
            {primary.label} <span aria-hidden="true">→</span>
          </a>
          {secondary && (
            <a
              className="btn btn-ghost"
              href={secondary.href}
              onClick={(e) => {
                if (!secondary.href.startsWith('#')) return
                e.preventDefault()
                scrollToTarget(secondary.href)
              }}
            >
              {secondary.label}
            </a>
          )}
        </div>
      </div>
    </aside>
  )
}
