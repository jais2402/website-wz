import { useGSAP } from '@gsap/react'
import { Fragment, useRef } from 'react'
import { work, workSection } from '@/content/site'
import { gsap, scrollToTarget } from '@/hooks/motion'
import { SplitReveal } from './Reveal'

/**
 * Case studies as a bento grid: each case is a large story tile (what we built, the before, and a diagram of
 * the system's parts) plus one tile per result. The two cases mirror each other; a closing tile invites the next one.
 */
export function Work() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      gsap.from('.bento-tile', {
        y: 40,
        opacity: 0,
        duration: 0.9,
        ease: 'expo.out',
        stagger: 0.07,
        scrollTrigger: { trigger: '.bento', start: 'top 80%' },
      })
    },
    { scope: root },
  )

  return (
    <section id="work" ref={root} className="panel work">
      <div className="wrap">
        <SplitReveal as="h2" className="display" text={workSection.title} />

        <div className="bento">
          {work.map((c, i) => (
            <Fragment key={c.id}>
              <article id={c.id} className={`bento-tile bento-story tone-${c.tone} ${i % 2 ? 'is-right' : 'is-left'}`}>
                <span className="mono bento-tag">
                  {c.sector} · {c.place}
                </span>
                <h3>{c.title}</h3>
                <p className="bento-before">
                  <span className="mono">Before</span> <s>{c.before}</s>
                </p>
                <div className="bento-diagram" aria-hidden="true">
                  <span className="bento-hub">{c.hub}</span>
                  <svg viewBox="0 0 300 60" preserveAspectRatio="none">
                    {c.parts.map((_, k) => (
                      <path key={k} d={`M150 0 C 150 30, ${50 + k * 100} 30, ${50 + k * 100} 60`} />
                    ))}
                  </svg>
                  <ul>
                    {c.parts.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </div>
              </article>
              {c.metrics.map((m, k) => (
                <div key={m.label} className={`bento-tile bento-metric tone-${c.tone} ${i % 2 ? 'is-right' : 'is-left'} m${k}`}>
                  <span className="bento-value">{m.value}</span>
                  <span className="bento-label">{m.label}</span>
                  <span className="mono bento-source">
                    {c.sector} · {c.place}
                  </span>
                </div>
              ))}
            </Fragment>
          ))}

          <div className="bento-tile bento-next">
            <div>
              <h3>{workSection.next.title}</h3>
              <p>{workSection.next.body}</p>
            </div>
            <a
              className="btn btn-lime btn-lg"
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
      </div>
    </section>
  )
}
