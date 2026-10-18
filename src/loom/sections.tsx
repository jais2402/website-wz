import { useGSAP } from '@gsap/react'
import { useEffect, useRef, useState } from 'react'
import { CountUp } from '@/components/Charts'
import { EnquiryForm } from '@/components/EnquiryForm'
import { BuildArt, ConnectArt, RunArt } from '@/components/Illustrations'
import { Marquee } from '@/components/Proof'
import { SplitReveal } from '@/components/Reveal'
import { loom, process, services, stats, tools, work } from '@/content/site'
import { gsap, scrollToTarget } from '@/hooks/motion'

/** Mounts children only once the element scrolls into view, so count-ups start when seen. */
function useInView<T extends Element>(threshold = 0.35) {
  const ref = useRef<T>(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setSeen(true)
        io.disconnect()
      }
    }, { threshold })
    if (ref.current) io.observe(ref.current)
    return () => io.disconnect()
  }, [threshold])
  return [ref, seen] as const
}

/** Side rail: a gold thread down the page with a knot per section; the active knot lights up. Desktop only. */
export function ThreadRail() {
  const [active, setActive] = useState(0)
  const [visible, setVisible] = useState(false)
  const fill = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const targets = loom.rail.map((r) => document.querySelector(r.href)).filter(Boolean) as Element[]
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(targets.indexOf(e.target))
        }
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    targets.forEach((t) => io.observe(t))
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      if (fill.current) fill.current.style.transform = `scaleY(${max > 0 ? window.scrollY / max : 0})`
      setVisible(window.scrollY > window.innerHeight * 0.6)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      io.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <nav className={`thread-rail${visible ? ' is-visible' : ''}`} aria-label="Page sections">
      <span className="thread-rail-line" aria-hidden="true">
        <span ref={fill} />
      </span>
      {loom.rail.map((r, i) => (
        <a
          key={r.href}
          href={r.href}
          className={i === active ? 'is-active' : i < active ? 'is-past' : undefined}
          onClick={(e) => {
            e.preventDefault()
            scrollToTarget(r.href)
          }}
        >
          <i aria-hidden="true" />
          <span>{r.label}</span>
        </a>
      ))}
    </nav>
  )
}

export function Untangle() {
  return (
    <section className="untangle" aria-label="Threads we untangle">
      <Marquee items={loom.untangle} />
      <Marquee items={tools} reverse />
    </section>
  )
}

