import { useGSAP } from '@gsap/react'
import { useRef } from 'react'
import { work, workSection } from '@/content/site'
import { gsap } from '@/hooks/motion'
import { SplitReveal } from './Reveal'

/** Case studies as sticky cards that stack and recede as the next one arrives. */
export function Work() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const cards = gsap.utils.toArray<HTMLElement>('.case')
      cards.forEach((card, i) => {
        if (i === cards.length - 1) return
        gsap.to(card.querySelector('.case-inner'), {
          scale: 0.92,
          opacity: 0.35,
          ease: 'none',
          scrollTrigger: { trigger: cards[i + 1], start: 'top bottom', end: 'top 15%', scrub: true },
        })
      })
    },
    { scope: root },
  )

  return (
    <section id="work" ref={root} className="panel work">
      <div className="wrap">
        <p className="mono label">{workSection.kicker}</p>
        <SplitReveal as="h2" className="display" text={workSection.title} />
      </div>
      <div className="cases">
        {work.map((c) => (
          <article id={c.id} key={c.id} className={`case tone-${c.tone}`}>
            <div className="case-inner">
              <div className="case-top">
                <span className="mono case-tag">
                  {c.sector} · {c.place}
                </span>
                <span className="mono case-before">
                  Before: <s>{c.before}</s>
                </span>
              </div>
              <h3 className="case-title">{c.title}</h3>
              <div className="case-metrics">
                {c.metrics.map((m) => (
                  <div key={m.label} className="case-metric">
                    <span className="case-value">{m.value}</span>
                    <span className="case-label">{m.label}</span>
                  </div>
                ))}
              </div>
              <div className="case-orbit" aria-hidden="true">
                {Array.from({ length: 3 }, (_, i) => (
                  <i key={i} />
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
