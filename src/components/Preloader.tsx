import { useGSAP } from '@gsap/react'
import { useRef, useState } from 'react'
import { gsap, lockScroll } from '@/hooks/motion'
import { festive as festiveCopy, preloaderCopy } from '@/content/site'
import { type Festive, diwaliArt, diwaliSky } from '@/lib/festive'
import type { Gate } from '@/lib/loadGate'
import { Logo } from './Logo'

/**
 * Counter-driven intro (0 → 100) that wipes away to reveal the scene. With a `gate` it waits until everything is
 * loaded (fonts, the page, both 3D scenes compiled and drawn): the counter follows real progress up to 90, holds
 * there, and finishes once the gate opens (the gate itself times out, so this never hangs). Reduced motion: a
 * still loader that simply disappears when ready. With `festive` (Diwali) the centre is a kolam that draws in with
 * the counter round a lit diya (lib/festive.ts); everything else is the same.
 */
export function Preloader({
  reducedMotion,
  onDone,
  gate,
  caption = 'Organising the chaos',
  festive = null,
}: {
  reducedMotion: boolean
  onDone: () => void
  gate?: Gate | null
  caption?: string
  festive?: Festive | null
}) {
  const root = useRef<HTMLDivElement>(null)
  const [gone, setGone] = useState(false)
  // The home page ships this same markup in its HTML (lib/snapshot.ts, `is-boot`) so the loader paints before any
  // script runs. Read during the first render, before React's commit replaces that copy with this one.
  const [booted] = useState(
    () => typeof document !== 'undefined' && !!document.querySelector('#root > .preloader.is-boot'),
  )

  useGSAP(
    () => {
      const ready = gate?.ready ?? Promise.resolve()
      lockScroll(true)
      let cancelled = false
      const finish = () => {
        lockScroll(false)
        setGone(true)
      }

      if (reducedMotion) {
        ready.then(() => {
          if (cancelled) return
          onDone()
          finish()
        })
        return () => {
          cancelled = true
          lockScroll(false)
        }
      }

      const num = root.current!.querySelector('.pre-num')!
      const bar = root.current!.querySelector<HTMLElement>('.pre-bar > i')!
      const kolam = root.current!.querySelector<SVGPathElement>('.dw-kolam')
      const counter = { v: 0 }
      const show = () => {
        num.textContent = String(Math.round(counter.v)).padStart(3, '0')
        bar.style.transform = `scaleX(${counter.v / 100})`
        kolam?.style.setProperty('stroke-dashoffset', String(1 - counter.v / 100))
      }
      const markIn = gsap.from('.pre-mark', { scale: 0.6, opacity: 0, rotate: -20, duration: 1, ease: 'expo.out' })
      // The HTML copy already played (part of) this intro in CSS since its first paint: carry on from there.
      if (booted) {
        const painted = performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? 0
        markIn.progress(Math.min(1, Math.max(0, (performance.now() - painted) / 1000)))
      }

      // Climb towards the real progress (capped at 90 until the gate opens), never faster than a smooth count.
      const climb = () => {
        const target = Math.min(90, 12 + (gate?.progress() ?? 1) * 78)
        if (target > counter.v) counter.v += Math.max(0.4, (target - counter.v) * 0.08)
        show()
      }
      gsap.ticker.add(climb)
      const minShown = new Promise((r) => setTimeout(r, 1400))

      Promise.all([ready, minShown]).then(() => {
        if (cancelled) return
        gsap.ticker.remove(climb)
        gsap
          .timeline({ onComplete: finish })
          .to(counter, { v: 100, duration: 0.45, ease: 'power2.out', onUpdate: show })
          .to('.pre-inner', { opacity: 0, y: -20, duration: 0.5, ease: 'power2.in' }, '+=0.15')
          // The festive fireworks (none on the usual loader: an empty list, so GSAP has nothing to warn about).
          .to(root.current!.querySelectorAll('.dw-sky'), { opacity: 0, duration: 0.5 }, '<')
          .add(onDone, '<')
          .to('.pre-panel', { yPercent: -100, duration: 1, ease: 'expo.inOut', stagger: 0.06 }, '<0.1')
      })
      return () => {
        cancelled = true
        gsap.ticker.remove(climb)
        lockScroll(false)
      }
    },
    { scope: root },
  )

  if (gone) return null
  return (
    <div
      ref={root}
      className={festive ? 'preloader is-diwali' : 'preloader'}
      role="status"
      aria-label={festive ? festiveCopy.diwali.label : preloaderCopy.label}
    >
      <div className="pre-panels" aria-hidden="true">
        {Array.from({ length: 5 }, (_, i) => (
          <span className="pre-panel" key={i} />
        ))}
      </div>
      {festive && <div className="dw-sky" aria-hidden="true" dangerouslySetInnerHTML={{ __html: diwaliSky() }} />}
      {festive ? (
        <div className="pre-inner pre-diwali">
          <Logo className="dw-logo" height={36} />
          {/* Shared markup string (lib/festive.ts), so the HTML copy (lib/snapshot.ts) matches it exactly. */}
          <span className="pre-mark dw-art" dangerouslySetInnerHTML={{ __html: diwaliArt() }} />
          <span className="dw-greet serif">{festiveCopy.diwali.greeting}</span>
          <span className="pre-num mono">000</span>
          <span className="pre-bar">
            <i />
          </span>
          <span className="pre-caption mono">{festiveCopy.diwali.caption}</span>
        </div>
      ) : (
        <div className="pre-inner">
          <span className="pre-mark">
            <Logo height={44} />
          </span>
          <span className="pre-num mono">000</span>
          <span className="pre-bar">
            <i />
          </span>
          <span className="pre-caption mono">{caption}</span>
        </div>
      )}
    </div>
  )
}
