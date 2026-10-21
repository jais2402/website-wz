import { useGSAP } from '@gsap/react'
import { useRef } from 'react'
import { areas, areasSection, ctas, navSystemsAll, sampleDataLabel } from '@/content/site'
import { gsap } from '@/hooks/motion'
import { track } from '@/lib/analytics'
import { ModuleCard } from './Charts'
import { SplitReveal } from './Reveal'

// Each system's own page (/systems/<slug>), in `areas` order. Matches `systemPages` in content/pages.ts.
const SLUGS = ['people', 'revenue', 'operations', 'ecommerce', 'finance', 'industry']
// Module names shown as tags on each card; the rest are counted.
const TAGS = 3

/**
 * The systems we build: six cards, one per business system, each with a live sample module and a link to the
 * system's own page. No pinning or scroll-stepping: the detail lives on the system pages.
 * Desktop: a 3 × 2 grid. Phones: a swipe strip, so the section stays one screen tall.
 */
export function Areas() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      // Desktop only: on phones the cards sit in a swipe strip, which would clip a slide-up.
      mm.add('(min-width: 700px) and (prefers-reduced-motion: no-preference)', () => {
        gsap.from('.sys-card', {
          y: 36,
          opacity: 0,
          duration: 0.9,
          ease: 'expo.out',
          stagger: 0.07,
          scrollTrigger: { trigger: '.sys-grid', start: 'top 85%', once: true },
        })
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section ref={root} className="panel areas" aria-label={areasSection.title}>
      <div className="wrap">
        <div className="areas-head">
          <div>
            <p className="mono label">{areasSection.kicker}</p>
            <SplitReveal as="h2" className="display" text={areasSection.title} />
          </div>
          <span className="sys-sample mono">{sampleDataLabel}</span>
        </div>

        <ul className="sys-grid">
          {areas.map((a, i) => (
            <li key={a.title} className="sys-item">
              <a className="sys-card" href={`/systems/${SLUGS[i]}`}>
                <span className="sys-top mono">
                  <span>{String(i + 1).padStart(2, '0')}</span>
                  <span>{a.modules.length} modules</span>
                </span>
                <h3 className="sys-title">{a.title}</h3>
                <p className="sys-promise">{a.promise}</p>
                <div className="sys-preview" aria-hidden="true">
                  <ModuleCard m={a.modules[0]} wide={false} index={i} />
                </div>
                <span className="sys-tags">
                  {a.modules.slice(0, TAGS).map((m) => (
                    <span key={m.name}>{m.name}</span>
                  ))}
                  {a.modules.length > TAGS && <span>+{a.modules.length - TAGS}</span>}
                </span>
                <span className="sys-go">
                  Explore <span aria-hidden="true">→</span>
                </span>
              </a>
            </li>
          ))}
        </ul>

        <div className="areas-cta">
          <div>
            <p className="areas-cta-title">{ctas.explorer.title}</p>
            <p className="areas-cta-body">{ctas.explorer.body}</p>
          </div>
          <a
            className="btn btn-lime"
            href={navSystemsAll.href}
            onClick={() => track('cta_click', { label: ctas.explorer.explore, location: 'systems_explorer' })}
          >
            {ctas.explorer.explore} <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>
  )
}
