import { useGSAP } from '@gsap/react'
import { canvasSlot } from '@/lib/canvasSlot'
import { homeGate } from '@/lib/loadGate'
import {
  type CSSProperties,
  Fragment,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { SplitReveal } from '@/components/Reveal'
import { ctas, loom, navSystems } from '@/content/site'
import { useAfterPaint } from '@/hooks/useAfterPaint'
import posters from '@/generated/posters.json'
import { measureFrames } from '@/gfx/frameTest'
import { gfx } from '@/gfx/gfxMode'
import { ScenePoster } from '@/gfx/ScenePoster'
import { FRAME_BUDGET_MS } from '@/lib/gfx'
import { gsap, ScrollTrigger, scrollToTarget } from '@/hooks/motion'
import { loomStore } from './store'
import { studio } from './studio'

// The time-loom hero and the "weave" in/out section. Used by the main site (index.html) and the loom page.
// Styles live in loom.css, which both entries import.

const LoomScene = lazy(() => import('./LoomScene').then((m) => ({ default: m.LoomScene })))
const progress = () => loomStore.progress
/** Longest the preloader waits for the hero poster itself. */
const POSTER_WAIT_MS = 3000
/** The camera glides into its resting framing (the poster's) over ~2 s after the scene mounts: fade in after. */
const CAMERA_SETTLE_MS = 2000
const wait = (ms: number) => new Promise((r) => window.setTimeout(r, ms))

/** Pinned hero: scroll flies the camera into the loom while the copy steps through three phases. */
export function LoomHero({ reducedMotion, introReady }: { reducedMotion: boolean; introReady: boolean }) {
  const root = useRef<HTMLElement>(null)
  const [phase, setPhase] = useState(-1)
  const [active, setActive] = useState(true)
  const [ready, setReady] = useState(false)
  // Poster first: the still shows at once; the live loom loads under it (if this machine may run it), passes a
  // frame test, then fades in. If it is too slow, or WebGL is lost, the still stays and three.js is let go.
  const [live, setLive] = useState(gfx.live)
  const tested = useRef(gfx.mode === 'live')
  const posterDone = useCallback(() => homeGate?.done('loom'), [])
  useEffect(() => {
    const t = window.setTimeout(posterDone, POSTER_WAIT_MS)
    return () => window.clearTimeout(t)
  }, [posterDone])
  const onSceneReady = useCallback(async () => {
    const settled = wait(CAMERA_SETTLE_MS)
    if (!tested.current) {
      const ms = await measureFrames()
      tested.current = true
      if (ms > FRAME_BUDGET_MS) {
        gfx.markSlow()
        setLive(false)
        homeGate?.done('loom')
        return
      }
    }
    await settled
    setReady(true)
    homeGate?.done('loom')
  }, [])
  // WebGL lost (driver reset, GPU process crash, or forced): back to the poster.
  useEffect(() => {
    if (!ready) return
    const canvas = root.current?.querySelector('.loom-canvas canvas')
    if (!canvas) return
    // Unmounting the scene (hero scrolled away) also loses the context on purpose; only a canvas still on the
    // page has really lost it.
    const lost = () =>
      queueMicrotask(() => {
        if (!canvas.isConnected) return
        setReady(false)
        setLive(false)
      })
    canvas.addEventListener('webglcontextlost', lost)
    return () => canvas.removeEventListener('webglcontextlost', lost)
  }, [ready])
  // The loom (three.js) starts loading once the hero copy has painted: it is under the preloader either way.
  const afterPaint = useAfterPaint({ idle: false })

  // Unmount the WebGL loom when the hero is fully off screen (and tell the fixed canvas it may mount).
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      setActive(e.isIntersecting)
      // The scene unmounts while the hero is off screen; coming back, the poster shows until it is drawn again.
      if (!e.isIntersecting) setReady(false)
      canvasSlot.setHeroVisible(e.isIntersecting)
    })
    if (root.current) io.observe(root.current)
    return () => {
      io.disconnect()
      canvasSlot.setHeroVisible(false)
    }
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
      if (studio?.cam != null) {
        loomStore.progress = studio.cam
        loomStore.order = Math.min(1, studio.cam * 1.4)
      }
      ScrollTrigger.create({
        trigger: root.current,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (st) => {
          // The video studio (dev only) holds the camera at its own scroll point.
          const p = studio?.cam ?? st.progress
          loomStore.progress = p
          loomStore.order = Math.min(1, p * 1.4)
          setPhase(st.progress < 0.12 ? -1 : Math.min(2, Math.floor((st.progress - 0.12) / 0.29)))
        },
      })
    },
    { scope: root },
  )

  return (
    <section id="top" ref={root} className="loom-hero" aria-label={loom.title.join(' ')}>
      <div className="loom-sticky">
        <ScenePoster
          poster={posters.hero}
          priority
          hidden={ready}
          drift={{ progress, active: !live && active }}
          // Light runs into the loom on the opening view; once the intro panel scrolls away the drift takes over.
          flow={active && phase < 0}
          // Machines that show the poster instead of the live loom get its looping video while the hero is on screen.
          video={!live && active}
          onLoad={posterDone}
        />
        <div className={`loom-canvas has-poster${ready ? ' is-ready' : ''}`} aria-hidden="true">
          {
            // Mounted only while the hero is on screen: one WebGL context at a time on the page.
            live && active && afterPaint && (
              <Suspense fallback={null}>
                <LoomScene reducedMotion={reducedMotion} active={active} onReady={onSceneReady} />
              </Suspense>
            )
          }
        </div>

        <div className={`loom-intro${phase >= 0 ? ' is-gone' : ''}`}>
          <p className="mono loom-eyebrow loom-fade">{loom.eyebrow}</p>
          <h1 className="loom-title">
            {/* The space between block lines keeps textContent readable ("thread, woven"); it renders nothing. */}
            {loom.title.map((l, i) => (
              <Fragment key={l}>
                {i > 0 && ' '}
                <span className="loom-line">
                  <span className={i === 2 ? 'serif' : undefined}>{l}</span>
                </span>
              </Fragment>
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
  const svgRef = useRef<SVGSVGElement>(null)
  // Where each list item's centre sits in the SVG's 0..400 viewBox, so every thread ends exactly on its row.
  const even = (n: number, a: number, b: number) =>
    Array.from({ length: n }, (_, i) => a + (i * (b - a)) / Math.max(1, n - 1))
  const [ends, setEnds] = useState(() => ({
    in: even(loom.threadsIn.length, 25, 375),
    out: even(loom.threadsOut.length, 40, 360),
  }))

  useLayoutEffect(() => {
    const svg = svgRef.current
    const grid = svg?.parentElement
    if (!svg || !grid) return
    const measure = () => {
      const box = svg.getBoundingClientRect()
      if (!box.height) return
      const centres = (sel: string) =>
        Array.from(grid.querySelectorAll<HTMLElement>(sel)).map((li) => {
          // Desktop only (the SVG is hidden on phones), where the rows carry no transforms that move their centres.
          const r = li.getBoundingClientRect()
          const y = r.top + r.height / 2 - box.top
          return Math.min(400, Math.max(0, (y / box.height) * 400))
        })
      const ins = centres('.weave-in > li')
      const outs = centres('.weave-out > li')
      if (ins.length && outs.length) setEnds({ in: ins, out: outs })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(grid)
    return () => ro.disconnect()
  }, [])

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
          <svg ref={svgRef} className="weave-svg" viewBox="0 0 400 400" preserveAspectRatio="none" aria-hidden="true">
            {loom.threadsIn.map((_, i) => {
              const y = ends.in[i] ?? 200
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
              const y = ends.out[i] ?? 200
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
