import { useGSAP } from '@gsap/react'
import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { SplitReveal } from '@/components/Reveal'
import { LoomLiteArt } from '@/components/LiteArt'
import { loom } from '@/content/site'
import { useLite } from '@/hooks/useLite'
import { gsap, ScrollTrigger } from '@/hooks/motion'
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
          <p className="mono loom-eyebrow loom-fade">
            <span className="pulse" /> {loom.eyebrow}
          </p>
          <h1 className="loom-title">
            {loom.title.map((l, i) => (
              <span className="loom-line" key={l}>
                <span className={i === 2 ? 'serif' : undefined}>{l}</span>
              </span>
            ))}
          </h1>
          <p className="loom-sub loom-fade">{loom.sub}</p>
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

/** Inputs on the left, outputs on the right, joined by animated threads that converge through a knot. */
export function Weave() {
  return (
    <section id="weave" className="panel weave">
      <div className="wrap">
        <SplitReveal as="h2" className="display weave-title" text={loom.weave.title} />
        <div className="weave-grid">
          <ul className="weave-in">
            {loom.threadsIn.map((t) => (
              <li key={t}>
                <s>{t}</s>
              </li>
            ))}
          </ul>
          <svg className="weave-svg" viewBox="0 0 400 400" preserveAspectRatio="none" aria-hidden="true">
            {loom.threadsIn.map((_, i) => {
              const y = 25 + i * (350 / (loom.threadsIn.length - 1))
              return <path key={`i${i}`} d={`M0 ${y} C 120 ${y}, 140 200, 200 200`} className="weave-thread" style={{ animationDelay: `${i * -0.3}s` }} />
            })}
            {loom.threadsOut.map((_, i) => {
              const y = 40 + i * (320 / (loom.threadsOut.length - 1))
              return <path key={`o${i}`} d={`M200 200 C 260 200, 280 ${y}, 400 ${y}`} className="weave-thread is-out" style={{ animationDelay: `${i * -0.25}s` }} />
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
