import { useGSAP } from '@gsap/react'
import { type CSSProperties, lazy, Suspense, useEffect, useRef, useState } from 'react'
import { SplitReveal } from '@/components/Reveal'
import { LoomLiteArt } from '@/components/LiteArt'
import { ctas, loom, navSystems } from '@/content/site'
import { useLite } from '@/hooks/useLite'
import { gsap, ScrollTrigger, scrollToTarget } from '@/hooks/motion'
import { loomStore } from './store'

// The time-loom hero and the "weave" in/out section. Used by the main site (index.html) and the loom page.
// Styles live in loom.css, which both entries import.

const LoomScene = lazy(() => import('./LoomScene').then((m) => ({ default: m.LoomScene })))

/** Pinned hero: scroll flies the camera into the loom while the copy steps through three phases. */
export function LoomHero({ reducedMotion, introReady }: { reducedMotion: boolean; introReady: boolean }) {
  const { lite, fallBack } = useLite()
  const root = useRef<HTMLElement>(null)
  const [phase, setPhase] = useState(-1)
  const [active, setActive] = useState(true)
  const [ready, setReady] = useState(false)

  // If the GPU drops the WebGL context (common on low-memory phones), swap to the static art.
  useEffect(() => {
    const canvas = root.current?.querySelector('.loom-canvas canvas')
    if (!ready || !canvas) return
    const onLost = () => fallBack('WebGL context lost')
    canvas.addEventListener('webglcontextlost', onLost)
    return () => canvas.removeEventListener('webglcontextlost', onLost)
  }, [ready, fallBack])

  // Pause the WebGL loop when the hero is fully off screen.
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting))
    if (root.current) io.observe(root.current)
    return () => io.disconnect()
  }, [])

  // Headline intro plays once the preloader wipes away (same sequencing as Concept A).
  useGSAP(
    () => {
      if (!introReady) return
      gsap
        .timeline({ defaults: { ease: 'expo.out' } })
        .fromTo('.loom-line > span', { yPercent: 115 }, { yPercent: 0, duration: 1.5, stagger: 0.1 })
        .fromTo('.loom-fade', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, stagger: 0.08 }, 0.5)
    },
    { scope: root, dependencies: [introReady] },
  )

  useGSAP(
    () => {
      ScrollTrigger.create({
        trigger: root.current,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (st) => {
          loomStore.progress = st.progress
          loomStore.order = Math.min(1, st.progress * 1.4)
          setPhase(st.progress < 0.12 ? -1 : Math.min(2, Math.floor((st.progress - 0.12) / 0.29)))
        },
      })
    },
    { scope: root },
  )

  return (
    <section id="top" ref={root} className="loom-hero" aria-label={loom.title.join(' ')}>
      <div className="loom-sticky">
        <div className={`loom-canvas${ready || lite ? ' is-ready' : ''}`} aria-hidden="true">
          {lite ? (
            <LoomLiteArt />
          ) : (
            <Suspense fallback={null}>
              <LoomScene reducedMotion={reducedMotion} active={active} onReady={() => setReady(true)} />
            </Suspense>
          )}
        </div>

        <div className={`loom-intro${phase >= 0 ? ' is-gone' : ''}`}>
          <p className="mono loom-eyebrow loom-fade">{loom.eyebrow}</p>
          <h1 className="loom-title">
            {loom.title.map((l, i) => (
              <span className="loom-line" key={l}>
                <span className={i === 2 ? 'serif' : undefined}>{l}</span>
              </span>
            ))}
          </h1>
          <p className="loom-sub loom-fade">{loom.sub}</p>
          <div className="loom-actions loom-fade">
            <a className="btn btn-lime" href={ctas.contact.href}>
              {ctas.contact.label} <span aria-hidden="true">→</span>
            </a>
            <a
              className="btn btn-ghost"
              href={ctas.hero.secondary.href}
              onClick={(e) => {
                e.preventDefault()
                scrollToTarget(ctas.hero.secondary.href)
              }}
            >
              {ctas.hero.secondary.label}
            </a>
          </div>
          {/* Straight to the system pages; one swipeable row on phones. */}
          <nav className="loom-systems loom-fade" aria-label={loom.systemsLine}>
            <span className="mono loom-systems-label">{loom.systemsLine}</span>
            <ul>
              {navSystems.map((s) => (
                <li key={s.href}>
                  <a href={s.href} className="mono" title={s.label}>
                    {s.short}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="loom-phases">
          {loom.phases.map((p, i) => (
            <article key={p.title} className={`loom-phase${i === phase ? ' is-active' : ''}`} aria-hidden={i !== phase}>
              <span className="mono">{p.kicker}</span>
              <h2>{p.title}</h2>
              <p>{p.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

// Phone "heap": where each crossed-out workaround lands in the tangle (x %, y px, rotation deg).
const HEAP = [
  [2, 0, -6],
  [36, 14, 5],
  [10, 40, -3],
  [42, 58, 7],
  [0, 86, -8],
  [30, 104, 4],
  [14, 130, -5],
  [40, 150, 6],
]

/**
 * Inputs on the left, outputs on the right, joined by animated threads that converge through a knot.
 * Phones: the inputs sit in a tangled heap; scrolling pulls each one into the knot and the outcomes come out below.
 */
export function Weave() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(max-width: 899px) and (prefers-reduced-motion: no-preference)', () => {
        const knot = root.current!.querySelector<HTMLElement>('.weave-knot-m')!
        const pile = root.current!.querySelector<HTMLElement>('.weave-in')!
        const heap = gsap.utils.toArray<HTMLElement>('.weave-in li')
        // Offset from an item's centre to the knot's centre. Uses layout offsets (both inside .weave-grid), which
        // ignore transforms, so a refresh mid-animation still measures from the untouched heap.
        const toKnot = (el: HTMLElement, axis: 'x' | 'y') =>
          axis === 'x'
            ? knot.offsetLeft + knot.offsetWidth / 2 - (pile.offsetLeft + el.offsetLeft + el.offsetWidth / 2)
            : knot.offsetTop + knot.offsetHeight / 2 - (pile.offsetTop + el.offsetTop + el.offsetHeight / 2)
        gsap.set(heap, { rotate: (i: number) => HEAP[i % HEAP.length][2] })
        gsap
          .timeline({
            scrollTrigger: {
              trigger: '.weave-grid',
              start: 'top 70%',
              end: 'bottom 85%',
              scrub: 0.8,
              invalidateOnRefresh: true,
            },
          })
          .to(heap, {
            x: (_, el) => toKnot(el, 'x'),
            y: (_, el) => toKnot(el, 'y'),
            rotate: 0,
            scale: 0.15,
            opacity: 0,
            ease: 'power2.in',
            duration: 1,
            stagger: 0.12,
          })
          .to(knot, { scale: 1.8, duration: 0.3, ease: 'power2.out' }, '-=0.4')
          .to(knot, { scale: 1, duration: 0.4, ease: 'power2.inOut' })
          .from(
            '.weave-out li',
            { y: -24, opacity: 0, scale: 0.9, duration: 0.6, stagger: 0.14, ease: 'back.out(1.6)' },
            '-=0.5',
          )
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section id="weave" ref={root} className="panel weave">
      <div className="wrap">
        <SplitReveal as="h2" className="display weave-title" text={loom.weave.title} />
        <div className="weave-grid">
          <ul className="weave-in">
            {loom.threadsIn.map((t, i) => {
              const [x, y] = HEAP[i % HEAP.length]
              return (
                <li key={t} style={{ '--hx': `${x}%`, '--hy': `${y}px` } as CSSProperties}>
                  <s>{t}</s>
                </li>
              )
            })}
          </ul>
          <span className="weave-knot-m" aria-hidden="true" />
          <svg className="weave-svg" viewBox="0 0 400 400" preserveAspectRatio="none" aria-hidden="true">
            {loom.threadsIn.map((_, i) => {
              const y = 25 + i * (350 / (loom.threadsIn.length - 1))
              return (
                <path
                  key={`i${i}`}
                  d={`M0 ${y} C 120 ${y}, 140 200, 200 200`}
                  className="weave-thread"
                  style={{ animationDelay: `${i * -0.3}s` }}
                />
              )
            })}
            {loom.threadsOut.map((_, i) => {
              const y = 40 + i * (320 / (loom.threadsOut.length - 1))
              return (
                <path
                  key={`o${i}`}
                  d={`M200 200 C 260 200, 280 ${y}, 400 ${y}`}
                  className="weave-thread is-out"
                  style={{ animationDelay: `${i * -0.25}s` }}
                />
              )
            })}
            <circle cx="200" cy="200" r="16" className="weave-knot" />
          </svg>
          <ul className="weave-out">
            {loom.threadsOut.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
