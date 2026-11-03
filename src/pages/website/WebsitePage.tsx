import { CtaStrip } from '@/components/CtaStrip'
import { Faq } from '@/components/Faq'
import { websitePage as p } from '@/content/pages'
import { ctas, pastWork, process } from '@/content/site'
import { scrollToTarget } from '@/hooks/motion'
import { LoomContact } from '@/loom/sections'
import { PageHero, PageSection, PageShell } from '../shell'
import { SiteBuild } from './SiteBuild'
import './website.css'

// The cases shown as proof, in the page's order. An id missing from `pastWork` is dropped (and fails a test).
const proof = p.proofCases.flatMap((id) => pastWork.filter((c) => c.id === id))

/**
 * /website-development: what we build, what every site includes, the four stages, how the price is set (no figures),
 * stores and portals from our work, the website questions (also marked up as FAQPage), a call to action and contact.
 */
export function WebsitePage() {
  return (
    <PageShell className="wd">
      <PageHero
        kicker={p.kicker}
        title={p.title}
        lead={p.lead}
        actions={
          <>
            <a className="btn btn-lime btn-lg" href={ctas.contact.href}>
              {ctas.contact.label} <span aria-hidden="true">→</span>
            </a>
            <a
              className="btn btn-ghost btn-lg"
              href={p.includesLink.href}
              onClick={(e) => {
                e.preventDefault()
                scrollToTarget(p.includesLink.href)
              }}
            >
              {p.includesLink.label}
            </a>
          </>
        }
        visual={<SiteBuild />}
      />

      <PageSection kicker={p.buildKicker} title={p.buildTitle} intro={p.buildIntro} className="wd-builds-section">
        <ul className="wd-builds">
          {p.builds.map((b, i) => (
            <li key={b.title} className="wd-kind" data-reveal>
              <span className="mono wd-kind-num">{String(i + 1).padStart(2, '0')}</span>
              <h3>{b.title}</h3>
              <p>{b.text}</p>
              {b.link && (
                <a className="wd-kind-link" href={b.link.href}>
                  {b.link.label} <span aria-hidden="true">→</span>
                </a>
              )}
            </li>
          ))}
        </ul>
      </PageSection>

      <PageSection
        id="includes"
        kicker={p.includesKicker}
        title={p.includesTitle}
        intro={p.includesIntro}
        className="wd-includes-section"
        tone="light"
      >
        <dl className="wd-includes">
          {p.includes.map((x) => (
            <div key={x.name} className="wd-include" data-reveal>
              <dt>
                <span className="wd-tick" aria-hidden="true">
                  <svg viewBox="0 0 16 16" width="14" height="14">
                    <path
                      d="M3.5 8.5l3 3 6-7"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                {x.name}
              </dt>
              <dd>{x.text}</dd>
            </div>
          ))}
        </dl>
      </PageSection>

      <PageSection kicker={p.stepsKicker} title={p.stepsTitle} intro={p.stepsIntro} className="wd-steps-section">
        <ol className="wd-steps">
          {process.map((s, i) => (
            <li key={s.title} className="wd-step" data-reveal>
              <span className="wd-step-knot" aria-hidden="true" />
              <h3>{s.title}</h3>
              <p>{p.steps[i]}</p>
            </li>
          ))}
        </ol>
      </PageSection>

      <PageSection kicker={p.priceKicker} title={p.priceTitle} className="wd-price-section">
        <div className="wd-price">
          <div className="wd-price-copy" data-reveal>
            <p className="lead">{p.priceText}</p>
            <a className="btn btn-ghost" href={p.priceLink.href}>
              {p.priceLink.label} <span aria-hidden="true">→</span>
            </a>
          </div>
          <div className="wd-price-sets" data-reveal>
            <p className="mono wd-group">{p.priceSetsLabel}</p>
            <ul>
              {p.priceSets.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        </div>
      </PageSection>

      <PageSection kicker={p.proofKicker} title={p.proofTitle} intro={p.proofIntro} className="wd-proof-section">
        <ul className="wd-proof">
          {proof.map((c) => (
            <li key={c.id} data-reveal>
              <a className={`wd-case tone-${c.tone}`} href={`/portfolio#${c.id}`}>
                <span className="mono wd-case-sector">{c.sector}</span>
                <h3>{c.title}</h3>
                <p>{c.body}</p>
                <ul className="wd-case-tags">
                  {c.tags.map((tg) => (
                    <li key={tg} className="chip">
                      {tg}
                    </li>
                  ))}
                </ul>
                <span className="wd-case-link">
                  {p.readCase} <span aria-hidden="true">→</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
        <p className="wd-proof-more">
          <a className="btn btn-ghost" href={p.proofLink.href}>
            {p.proofLink.label} <span aria-hidden="true">→</span>
          </a>
        </p>
      </PageSection>

      <Faq items={p.faq} title={p.faqTitle} />

      <CtaStrip {...ctas.website} />

      <LoomContact />
    </PageShell>
  )
}
