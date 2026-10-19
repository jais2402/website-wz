import type { CSSProperties } from 'react'
import { pastWork, work } from '@/content/site'
import { WEAVE_H, WEAVE_KNOT, WEAVE_W, weaveThreads } from '@/lib/caseArt'

const cases = [...work, ...pastWork]
// Same seeds as the case motifs, so each thread belongs to its case.
const threads = weaveThreads(cases.map((_, i) => i + 1))

/**
 * Portfolio hero visual: one tangled thread per case, all pulled through one glowing knot and leaving as ordered
 * lines, each ending in that case's own knot and sector. Threads draw in once on load (not under reduced motion).
 */
export function PortfolioWeave() {
  return (
    <div className="pf-weave" aria-hidden="true">
      <svg viewBox={`0 0 ${WEAVE_W} ${WEAVE_H}`} preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id="pf-weave-glow">
            <stop offset="0" stopColor="#8cc4ff" stopOpacity="0.55" />
            <stop offset="1" stopColor="#8cc4ff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx={WEAVE_KNOT.x} cy={WEAVE_KNOT.y} r="90" fill="url(#pf-weave-glow)" className="pf-weave-halo" />
        {threads.map((t, i) => {
          const c = cases[i]
          return (
            <g key={c.id} className={`pf-weave-thread tone-${c.tone}`} style={{ '--i': i } as CSSProperties}>
              <circle cx={t.start.x} cy={t.start.y} r="2.5" className="pf-weave-loose" />
              <path d={t.tangle} pathLength={1} className="pf-weave-in" />
              <path d={t.out} pathLength={1} className="pf-weave-out" />
              <circle cx={t.end.x} cy={t.end.y} r="5" className="pf-weave-end" />
              <text x={t.end.x + 14} y={t.end.y + 4} className="pf-weave-label">
                {c.sector}
              </text>
            </g>
          )
        })}
        <circle cx={WEAVE_KNOT.x} cy={WEAVE_KNOT.y} r="9" className="pf-weave-knot" />
      </svg>
    </div>
  )
}
