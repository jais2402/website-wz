import { useGSAP } from '@gsap/react'
import { useRef, useState } from 'react'
import { gsap, lockScroll } from '@/hooks/motion'
import type { Gate } from '@/lib/loadGate'
import { LogoMark } from './Logo'

/**
 * Counter-driven intro (0 → 100) that wipes away to reveal the scene. With a `gate` it waits until everything is
 * loaded (fonts, the page, both 3D scenes compiled and drawn): the counter follows real progress up to 90, holds
 * there, and finishes once the gate opens (the gate itself times out, so this never hangs). Reduced motion: a
 * still loader that simply disappears when ready.
 */
export function Preloader({
  reducedMotion,
  onDone,
  gate,
  caption = 'Organising the chaos',
}: {
  reducedMotion: boolean
  onDone: () => void
  gate?: Gate | null
  caption?: string
}) {
  const root = useRef<HTMLDivElement>(null)
  const [gone, setGone] = useState(false)

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
      const counter = { v: 0 }
      const show = () => {
        num.textContent = String(Math.round(counter.v)).padStart(3, '0')
        bar.style.transform = `scaleX(${counter.v / 100})`
      }
      gsap.from('.pre-mark', { scale: 0.6, opacity: 0, rotate: -20, duration: 1, ease: 'expo.out' })

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
    <div ref={root} className="preloader" role="status" aria-label="Loading">
      <div className="pre-panels" aria-hidden="true">
        {Array.from({ length: 5 }, (_, i) => (
          <span className="pre-panel" key={i} />
        ))}
      </div>
      <div className="pre-inner">
        <span className="pre-mark">
          <LogoMark size={56} />
        </span>
        <span className="pre-num mono">000</span>
        <span className="pre-bar">
          <i />
        </span>
        <span className="pre-caption mono">{caption}</span>
      </div>
    </div>
  )
}
