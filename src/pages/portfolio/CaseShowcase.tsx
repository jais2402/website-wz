import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { portfolioPage } from '@/content/pages'
import { pastWork, work } from '@/content/site'
import { usePrefersReducedMotion } from '@/hooks/motion'
import { stackSlot } from '@/lib/portfolio'

type Screen = (typeof portfolioPage.showcase.screens)[number]

const cases = [...work, ...pastWork]
const screens = portfolioPage.showcase.screens.flatMap((s) => {
  const c = cases.find((x) => x.id === s.id)
  if (!c) return []
  // Only a case with published results gets a chip, and it says exactly what the case study says.
  const result = 'metrics' in c ? c.metrics[0] : null
  return [{ ...s, sector: c.sector, result }]
})
const N = screens.length
const STEP_MS = 3800

/**
 * Portfolio hero visual: a floating 3D stack of drawn product screens, one per case. Every few seconds the front
 * screen sinks to the back. The stack leans toward a fine pointer, stops while off screen or in a hidden tab, and
 * stays still under reduced motion. CSS 3D and code-drawn UI only; decorative.
 */
export function CaseShowcase() {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const [step, setStep] = useState(0)

  // Rotation: only while on screen, in a visible tab, and with motion allowed.
  useEffect(() => {
    const el = ref.current
    if (!el || reduced) return
    let onScreen = true
    let timer = 0
    const stop = () => {
      window.clearInterval(timer)
      timer = 0
    }
    const sync = () => {
      const run = onScreen && document.visibilityState === 'visible'
      if (run && !timer) timer = window.setInterval(() => setStep((s) => s + 1), STEP_MS)
      else if (!run) stop()
    }
    let io: IntersectionObserver | null = null
    if (typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(([e]) => {
        onScreen = e.isIntersecting
        sync()
      })
      io.observe(el)
    }
    document.addEventListener('visibilitychange', sync)
    sync()
    return () => {
      stop()
      io?.disconnect()
      document.removeEventListener('visibilitychange', sync)
    }
  }, [reduced])

  // Tilt toward a fine pointer. Written straight to CSS variables: no React state per move.
  useEffect(() => {
    const el = ref.current
    if (!el || reduced || !window.matchMedia('(pointer: fine)').matches) return
    const host = el.closest('.pg-hero') ?? el
    let frame = 0
    let x = 0
    let y = 0
    const apply = () => {
      frame = 0
      el.style.setProperty('--px', x.toFixed(3))
      el.style.setProperty('--py', y.toFixed(3))
    }
    const move = (e: Event) => {
      const p = e as PointerEvent
      const r = el.getBoundingClientRect()
      x = Math.max(-1, Math.min(1, (p.clientX - (r.left + r.width / 2)) / (r.width / 2 + 200)))
      y = Math.max(-1, Math.min(1, (p.clientY - (r.top + r.height / 2)) / (r.height / 2 + 200)))
      if (!frame) frame = requestAnimationFrame(apply)
    }
    const leave = () => {
      x = 0
      y = 0
      if (!frame) frame = requestAnimationFrame(apply)
    }
    host.addEventListener('pointermove', move)
    host.addEventListener('pointerleave', leave)
    return () => {
      host.removeEventListener('pointermove', move)
      host.removeEventListener('pointerleave', leave)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [reduced])

  const active = step % N
  return (
    <div className="pf-show" ref={ref} aria-hidden="true">
      <div className="pf-show-stage">
        {screens.map((s, i) => {
          const slot = stackSlot(i, active, N)
          // The screen that just left the front sinks out and fades back in at the rear (not on first paint).
          const sinking = step > 0 && slot === N - 1
          return (
            <div
              key={s.id}
              className={`pf-screen tone-${s.tone}${slot === 0 ? ' is-front' : ''}${sinking ? ' is-sinking' : ''}`}
              style={{ '--s': slot, zIndex: N - slot } as CSSProperties}
            >
              <div className="pf-screen-bar">
                <span className="pf-screen-dots">
                  <i />
                  <i />
                  <i />
                </span>
                <span className="mono pf-screen-tag">{s.sector}</span>
                <span className="pf-screen-app">{s.app}</span>
              </div>
              <div className={`pf-screen-body is-${s.id}`}>
                <ScreenBody s={s} />
              </div>
              {s.result && (
                <p className="pf-screen-chip">
                  <b>{s.result.value}</b> {s.result.label}
                </p>
              )}
            </div>
          )
        })}
      </div>
      <span className="pf-show-floor" />
    </div>
  )
}

function Rows({ s }: { s: Screen }) {
  return (
    <ul className="pf-ui-rows">
      {s.rows.map((r, i) => (
        <li key={r}>
          <span className="pf-ui-avatar" />
          <span className="pf-ui-name">{r}</span>
          <span className="pf-ui-skel" style={{ '--w': `${46 - i * 9}%` } as CSSProperties} />
          <span className={`mono pf-ui-pill${i === 0 ? ' is-on' : ''}`}>{s.status[i]}</span>
        </li>
      ))}
    </ul>
  )
}

function Kpis({ s }: { s: Screen }) {
  return (
    <div className="pf-ui-kpis">
      {s.labels.map((l, i) => (
        <div key={l} className="pf-ui-kpi">
          <span className="mono">{l}</span>
          <span className="pf-ui-bar" style={{ '--w': `${86 - i * 18}%` } as CSSProperties} />
        </div>
      ))}
    </div>
  )
}

function ScreenBody({ s }: { s: Screen }) {
  switch (s.id) {
    case 'safety-training':
      return (
        <>
          <Kpis s={s} />
          <div className="pf-ui-split">
            <Rows s={s} />
            <div className="pf-ui-ring">
              <span />
            </div>
          </div>
        </>
      )
    case 'marketplace':
      return (
        <>
          <div className="pf-ui-chart">
            <span className="mono">{s.labels[0]}</span>
            <svg viewBox="0 0 200 60" preserveAspectRatio="none">
              <path className="pf-ui-area" d="M0 58 C40 56 60 50 90 42 S150 18 200 4 L200 60 L0 60 Z" />
              <path className="pf-ui-line" d="M0 58 C40 56 60 50 90 42 S150 18 200 4" />
            </svg>
          </div>
          <Rows s={s} />
        </>
      )
    case 'engineering-event':
      return (
        <>
          <p className="mono pf-ui-live">
            <i /> {s.labels[0]}
          </p>
          <div className="pf-ui-heat">
            {Array.from({ length: 24 }, (_, i) => (
              <span key={i} style={{ '--h': ((i * 37) % 11) / 10 } as CSSProperties} />
            ))}
          </div>
          <Rows s={s} />
        </>
      )
    case 'online-retail':
      return (
        <div className="pf-ui-shop">
          <div className="pf-ui-grid">
            {s.rows.concat(s.rows).map((r, i) => (
              <div key={i} className={`pf-ui-product p${i % 3}`}>
                <span className="pf-ui-thumb" />
                <span className="pf-ui-name">{r}</span>
              </div>
            ))}
          </div>
          <div className="pf-ui-cart">
            <span className="mono">{s.labels[1]}</span>
            <span className="pf-ui-skel" />
            <span className="pf-ui-skel" />
            <span className="pf-ui-btn" />
          </div>
        </div>
      )
    default:
      return (
        <>
          <div className="pf-ui-courses">
            {s.rows.map((r) => (
              <div key={r} className="pf-ui-course">
                <span className="pf-ui-thumb" />
                <span className="pf-ui-name">{r}</span>
              </div>
            ))}
          </div>
          <Rows s={s} />
        </>
      )
  }
}
