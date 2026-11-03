import { useEffect, type CSSProperties } from 'react'
import { pricingPage } from '@/content/pages'
import { pricing } from '@/content/site'
import { useSeen } from './useSeen'

const TONES = ['lime', 'violet', 'coral']
// Where each line item's thread comes in from (0..40 in its box): three different heights so they read as threads.
const THREAD_FROM = [6, 34, 14]
const SIGNATURE =
  'M4 30 C 12 8, 22 6, 20 22 S 26 34, 34 20 S 44 8, 46 22 S 52 32, 60 22 C 66 14, 70 14, 70 24 C 70 30, 78 30, 84 20 C 90 10, 96 12, 94 24 C 93 30, 100 30, 108 22 C 116 14, 124 16, 122 26 M 104 33 C 124 31, 142 27, 156 18'

/**
 * Pricing hero visual: a proposal sheet floating at an angle. Scope, integrations and process change fill in as line
 * items, each fed by a thread from the left; hours and technology show up as chips, get struck out and fall away;
 * then the price and timeline fields fill (words only, never amounts or dates), the sheet is signed and the
 * "Agreed before build" stamp presses on. Plays once when it first scrolls into view, then holds with a slow float;
 * every animation pauses off screen. Finished and still under reduced motion. Decorative: the copy says the same.
 */
export function ProposalSheet() {
  const d = pricingPage.proposal
  const { ref, seen, visible } = useSeen<HTMLDivElement>(0.2)

  // Pointer tilt, fine pointers only. Writes CSS variables, no React state per move.
  useEffect(() => {
    const el = ref.current
    if (!el || !window.matchMedia) return
    if (!window.matchMedia('(pointer: fine) and (prefers-reduced-motion: no-preference)').matches) return
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      el.style.setProperty('--tx', ((e.clientX - r.left) / r.width - 0.5).toFixed(3))
      el.style.setProperty('--ty', ((e.clientY - r.top) / r.height - 0.5).toFixed(3))
    }
    const leave = () => {
      el.style.setProperty('--tx', '0')
      el.style.setProperty('--ty', '0')
    }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
    }
  }, [ref])

  return (
    <div
      ref={ref}
      className={`pr-doc${seen ? ' is-on' : ''}${visible ? ' is-visible' : ''}`}
      aria-hidden="true"
    >
      <div className="pr-doc-tilt">
        <span className="pr-doc-shadow" />
        <span className="pr-doc-back" />
        <div className="pr-doc-sheet">
          <header className="pr-doc-head">
            <span className="mono pr-doc-from">
              <i className="pr-doc-mark" />
              {d.from}
            </span>
            <span className="mono pr-doc-stage">{d.stage}</span>
          </header>
          <p className="pr-doc-title">{d.title}</p>

          <p className="mono pr-doc-label">{d.setsLabel}</p>
          <ul className="pr-doc-items">
            {pricing.sets.map((s, i) => (
              <li key={s.name} className={`pr-doc-item tone-${TONES[i]}`} style={{ '--i': i } as CSSProperties}>
                <svg className="pr-doc-thread" viewBox="0 0 100 40" preserveAspectRatio="none">
                  <path
                    d={`M0 ${THREAD_FROM[i]} C 40 ${THREAD_FROM[i]}, 55 20, 100 20`}
                    pathLength={1}
                   
                  />
                  <path
                    className="pr-doc-pulse"
                    d={`M0 ${THREAD_FROM[i]} C 40 ${THREAD_FROM[i]}, 55 20, 100 20`}
                    pathLength={1}
                   
                  />
                </svg>
                <span className="pr-doc-knot" />
                <span className="pr-doc-item-body">
                  <b>{s.name}</b>
                  <span className="pr-doc-item-text">{s.text}</span>
                </span>
                <svg className="pr-doc-tick" viewBox="0 0 16 16">
                  <path d="M3.5 8.5 L6.8 11.5 L12.5 4.8" pathLength={1} />
                </svg>
              </li>
            ))}
          </ul>

          <div className="pr-doc-never">
            <p className="mono pr-doc-label">{d.neverLabel}</p>
            <div className="pr-doc-chips">
              {pricing.doesnt.map((x, i) => (
                <span key={x} className="pr-doc-chip" style={{ '--i': i } as CSSProperties}>
                  <span>{x}</span>
                </span>
              ))}
            </div>
          </div>

          <dl className="pr-doc-total">
            <div style={{ '--i': 0 } as CSSProperties}>
              <dt className="mono">{d.priceLabel}</dt>
              <dd>{d.price}</dd>
            </div>
            <div style={{ '--i': 1 } as CSSProperties}>
              <dt className="mono">{d.timelineLabel}</dt>
              <dd>{d.timeline}</dd>
            </div>
          </dl>

          <div className="pr-doc-foot">
            <div className="pr-doc-sign">
              <svg viewBox="0 0 160 40">
                <path d={SIGNATURE} pathLength={1} />
              </svg>
              <span className="mono">{d.sign}</span>
            </div>
            <span className="pr-doc-stamp">
              <span className="mono">{d.stamp}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
