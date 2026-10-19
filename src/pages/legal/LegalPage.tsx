import type { MouseEvent, ReactNode } from 'react'
import { legalMeta } from '@/content/legal'
import { type LegalKey, legalCopy, legalPages } from '@/content/sitemap'
import { scrollToTarget, usePrefersReducedMotion } from '@/hooks/motion'
import { formatLegalDate, legalAnchor, splitPlaceholders } from '@/lib/legal'
import { LoomContact } from '@/loom/sections'
import { PageShell } from '../shell'
import { LegalMark } from './LegalMark'
import '../print.css'
import './legal.css'

/** Paragraph text with any [placeholder] highlighted, so unfilled details stay obvious until review. */
function Text({ text }: { text: string }) {
  return splitPlaceholders(text).map((part, i) =>
    part.placeholder ? (
      <mark key={i} className="lg-ph">
        {part.text}
      </mark>
    ) : (
      part.text
    ),
  )
}

/** Opening block of the legal pages: label, title, lead and the thread mark. */
export function LegalHero({
  kicker,
  title,
  lead,
  meta,
}: {
  kicker: string
  title: string
  lead: string
  meta?: ReactNode
}) {
  return (
    <section className="lg-hero wrap">
      <div className="lg-hero-copy">
        <p className="mono label">{kicker}</p>
        <h1 className="display lg-title">{title}</h1>
        <p className="lead lg-lead">{lead}</p>
        {meta}
      </div>
      <LegalMark />
    </section>
  )
}

/** Privacy policy, terms and cookie policy: one layout, copy from content/legal.ts. */
export function LegalPage({ page }: { page: LegalKey }) {
  const entry = legalPages.find((l) => l.key === page)!
  const { doc } = entry
  const others = legalPages.filter((l) => l.key !== page)
  const reducedMotion = usePrefersReducedMotion()

  // Smooth scroll to a section, with room for the fixed nav. Under reduced motion the browser jumps natively
  // (scroll-margin-top in legal.css keeps the heading clear of the nav).
  const go = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    if (reducedMotion) return
    const el = document.getElementById(id)
    if (!el) return
    e.preventDefault()
    scrollToTarget(el)
    history.replaceState(null, '', `#${id}`)
  }

  return (
    <PageShell className="lg">
      <LegalHero
        kicker={legalCopy.kicker}
        title={doc.title}
        lead={doc.lead}
        meta={
          <p className="mono lg-updated">
            {legalCopy.updated} <time dateTime={legalMeta.updated}>{formatLegalDate(legalMeta.updated)}</time>
          </p>
        }
      />

      {legalMeta.reviewNote && (
        <div className="wrap">
          <aside className="lg-draft" role="note" aria-label={legalCopy.draftLabel}>
            <p className="mono lg-draft-label">{legalCopy.draftLabel}</p>
            <p>{legalMeta.reviewNote}</p>
          </aside>
        </div>
      )}

      <div className="wrap lg-body">
        <nav className="lg-toc" aria-label={legalCopy.tocTitle}>
          <p className="mono lg-toc-title">{legalCopy.tocTitle}</p>
          <ul>
            {doc.sections.map((s) => {
              const id = legalAnchor(s.id)
              return (
                <li key={s.id}>
                  <a href={`#${id}`} onClick={(e) => go(e, id)}>
                    {s.heading}
                  </a>
                </li>
              )
            })}
          </ul>
          <p className="mono lg-toc-title lg-toc-other">{legalCopy.otherTitle}</p>
          <ul>
            {others.map((o) => (
              <li key={o.key}>
                <a href={o.path}>{o.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <article className="lg-prose">
          {doc.sections.map((s) => {
            const id = legalAnchor(s.id)
            return (
              <section key={s.id} id={id} aria-labelledby={`${id}-h`}>
                <h2 id={`${id}-h`}>{s.heading}</h2>
                {s.body.map((para) => (
                  <p key={para}>
                    <Text text={para} />
                  </p>
                ))}
              </section>
            )
          })}
        </article>
      </div>

      <LoomContact />
    </PageShell>
  )
}
