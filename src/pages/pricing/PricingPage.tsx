import { useGSAP } from '@gsap/react'
import { useRef } from 'react'
import { CtaStrip } from '@/components/CtaStrip'
import { Faq } from '@/components/Faq'
import { pricingPage as p } from '@/content/pages'
import { ctas, faq, pricing, process } from '@/content/site'
import { gsap, scrollToTarget, usePrefersReducedMotion } from '@/hooks/motion'
import { LoomContact } from '@/loom/sections'
import { PageHero, PageSection, PageShell } from '../shell'
import { PriceTie } from './PriceTie'
import './pricing.css'

// The cost questions, in the order the page lists them. A question missing from `faq` is dropped (and fails a test).
const questions = p.faq.flatMap((q) => faq.filter((f) => f.q === q))

/**
 * /pricing: how a price is set and agreed, with no figures. Hero (three setters tied into one price), what sets
 * the price and what never does, the four stages with the point where the price is agreed, what continues after
 * launch, then the cost questions, a call to action and the contact block.
 */
export function PricingPage() {
  const reducedMotion = usePrefersReducedMotion()
  const stages = useRef<HTMLDivElement>(null)

  // The stage thread fills as the stages scroll through (across on desktop, down on phones). Full under reduced motion.
  useGSAP(
    () => {
      if (reducedMotion || !stages.current) return
      gsap.fromTo(
        stages.current,
        { '--fill': 0 },
        {
          '--fill': 1,
          ease: 'none',
          scrollTrigger: { trigger: stages.current, start: 'top 80%', end: 'bottom 55%', scrub: true },
        },
      )
    },
    { scope: stages, dependencies: [reducedMotion] },
  )

  // Stages with the "price agreed" gate between Shape and Build.
  const before = process.slice(0, 2)
  const after = process.slice(2)

  const stage = (s: (typeof process)[number], i: number) => (
    <li key={s.title} className="pr-stage">
      <span className="pr-stage-knot" aria-hidden="true" />
      <h3>{s.title}</h3>
      <p>{s.body}</p>
      <p className="pr-stage-note">{p.stageNotes[i]}</p>
    </li>
  )

  return (
    <PageShell className="pr">
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
              href={p.stagesLink.href}
              onClick={(e) => {
                e.preventDefault()
                scrollToTarget(p.stagesLink.href)
              }}
            >
              {p.stagesLink.label}
            </a>
          </>
        }
        visual={<PriceTie />}
      />

      <PageSection kicker={p.setsKicker} title={p.setsTitle} intro={p.setsIntro} className="pr-sets">
        <div className="pr-sets-grid">
          <div className="pr-sets-col">
            <p className="mono pr-group">{p.setsLabel}</p>
            <ul className="pr-sets-list">
              {pricing.sets.map((s) => (
                <li key={s.name} className="pr-set" data-reveal>
                  <h3>{s.name}</h3>
                  <div>
                    <p className="pr-set-text">{s.text}</p>
                    {p.setsDetail[s.name] && <p className="pr-set-detail">{p.setsDetail[s.name]}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="pr-never" data-reveal>
            <p className="mono pr-group">{p.doesntLabel}</p>
            <ul className="pr-never-list">
              {pricing.doesnt.map((d, i) => (
                <li key={d} className="pr-never-item">
                  <span className="pr-cut" aria-hidden="true">
                    ✕
                  </span>
                  <div>
                    <h3>
                      <s>{d}</s>
                    </h3>
                    {p.doesntDetail[i] && <p>{p.doesntDetail[i]}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </PageSection>

      <PageSection
        id="agreed"
        kicker={p.stagesKicker}
        title={p.stagesTitle}
        intro={p.stagesIntro}
        className="pr-agreed"
      >
        <div className="pr-stages" ref={stages}>
          <span className="pr-thread" aria-hidden="true">
            <span className="pr-thread-fill" />
          </span>
          <ol>
            {before.map((s, i) => stage(s, i))}
            <li className="pr-gate">
              <span className="pr-gate-knot" aria-hidden="true" />
              <p className="mono pr-gate-label">{p.gate.label}</p>
              <p className="pr-gate-text">{p.gate.text}</p>
            </li>
            {after.map((s, i) => stage(s, i + before.length))}
          </ol>
        </div>
      </PageSection>

      <PageSection kicker={p.afterKicker} title={p.afterTitle} intro={p.afterIntro} className="pr-after">
        <div className="pr-after-grid">
          <dl className="pr-ledger glass-card" data-reveal>
            {p.after.map((x) => (
              <div key={x.name} className="pr-ledger-row">
                <dt>{x.name}</dt>
                <dd>{x.text}</dd>
              </div>
            ))}
          </dl>
          <p className="pr-after-note" data-reveal>
            {p.afterNote}
          </p>
        </div>
      </PageSection>

      <Faq items={questions} title={p.faqTitle} />

      <CtaStrip {...ctas.pricing} />

      <LoomContact />
    </PageShell>
  )
}
