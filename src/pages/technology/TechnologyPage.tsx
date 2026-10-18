import { useGSAP } from '@gsap/react'
import { type CSSProperties, useRef } from 'react'
import { stack, technologyPage as p } from '@/content/site'
import { ScrollTrigger, scrollToTarget } from '@/hooks/motion'
import { LoomContact } from '@/loom/sections'
import { PageHero, PageSection, PageShell } from '../shell'
import '../print.css'
import './technology.css'

/** /technology: the stack, how a system fits together, and how we add AI. Styles in technology.css (`tech-`). */
export function TechnologyPage() {
  return (
    <PageShell className="tech">
      <PageHero
        kicker={p.kicker}
        title={p.title}
        lead={p.lead}
        actions={
          <>
            <a className="btn btn-lime btn-lg" href="/contact">
              Tell us what is not working <span aria-hidden="true">→</span>
            </a>
            <a
              className="btn btn-ghost btn-lg"
              href="#stack"
              onClick={(e) => {
                e.preventDefault()
                scrollToTarget('#stack')
              }}
            >
              See the stack
            </a>
          </>
        }
      />

      <PageSection id="stack" title={p.stackTitle} intro={p.stackIntro} className="tech-stack">
        <ul className="tech-groups">
          {stack.map((g) => (
            <li key={g.group} className="tech-group" data-reveal>
              <h3 className="mono tech-group-label">{g.group}</h3>
              <ul className="chip-row">
                {g.items.map((t) => (
                  <li key={t} className="chip">
                    {t}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </PageSection>

      <PageSection title={p.layersTitle} className="tech-arch">
        <Layers />
      </PageSection>

      <PageSection title={p.aiTitle} className="tech-ai">
        <ul className="tech-ai-grid">
          {p.ai.map((a) => (
            <li key={a.title} className="glass-card tech-ai-card" data-reveal>
              <span className="tech-ai-line" aria-hidden="true" />
              <h3>{a.title}</h3>
              <p>{a.text}</p>
            </li>
          ))}
        </ul>
      </PageSection>

      <LoomContact />
    </PageShell>
  )
}

/**
 * The six layers as a stacked diagram, screens on top and hosting at the bottom. A data pulse runs down the
 * connectors (CSS loop, timed by --i) while the diagram is on screen; under reduced motion it stays still.
 */
function Layers() {
  const root = useRef<HTMLOListElement>(null)

  useGSAP(
    () => {
      const el = root.current
      if (!el) return
      // Only loop while visible, so the pulse is not burning frames off screen.
      ScrollTrigger.create({ trigger: el, start: 'top bottom', end: 'bottom top', toggleClass: 'is-on' })
    },
    { scope: root },
  )

  return (
    <ol ref={root} className="tech-layers">
      {p.layers.map((l, i) => (
        <li key={l.name} className="tech-layer" style={{ '--i': i } as CSSProperties}>
          <div className="tech-band" data-reveal>
            <h3>{l.name}</h3>
            <p>{l.text}</p>
            <ul className="chip-row tech-band-chips">
              {l.items.map((t) => (
                <li key={t} className="chip">
                  {t}
                </li>
              ))}
            </ul>
          </div>
          {i < p.layers.length - 1 && (
            <span className="tech-link" aria-hidden="true">
              <i />
            </span>
          )}
        </li>
      ))}
    </ol>
  )
}
