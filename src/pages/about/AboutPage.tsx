import { useGSAP } from '@gsap/react'
import { useEffect, useRef, useState } from 'react'
import { CountUp } from '@/components/Charts'
import { aboutPage } from '@/content/pages'
import { process, stats } from '@/content/site'
import { gsap } from '@/hooks/motion'
import { LoomContact } from '@/loom/sections'
import { PageHero, PageSection, PageShell } from '../shell'
import './about.css'

export function AboutPage() {
  const p = aboutPage
  return (
    <PageShell className="ab">
      <PageHero
        kicker={p.kicker}
        title={p.title}
        lead={p.lead}
        actions={
          <>
            <a className="btn btn-lime btn-lg" href={p.cta.href}>
              {p.cta.label} <span aria-hidden="true">→</span>
            </a>
            <a className="btn btn-ghost btn-lg" href="/#work">
              See our work
            </a>
          </>
        }
      />

      <PageSection title={p.whyTitle} className="ab-why">
        <ul className="ab-why-grid">
          {p.why.map((w) => (
            <li className="ab-why-card" key={w.title} data-reveal>
              <h3>{w.title}</h3>
              <p>{w.text}</p>
            </li>
          ))}
        </ul>
      </PageSection>

      <PageSection title={p.storyTitle} className="ab-story">
        <Thread />
      </PageSection>

      <PageSection title={p.numbersTitle} className="ab-numbers">
        <Numbers />
      </PageSection>

      <PageSection title={p.processTitle} className="ab-process">
        <ol className="ab-steps">
          {process.map((s) => (
            <li className="ab-step" key={s.title} data-reveal>
              <span className="ab-step-dot" aria-hidden="true" />
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </li>
          ))}
        </ol>
      </PageSection>

      <LoomContact />
    </PageShell>
  )
}

/**
 * The story on one thread: horizontal on desktop, vertical on phones. The fill follows the scroll and each knot
 * lights as the fill reaches it. Without JS or under reduced motion the thread is shown fully drawn.
 */
function Thread() {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(
        { desktop: '(min-width: 900px)', reduce: '(prefers-reduced-motion: reduce)' },
        (ctx) => {
          const { desktop, reduce } = ctx.conditions as { desktop: boolean; reduce: boolean }
          const el = root.current
          if (reduce || !el) return
          const knots = gsap.utils.toArray<HTMLElement>('.ab-knot', el)
          const track = el.querySelector<HTMLElement>('.ab-thread-track')
          if (!track) return
          // Where each knot sits along the track (0..1), measured on every refresh.
          let at: number[] = []
          const measure = () => {
            const t = track.getBoundingClientRect()
            at = knots.map((k) => {
              const r = k.getBoundingClientRect()
              return desktop ? (r.left + r.width / 2 - t.left) / t.width : (r.top + r.height / 2 - t.top) / t.height
            })
          }
          const light = (progress: number) =>
            knots.forEach((k, i) => k.classList.toggle('is-lit', progress >= (at[i] ?? 1) - 0.01))

          el.classList.add('is-live')
          const axis = desktop ? 'scaleX' : 'scaleY'
          gsap.fromTo(
            '.ab-thread-fill',
            { [axis]: 0 },
            {
              [axis]: 1,
              ease: 'none',
              scrollTrigger: {
                trigger: el,
                start: desktop ? 'top 75%' : 'top 70%',
                end: desktop ? 'bottom 45%' : 'bottom 55%',
                scrub: true,
                onRefresh: (st) => {
                  measure()
                  light(st.progress)
                },
                onUpdate: (st) => light(st.progress),
              },
            },
          )
          return () => el.classList.remove('is-live')
        },
        root,
      )
    },
    { scope: root },
  )

  return (
    <div ref={root} className="ab-thread">
      <span className="ab-thread-track" aria-hidden="true">
        <span className="ab-thread-fill" />
      </span>
      <ol className="ab-moments">
        {aboutPage.story.map((s) => (
          <li className="ab-moment" key={s.year}>
            <span className="ab-knot" aria-hidden="true">
              <i />
            </span>
            <p className="mono ab-moment-year">{s.year}</p>
            <h3>{s.title}</h3>
            <p>{s.text}</p>
          </li>
        ))}
      </ol>
    </div>
  )
}

/** The three stats. CountUp runs on mount, so it is only mounted once the row is on screen. */
function Numbers() {
  const root = useRef<HTMLDListElement>(null)
  const [seen, setSeen] = useState(false)

  useEffect(() => {
    const el = root.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          setSeen(true)
          io.disconnect()
        }
      },
      { rootMargin: '0px 0px -15% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <dl ref={root} className="ab-stats">
      {stats.map((s, i) => (
        <div className="ab-stat" key={s.label}>
          <dt className="ab-stat-label">{s.label}</dt>
          <dd className="ab-stat-value">
            {seen ? (
              <CountUp value={s.value} suffix={s.suffix} delay={i * 120} group={!s.plain} />
            ) : (
              // Holds the final width so the row does not shift when the count starts.
              <span className="ab-stat-hold">
                {s.value}
                {s.suffix}
              </span>
            )}
          </dd>
        </div>
      ))}
    </dl>
  )
}
