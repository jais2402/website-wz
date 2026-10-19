import { useEffect } from 'react'
import { CaseArt } from '@/components/CaseArt'
import { CtaStrip } from '@/components/CtaStrip'
import { portfolioPage as p } from '@/content/pages'
import { ctas, pastWork, work } from '@/content/site'
import { scrollToTarget } from '@/hooks/motion'
import { LoomContact } from '@/loom/sections'
import { PageHero, PageSection, PageShell } from '../shell'
import { PortfolioArchive } from './PortfolioArchive'
import { PortfolioWeave } from './PortfolioWeave'
import './portfolio.css'

/**
 * /portfolio: the four case studies with results (a lead case, then alternating rows), then the earlier systems as
 * a lighter list with no numbers, then every project from the old portfolio by name, with a sector filter. Each case
 * (and each archive project) has its id as an anchor, so other pages can link to /portfolio#<id>.
 */
export function PortfolioPage() {
  // A deep link (/portfolio#marketplace) lands on the snapshot before React replaces it: scroll again once rendered.
  useEffect(() => {
    const id = window.location.hash.slice(1)
    if (!id || !/^[a-z0-9-]+$/.test(id)) return
    const timer = window.setTimeout(() => {
      const el = document.getElementById(id)
      if (el) scrollToTarget(el)
    }, 120)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <PageShell className="pf">
      <PageHero
        kicker={p.kicker}
        title={p.title}
        lead={p.lead}
        actions={
          <>
            <a className="btn btn-lime btn-lg" href={ctas.contact.href}>
              {ctas.contact.label} <span aria-hidden="true">→</span>
            </a>
            <a className="btn btn-ghost btn-lg" href={p.systemsLink.href}>
              {p.systemsLink.label}
            </a>
          </>
        }
        visual={<PortfolioWeave />}
      />

      <PageSection kicker={p.featuredKicker} title={p.featuredTitle} intro={p.featuredIntro} className="pf-featured">
        <ol className="pf-cases">
          {work.map((c, i) => (
            <li
              key={c.id}
              id={c.id}
              className={`pf-case tone-${c.tone}${i === 0 ? ' is-lead' : ''}${i % 2 === 0 && i > 0 ? ' is-flip' : ''}`}
              data-reveal
            >
              <div className="pf-case-copy">
                <p className="mono pf-case-tag case-card-tag">
                  {c.sector}
                  {c.place && <span className="case-card-place">{c.place}</span>}
                </p>
                <h3>{c.title}</h3>
                <p className="pf-case-body">{c.body}</p>
              </div>
              <div className="pf-case-proof">
                <CaseArt modules={c.tags} className="pf-case-art" />
                <p className="mono pf-results-label">{p.resultsLabel}</p>
                <dl className="pf-metrics">
                  {c.metrics.map((m) => (
                    <div key={m.label}>
                      <dt>{m.value}</dt>
                      <dd>{m.label}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </li>
          ))}
        </ol>
      </PageSection>

      <PageSection kicker={p.pastKicker} title={p.pastTitle} intro={p.pastIntro} className="pf-earlier">
        <ul className="pf-past">
          {pastWork.map((c) => (
            <li key={c.id} id={c.id} className={`pf-past-item tone-${c.tone}`} data-reveal>
              <p className="mono pf-past-sector">
                <span className="pf-past-knot" aria-hidden="true" />
                {c.sector}
              </p>
              <div className="pf-past-copy">
                <h3>{c.title}</h3>
                <p>{c.body}</p>
              </div>
              <ul className="pf-tags">
                {c.tags.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </PageSection>

      <PageSection
        id="archive"
        kicker={p.archiveKicker}
        title={p.archiveTitle}
        intro={p.archiveIntro}
        className="pf-full"
      >
        <PortfolioArchive />
      </PageSection>

      <CtaStrip {...ctas.portfolio} />

      <LoomContact />
    </PageShell>
  )
}
