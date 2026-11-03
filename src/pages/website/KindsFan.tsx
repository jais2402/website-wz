import { useEffect, useRef, useState } from 'react'
import { websitePage as p } from '@/content/pages'

/** The five kinds of website as small browser windows, each drawn with its own tell-tale contents. */
function Screen({ kind }: { kind: number }) {
  switch (kind) {
    case 0: // Company site: nav, headline, a button and three tiles
      return (
        <>
          <i className="kf-nav" />
          <b className="kf-h" />
          <b className="kf-h is-short" />
          <span className="kf-btn" />
          <span className="kf-tiles">
            <i />
            <i />
            <i />
          </span>
        </>
      )
    case 1: // Store: product grid with prices and a cart badge
      return (
        <>
          <i className="kf-cart">2</i>
          <span className="kf-products">
            {[0, 1, 2, 3].map((n) => (
              <i key={n}>
                <em />
              </i>
            ))}
          </span>
        </>
      )
    case 2: // Landing page: one big promise, one field, one button
      return (
        <>
          <b className="kf-h is-big" />
          <b className="kf-h is-short" />
          <span className="kf-field" />
          <span className="kf-btn is-wide" />
        </>
      )
    case 3: // Portal: sidebar, signed-in avatar, rows with status
      return (
        <span className="kf-portal">
          <i className="kf-side" />
          <span className="kf-rows">
            <i className="kf-avatar" />
            {[0, 1, 2, 3].map((n) => (
              <i key={n} className={`kf-row${n === 1 ? ' is-on' : ''}`} />
            ))}
          </span>
        </span>
      )
    default: // Redesign: the dated old page giving way to the new one
      return (
        <span className="kf-redo">
          <span className="kf-old">
            <i />
            <i />
            <i />
          </span>
          <span className="kf-new">
            <b className="kf-h" />
            <span className="kf-btn" />
          </span>
        </span>
      )
  }
}

/**
 * Beside "Five kinds of website": the five windows fanned out in 3D. They spread when the section scrolls in, then
 * float; on a fine pointer, hovering opens the fan wider. Still (already spread) under reduced motion. Decorative:
 * the list below carries the same five kinds as text.
 */
export function KindsFan() {
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
    <div ref={ref} className={`kf${inView ? ' is-in' : ''}`} aria-hidden="true">
      {p.kindsLabels.map((label, i) => (
        <div key={label} className={`kf-win kf-${i}`} style={{ ['--i' as string]: i }}>
          <div className="kf-bar">
            <i />
            <i />
            <i />
            <span className="mono">{label}</span>
          </div>
          <div className="kf-screen">
            <Screen kind={i} />
          </div>
        </div>
      ))}
    </div>
  )
}
