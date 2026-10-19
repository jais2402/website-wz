import { ART_H, ART_W, KNOT, orderedThreads, tangleThreads } from '@/lib/caseArt'

/**
 * Case motif: this case's tangle pulled into a knot and leaving as clean lines, in the case's accent colour
 * (`--tone` on an ancestor). Used on the home page's Our Work cards and on /portfolio.
 */
export function CaseArt({ seed, className = '' }: { seed: number; className?: string }) {
  return (
    <svg
      className={`case-art ${className}`.trim()}
      viewBox={`0 0 ${ART_W} ${ART_H}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      {tangleThreads(seed).map((d, k) => (
        <path key={`t${k}`} d={d} className="case-art-tangle" style={{ opacity: 0.35 + (k % 3) * 0.15 }} />
      ))}
      {orderedThreads().map((d, k) => (
        <path key={`o${k}`} d={d} className="case-art-out" />
      ))}
      <circle cx={KNOT.x} cy={KNOT.y} r="5" className="case-art-knot" />
    </svg>
  )
}
