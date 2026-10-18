import { useGSAP } from '@gsap/react'
import { type CSSProperties, useRef } from 'react'
import { pastWork, work, workSection } from '@/content/site'
import { gsap, scrollToTarget } from '@/hooks/motion'
import { SplitReveal } from './Reveal'

type Card = {
  id: string
  sector: string
  place?: string
  title: string
  body: string
  metrics?: readonly { value: string; label: string }[]
  tags: readonly string[]
  tone: string
}

const cards: Card[] = [...work, ...pastWork]

/**
 * Case studies as a row of cards. Desktop: the section pins and scrolling moves the row sideways (like Services),
 * with a progress line. Phones: a vertical deck where each card sticks and the next slides over it.
 * Reduced motion on desktop: a swipeable row.
 */
export function Work() {
  const root = useRef<HTMLElement>(null)
  const row = useRef<HTMLDivElement>(null)
  const bar = useRef<HTMLSpanElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
        const distance = () => row.current!.scrollWidth - row.current!.clientWidth
        gsap.to(row.current, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            onUpdate: (st) => {
              if (bar.current) bar.current.style.transform = `scaleX(${st.progress})`
            },
          },
        })
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  const next = workSection.next
  return (
    <section id="work" ref={root} className="panel work">
      <div className="work-row" ref={row}>
        <div className="work-intro">
          <SplitReveal as="h2" className="display" text={workSection.title} />
          <p className="lead">{next.body}</p>
          <span className="drag-hint mono work-hint" aria-hidden="true">
            {workSection.hint}
          </span>
        </div>

        <div className="work-cards">
          {cards.map((c, i) => (
            <article key={c.id} id={c.id} className={`case-card tone-${c.tone}`} style={{ '--i': i } as CSSProperties}>
              <span className="mono case-card-tag">{c.place ? `${c.sector} · ${c.place}` : c.sector}</span>
              <h3>{c.title}</h3>
              <p className="case-card-body">{c.body}</p>
              {c.metrics?.length ? (
                <dl className="case-card-metrics">
                  {c.metrics.map((m) => (
                    <div key={m.label}>
                      <dt>{m.value}</dt>
                      <dd>{m.label}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
              <ul className="case-card-tags">
                {c.tags.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </article>
          ))}

          <article className="case-card case-card-next">
            <h3>{next.title}</h3>
            <p className="case-card-body">{next.body}</p>
            <a
              className="btn btn-lime"
              href={next.href}
              onClick={(e) => {
                e.preventDefault()
                scrollToTarget(next.href)
              }}
            >
              {next.cta} <span aria-hidden="true">→</span>
            </a>
          </article>
        </div>
      </div>
      <div className="work-progress" aria-hidden="true">
        <span ref={bar} />
      </div>
    </section>
  )
}
