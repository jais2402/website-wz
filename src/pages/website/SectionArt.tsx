import { useEffect, useRef, useState, type ReactNode } from 'react'
import { websitePage as p } from '@/content/pages'
import { pastWork } from '@/content/site'

/** Adds `is-in` the first time the element comes on screen, so its CSS entrance plays once. */
function InView({ className, children }: { className: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    // Once in, stays in: the entrance plays once and does not replay when the visitor scrolls back up.
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setInView(true), { threshold: 0.2 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <div ref={ref} className={`${className}${inView ? ' is-in' : ''}`}>
      {children}
    </div>
  )
}

/**
 * Beside "What every site includes": four gauges that fill as the section arrives (speed, accessible, best practice,
 * search), with the checks every launch passes beneath. No numbers: it shows what is checked, not a score.
 */
export function IncludesGauges() {
  return (
    <InView className="ig">
      <div className="ig-card">
        <div className="ig-gauges">
          {p.gauges.map((g, i) => (
            <div key={g} className="ig-gauge" style={{ ['--i' as string]: i }}>
              <svg viewBox="0 0 64 64" focusable="false">
                <circle className="ig-track" cx="32" cy="32" r="26" pathLength={100} />
                <circle className="ig-fill" cx="32" cy="32" r="26" pathLength={100} />
                <path className="ig-tick" d="M24 33l6 6 11-13" pathLength={1} />
              </svg>
              <span>{g}</span>
            </div>
          ))}
        </div>
        <ul className="ig-checks mono">
          {p.gaugeChecks.map((c, i) => (
            <li key={c} style={{ ['--i' as string]: i }}>
              <i />
              {c}
            </li>
          ))}
        </ul>
      </div>
    </InView>
  )
}

/**
 * Beside "Stores and portals we have built": the proof cases as stacked panels in 3D, each in its sector's colour,
 * strung on one thread with a knot per panel. They spread apart as the section arrives.
 */
export function WorkStack() {
  const cases = p.proofCases.flatMap((id) => pastWork.filter((c) => c.id === id))
  return (
    <InView className="ws">
      <div className="ws-stage">
        {cases.map((c, i) => (
          <div key={c.id} className={`ws-panel tone-${c.tone}`} style={{ ['--i' as string]: i }}>
            <span className="mono ws-sector">
              <i />
              {c.sector}
            </span>
            <b />
            <b className="is-short" />
            <span className="ws-tags">
              {c.tags.slice(0, 2).map((t) => (
                <em key={t}>{t}</em>
              ))}
            </span>
          </div>
        ))}
        <svg className="ws-thread" viewBox="0 0 40 300" preserveAspectRatio="none" focusable="false">
          <path pathLength={1} d="M20 0 C34 50 6 90 20 150 S34 250 20 300" />
        </svg>
      </div>
    </InView>
  )
}