export function LoomStats() {
  const [ref, seen] = useInView<HTMLDivElement>()
  return (
    <section id="stats" className="panel loom-stats">
      <div className="wrap">
        <p className="mono label">{loom.stats.kicker}</p>
        <SplitReveal as="h2" className="display" text={loom.stats.title} />
        <div className="loom-stat-row" ref={ref}>
          {stats.map((s, i) => (
            <div key={s.label} className="loom-stat glass-card">
              <span className="loom-stat-thread" aria-hidden="true" />
              <b>{seen ? <CountUp value={s.value} suffix={s.suffix} delay={i * 120} group={!s.plain} /> : s.plain ? s.value : 0}</b>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/** Drag (or use arrow keys) to wipe between the tangled "before" and the woven "after". */
export function BeforeAfter() {
  const root = useRef<HTMLElement>(null)
  const [pos, setPos] = useState(50)
  const touched = useRef(false)

  // Once, when it comes into view, sweep the handle to show it can be dragged.
  useGSAP(
    () => {
      const o = { v: 50 }
      gsap
        .timeline({ scrollTrigger: { trigger: '.ba-stage', start: 'top 70%', once: true } })
        .to(o, { v: 18, duration: 0.9, ease: 'power2.inOut', onUpdate: () => !touched.current && setPos(o.v) })
        .to(o, { v: 82, duration: 1.3, ease: 'power2.inOut', onUpdate: () => !touched.current && setPos(o.v) })
        .to(o, { v: 50, duration: 0.9, ease: 'power2.inOut', onUpdate: () => !touched.current && setPos(o.v) })
    },
    { scope: root },
  )

  const b = loom.beforeAfter
  return (
    <section id="before-after" ref={root} className="panel before-after">
      <div className="wrap">
        <SplitReveal as="h2" className="display ba-title" text={b.title} />

        <div className="ba-stage" style={{ ['--pos' as string]: `${pos}%` }}>
          {/* Before: the tangle */}
          <div className="ba-layer ba-before" aria-hidden="true">
            <svg className="ba-tangle" viewBox="0 0 600 360" preserveAspectRatio="none">
              {Array.from({ length: 14 }, (_, i) => (
                <path
                  key={i}
                  d={`M${-20 + i * 9} ${30 + ((i * 53) % 300)} C ${120 + i * 20} ${(i * 97) % 360}, ${260 - i * 6} ${360 - ((i * 71) % 360)}, ${620} ${(i * 41) % 360}`}
                />
              ))}
            </svg>
            <span className="ba-note n1">orders_FINAL_v7.xlsx</span>
            <span className="ba-note n2">orders_FINAL_v8_REAL.xlsx</span>
            <span className="ba-note n3">
              <i className="badge">42</i> Ops WhatsApp group
            </span>
            <span className="ba-note n4">Fwd: Fwd: approval??</span>
            <span className="ba-sticky s1">count stock Fri!!</span>
            <span className="ba-sticky s2">ask Ravi for the Monday report</span>
            <span className="ba-note n5">
              <i className="badge">!</i> Invoice #0193 missing
            </span>
          </div>

          {/* After: one system */}
          <div className="ba-layer ba-after" aria-hidden="true">
            <div className="ba-app">
              <div className="win-bar">
                <i />
                <i />
                <i />
                <span className="mono">ops.wezigns.app</span>
              </div>
              <div className="ba-app-body">
                <div className="ba-kpis">
                  <b>
                    <small>Orders today</small>1,284
                  </b>
                  <b>
                    <small>On time</small>98.2%
                  </b>
                  <b>
                    <small>Approvals pending</small>0
                  </b>
                </div>
                <svg className="ba-chart" viewBox="0 0 300 80" preserveAspectRatio="none">
                  <path d="M0 64 L40 58 L80 60 L120 44 L160 46 L200 30 L240 26 L300 12" />
                  <path d="M0 64 L40 58 L80 60 L120 44 L160 46 L200 30 L240 26 L300 12 L300 80 L0 80 Z" className="fill" />
                </svg>
                <ul className="ba-rows">
                  <li>
                    PO-2231 · Apex Industrial <em>Approved</em>
                  </li>
                  <li>
                    Stock · Finished goods <em>Live</em>
                  </li>
                  <li>
                    Weekly report <em>Auto · Mon 9:00</em>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <span className="ba-tag ba-tag-before mono">Before</span>
          <span className="ba-tag ba-tag-after mono">After</span>
          <span className="ba-handle" aria-hidden="true">
            <i>
              {/* SVG, not a text glyph: a character's baseline sits it below the circle's centre. */}
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12h18M7 8l-4 4 4 4M17 8l4 4-4 4" />
              </svg>
            </i>
          </span>
          <input
            className="ba-range"
            type="range"
            min={0}
            max={100}
            step={0.5}
            value={pos}
            aria-label="Compare before and after"
            onChange={(e) => {
              touched.current = true
              setPos(Number(e.target.value))
            }}
          />
        </div>

        <div className="ba-lists">
          <ul className="ba-list-before">
            {b.before.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <ul className="ba-list-after">
            {b.after.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

const ART = { build: BuildArt, connect: ConnectArt, run: RunArt }

export function Looms() {
  return (
    <section id="services" className="panel looms">
      <div className="wrap">
        <p className="mono label">{loom.looms.kicker}</p>
        <SplitReveal as="h2" className="display" text={loom.looms.title} />
        <div className="loom-cards">
          {services.map((s, i) => {
            const Art = ART[s.key]
            return (
              <article key={s.key} className={`loom-card glass-card tone-${s.tone}`}>
                <span className="mono loom-card-num">Loom 0{i + 1}</span>
                <Art />
                <h3>{s.kicker}</h3>
                <p>{s.title}</p>
                <ul>
                  {s.items.map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/** Each case study as a thread: the tangle on the left, the four stages as knots, the result on the right. */
export function Timelines() {
  const root = useRef<HTMLElement>(null)
  useGSAP(
    () => {
      gsap.utils.toArray<HTMLElement>('.tl').forEach((el) => {
        gsap.fromTo(
          el.querySelector('.tl-thread-fill'),
          { scaleX: 0 },
          { scaleX: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 75%', end: 'top 30%', scrub: true } },
        )
        gsap.from(el.querySelectorAll('.tl-knot'), {
          scale: 0,
          stagger: 0.12,
          ease: 'back.out(2)',
          duration: 0.6,
          scrollTrigger: { trigger: el, start: 'top 70%' },
        })
      })
    },
    { scope: root },
  )

  return (
    <section id="work" ref={root} className="panel timelines">
      <div className="wrap">
        <p className="mono label">{loom.timelines.kicker}</p>
        <SplitReveal as="h2" className="display" text={loom.timelines.title} />
        {work.map((c) => (
          <article key={c.id} className={`tl glass-card tone-${c.tone}`}>
            <header className="tl-head">
              <span className="mono tl-tag">
                {c.sector} · {c.place}
              </span>
              <h3>{c.title}</h3>
            </header>
            <div className="tl-track">
              <div className="tl-start">
                <span className="tl-tangle" aria-hidden="true" />
                <span className="mono">{c.sector}</span>
                <span>{c.tags.join(' · ')}</span>
              </div>
              <div className="tl-thread">
                <span className="tl-thread-line" aria-hidden="true">
                  <span className="tl-thread-fill" />
                </span>
                {process.map((p) => (
                  <span key={p.title} className="tl-knot">
                    <i aria-hidden="true" />
                    <span className="mono">{p.title}</span>
                  </span>
                ))}
              </div>
              <div className="tl-end">
                {c.metrics.map((m) => (
                  <div key={m.label}>
                    <b>{m.value}</b>
                    <span>{m.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export function LoomContact() {
  return (
    <section id="contact" className="panel loom-contact">
      <div className="wrap loom-contact-grid">
        <div>
          <p className="mono label">{loom.contact.kicker}</p>
          <SplitReveal as="h2" className="display loom-contact-title" text={loom.contact.title} />
          <p className="lead">{loom.contact.body}</p>
        </div>
        <div className="glass-card loom-contact-card">
          <EnquiryForm />
        </div>
      </div>
    </section>
  )
}
