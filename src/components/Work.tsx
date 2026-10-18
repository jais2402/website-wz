import { useGSAP } from '@gsap/react'
import { useRef } from 'react'
import { work, workSection } from '@/content/site'
import { gsap, scrollToTarget } from '@/hooks/motion'
import { SplitReveal } from './Reveal'

/**
 * Case studies as one bento block: each case is a single tile (sector, headline, story, results, tags) and the
 * four tiles interlock in a 6-column grid, wide / narrow on the first row and narrow / wide on the second.
 */
export function Work() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      gsap.from('.case-tile', {
        y: 40,
        opacity: 0,
        duration: 0.9,
        ease: 'expo.out',
        stagger: 0.08,
        scrollTrigger: { trigger: '.cases-bento', start: 'top 80%' },
      })
    },
    { scope: root },
  )

  return (
    <section id="work" ref={root} className="panel work">
      <div className="wrap">
        <div className="work-head">
          <SplitReveal as="h2" className="display" text={workSection.title} />
          <div className="work-next">
            <p>{workSection.next.title}</p>
            <a
              className="btn btn-lime"
              href={workSection.next.href}
              onClick={(e) => {
                e.preventDefault()
                scrollToTarget(workSection.next.href)
              }}
            >
              {workSection.next.cta} <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>

        <div className="cases-bento">
          {work.map((c, i) => (
            <article key={c.id} id={c.id} className={`case-tile tone-${c.tone} t${i}`}>
              <span className="mono case-tile-tag">
                {c.sector} · {c.place}
              </span>
              <h3>{c.title}</h3>
              <p className="case-tile-body">{c.body}</p>
              <dl className="case-tile-metrics">
                {c.metrics.map((m) => (
                  <div key={m.label}>
                    <dt>{m.value}</dt>
                    <dd>{m.label}</dd>
                  </div>
                ))}
              </dl>
              <ul className="case-tile-tags">
                {c.tags.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
