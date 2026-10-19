import type { CSSProperties } from 'react'
import { pricingPage } from '@/content/pages'
import { pricing } from '@/content/site'

// Thread field in a 400 × 300 box. The box keeps that aspect ratio, so the HTML labels (placed in %) sit on the
// thread ends at every width. Setters along the top; the two that never count at the sides; one knot; one line down.
const W = 400
const H = 300
const KNOT = { x: 200, y: 216 }
const SETS = [72, 200, 328].map((x) => ({ x, y: 36 }))
const NEVER = [
  { x: 56, y: 174, cut: { x: 150, y: 205 } },
  { x: 344, y: 174, cut: { x: 250, y: 205 } },
]
const pct = (v: number, of: number) => `${(v / of) * 100}%`

const setPath = (x: number, y: number, i: number) =>
  i === 1
    ? `M${x} ${y} C ${x - 34} ${y + 64}, ${x + 34} ${y + 116}, ${KNOT.x} ${KNOT.y}`
    : `M${x} ${y} C ${x} ${y + 92}, ${KNOT.x} ${y + 96}, ${KNOT.x} ${KNOT.y}`
const neverPath = (n: (typeof NEVER)[number]) =>
  `M${n.x} ${n.y} C ${(n.x * 2 + n.cut.x) / 3} ${n.y + 2}, ${(n.x + n.cut.x * 2) / 3} ${n.cut.y - 10}, ${n.cut.x} ${n.cut.y}`

/**
 * Pricing hero visual: scope, integrations and process change are threads pulled through one knot into a single
 * price; hours and technology are threads cut short before they reach it. Draws in once on load (static under
 * reduced motion). Decorative: the same facts are in the section below.
 */
export function PriceTie() {
  const t = pricingPage.ticket
  return (
    <div className="pr-tie" aria-hidden="true">
      <div className="pr-tie-field">
        <svg viewBox={`0 0 ${W} ${H}`}>
          <defs>
            <radialGradient id="pr-tie-glow">
              <stop offset="0" stopColor="#8cc4ff" stopOpacity="0.55" />
              <stop offset="1" stopColor="#8cc4ff" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="pr-tie-out" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#eaf4ff" />
              <stop offset="1" stopColor="#4d9fff" />
            </linearGradient>
          </defs>
          <circle cx={KNOT.x} cy={KNOT.y} r="70" fill="url(#pr-tie-glow)" className="pr-tie-halo" />
          {SETS.map((s, i) => (
            <path
              key={s.x}
              d={setPath(s.x, s.y, i)}
              pathLength={1}
              className={`pr-tie-set tone-${['lime', 'violet', 'coral'][i]}`}
              style={{ '--i': i } as CSSProperties}
            />
          ))}
          {NEVER.map((n, i) => (
            <g key={n.x} className="pr-tie-never" style={{ '--i': i } as CSSProperties}>
              <path d={neverPath(n)} />
              <path
                className="pr-tie-cut"
                d={`M${n.cut.x - 6} ${n.cut.y - 6} L${n.cut.x + 6} ${n.cut.y + 6} M${n.cut.x + 6} ${n.cut.y - 6} L${n.cut.x - 6} ${n.cut.y + 6}`}
              />
            </g>
          ))}
          <path
            d={`M${KNOT.x} ${KNOT.y} L${KNOT.x} ${H}`}
            pathLength={1}
            className="pr-tie-out"
            stroke="url(#pr-tie-out)"
          />
          <circle cx={KNOT.x} cy={KNOT.y} r="8" className="pr-tie-knot" />
        </svg>
        {pricing.sets.map((s, i) => (
          <span
            key={s.name}
            className={`pr-tie-chip tone-${['lime', 'violet', 'coral'][i]}`}
            style={{ left: pct(SETS[i].x, W), top: pct(SETS[i].y, H) }}
          >
            {s.name}
          </span>
        ))}
        {pricing.doesnt.map((d, i) => (
          <span key={d} className="pr-tie-chip is-never" style={{ left: pct(NEVER[i].x, W), top: pct(NEVER[i].y, H) }}>
            <s>{d}</s>
          </span>
        ))}
      </div>
      <div className="glass-card pr-ticket">
        <div className="price-card-head mono">
          <span>{t.head}</span>
          <span className="price-stamp">{t.stamp}</span>
        </div>
        <div className="price-total">
          <span className="mono">{t.priceLabel}</span>
          <b>{t.price}</b>
          <span className="mono">{t.timelineLabel}</span>
          <b>{t.timeline}</b>
        </div>
      </div>
    </div>
  )
}
