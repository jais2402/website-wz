import { useGSAP } from '@gsap/react'
import { type CSSProperties, useLayoutEffect, useRef, useState } from 'react'
import { pastWork, work, workSection } from '@/content/site'
import { gsap, scrollToTarget } from '@/hooks/motion'
import { threadPath } from '@/lib/thread'
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

/** Right edge of the card row inside `.work-row`, plus the row's end padding. */
function cardsEnd(row: HTMLElement) {
  const box = row.querySelector<HTMLElement>('.work-cards')
  if (!box) return row.clientWidth
  const pad = parseFloat(getComputedStyle(row).paddingRight) || 0
  return box.offsetLeft + box.offsetWidth + pad
}

/**
 * Case studies as a row of cards. Desktop: the section pins and scrolling moves the row sideways (like Services),
 * with a progress line. Phones: a vertical deck where each card sticks and the next slides over it.
 * Reduced motion on desktop: a swipeable row.
 */
export function Work() {
  const root = useRef<HTMLElement>(null)
  const row = useRef<HTMLDivElement>(null)
  const bar = useRef<HTMLSpanElement>(null)
  const thread = useRef<SVGPathElement>(null)
  const [svg, setSvg] = useState({ d: '', w: 0, h: 0 })

  // The thread: a loose end beside the intro, strung through a knot on top of every card. Measured from the
  // layout (offsets ignore the scroll transform), again whenever the row resizes.
  useLayoutEffect(() => {
    const el = row.current
    if (!el) return
    const measure = () => {
      const hint = el.querySelector<HTMLElement>('.work-hint')
      const cardsBox = el.querySelector<HTMLElement>('.work-cards')
      const cards = Array.from(el.querySelectorAll<HTMLElement>('.case-card'))
      // The hint is hidden on phones (no thread there) and then has no offsetParent: skip measuring.
      const intro = hint?.offsetParent as HTMLElement | null
      if (!hint || !intro || !cardsBox || !cards.length) return
      const start = {
        x: intro.offsetLeft + hint.offsetLeft + hint.offsetWidth + 18,
        y: intro.offsetTop + hint.offsetTop + hint.offsetHeight / 2,
      }
      const knots = cards.map((c) => ({
        x: cardsBox.offsetLeft + c.offsetLeft + c.offsetWidth / 2,
        y: cardsBox.offsetTop + c.offsetTop,
      }))
      // Negative sag: the thread arcs up between cards, in the open space above them.
      setSvg({ d: threadPath(start, knots, -42), w: cardsEnd(el), h: el.offsetHeight })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
        // Scroll exactly to the last card. Measured from the cards, not scrollWidth, which the thread SVG also widens.
        const distance = () => Math.max(0, cardsEnd(row.current!) - row.current!.clientWidth)
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
              // The thread draws itself as the row moves; each card's knot lights as the thread reaches it.
              if (thread.current) thread.current.style.strokeDashoffset = String(1 - (0.12 + st.progress * 0.88))
              const knots = root.current?.querySelectorAll('.case-knot') ?? []
              knots.forEach((k, i) =>
                k.classList.toggle('is-lit', st.progress >= i / Math.max(1, knots.length - 1) - 0.02),
              )
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
        <svg className="work-thread" width={svg.w} height={svg.h} viewBox={`0 0 ${svg.w} ${svg.h}`} aria-hidden="true">
          <defs>
            <linearGradient id="work-thread-grad" x1="0" x2="1">
              <stop offset="0" stopColor="#8b7bff" />
              <stop offset="0.5" stopColor="#4d9fff" />
              <stop offset="1" stopColor="#8cc4ff" />
            </linearGradient>
          </defs>
          <path className="work-thread-base" d={svg.d} />
          <path ref={thread} className="work-thread-live" d={svg.d} pathLength={1} />
        </svg>
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
              <span className="case-knot" aria-hidden="true" />
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
