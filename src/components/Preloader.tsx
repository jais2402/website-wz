import { useGSAP } from '@gsap/react'
import { useRef, useState } from 'react'
import { gsap, lockScroll } from '@/hooks/motion'
import { LogoMark } from './Logo'

/** Counter-driven intro (0 → 100) that wipes away to reveal the scene. Skipped instantly for reduced motion. */
export function Preloader({
  reducedMotion,
  onDone,
  caption = 'Organising the chaos',
}: {
  reducedMotion: boolean
  onDone: () => void
  caption?: string
}) {
  const root = useRef<HTMLDivElement>(null)
  const [gone, setGone] = useState(false)

  useGSAP(
    () => {
      if (reducedMotion) {
        setGone(true)
        onDone()
        return
      }
      lockScroll(true)
      const counter = { v: 0 }
      const num = root.current!.querySelector('.pre-num')!
      const tl = gsap.timeline({
        onComplete: () => {
          lockScroll(false)
          setGone(true)
        },
      })
      tl.to(counter, {
        v: 100,
        duration: 2.1,
        ease: 'power2.inOut',
        onUpdate: () => {
          num.textContent = String(Math.round(counter.v)).padStart(3, '0')
        },
      })
        .to('.pre-bar > i', { scaleX: 1, duration: 2.1, ease: 'power2.inOut' }, 0)
        .from('.pre-mark', { scale: 0.6, opacity: 0, rotate: -20, duration: 1, ease: 'expo.out' }, 0)
        .to('.pre-inner', { opacity: 0, y: -20, duration: 0.5, ease: 'power2.in' }, '+=0.15')
        .add(onDone, '<')
        .to('.pre-panel', { yPercent: -100, duration: 1, ease: 'expo.inOut', stagger: 0.06 }, '<0.1')
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
