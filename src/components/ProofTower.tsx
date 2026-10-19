import { useGSAP } from '@gsap/react'
import { type CSSProperties, useRef } from 'react'
import { gsap } from '@/hooks/motion'
import './proofTower.css'

const YEARS = 12

/**
 * Beside "Twelve years of building…": a woven tower the loom builds as you scroll in, one plate per year since
 * 2012, held by four glowing warp threads. The guide light comes to rest on its top (`.proof-tower-top`).
 * CSS 3D only; fully built under reduced motion.
 */
export function ProofTower() {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const el = root.current!
        const state = { built: 0 }
        el.style.setProperty('--built', '0')
        gsap.to(state, {
          built: 1,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top 85%', end: 'center 45%', scrub: 0.6 },
          onUpdate: () => el.style.setProperty('--built', state.built.toFixed(3)),
        })
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <div ref={root} className="proof-tower" aria-hidden="true">
      <div className="proof-tower-scene">
        {Array.from({ length: YEARS }, (_, i) => (
          <span key={i} className="proof-plate" style={{ '--i': i } as CSSProperties}>
            {i === 0 && <span className="proof-plate-label mono">2012</span>}
            {i === YEARS - 1 && <span className="proof-plate-label mono">Today</span>}
          </span>
        ))}
        {[0, 1, 2, 3].map((k) => (
          <span key={k} className={`proof-warp is-${k}`} />
        ))}
        <span className="proof-tower-top" />
      </div>
    </div>
  )
}
