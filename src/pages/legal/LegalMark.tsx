import { useId } from 'react'

// The quiet hero visual of the legal pages and the sitemap: a few glowing threads in the site's blue, drawn once
// (CSS in legal.css; static under reduced motion). `shield` is a shield with a lock, `map` a small tree of pages.

const SHIELD = 'M100 14 C126 30 154 36 180 38 C180 122 158 180 100 224 C42 180 20 122 20 38 C46 36 74 30 100 14 Z'
// The same outline, pulled in towards the centre: three threads that never quite overlap.
const THREADS = [
  { scale: 1, colour: '#4d9fff', width: 1.6, opacity: 0.9 },
  { scale: 0.91, colour: '#8cc4ff', width: 1, opacity: 0.55 },
  { scale: 0.82, colour: '#8b7bff', width: 0.9, opacity: 0.45 },
]

// Sitemap tree: root at the top, four groups, two or three pages under each.
const GROUPS: [number, number][] = [
  [34, 112],
  [78, 112],
  [122, 112],
  [166, 112],
]
const LEAVES: [number, number][] = [
  [26, 178],
  [42, 206],
  [72, 182],
  [86, 212],
  [116, 186],
  [130, 214],
  [158, 180],
  [174, 208],
]
const MAP_LINKS = [
  ...GROUPS.map(([x, y]) => `M100 40 C100 76 ${x} 76 ${x} ${y}`),
  ...LEAVES.map(([x, y], i) => {
    const [gx, gy] = GROUPS[Math.floor(i / 2)]
    return `M${gx} ${gy} C${gx} ${gy + 30} ${x} ${y - 30} ${x} ${y}`
  }),
]
const MAP_NODES: [number, number, number][] = [
  [100, 40, 6],
  ...GROUPS.map(([x, y]) => [x, y, 4.5] as [number, number, number]),
  ...LEAVES.map(([x, y]) => [x, y, 2.6] as [number, number, number]),
]

export function LegalMark({ variant = 'shield' }: { variant?: 'shield' | 'map' }) {
  const id = useId().replace(/:/g, '')
  return (
    <div className={`lg-mark is-${variant}`} aria-hidden="true">
      <svg viewBox="0 0 200 240" focusable="false">
        <defs>
          <filter id={`${id}-glow`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <clipPath id={`${id}-clip`}>
            <path d={SHIELD} />
          </clipPath>
        </defs>
        {variant === 'shield' ? (
          <g filter={`url(#${id}-glow)`} fill="none" strokeLinecap="round" strokeLinejoin="round">
            {/* Faint weft lines woven across the inside of the shield. */}
            <g clipPath={`url(#${id}-clip)`} className="lg-mark-weft" stroke="#8cc4ff" strokeWidth="0.6">
              {[60, 84, 108, 132, 156, 180, 204].map((y) => (
                <path key={y} d={`M10 ${y} C70 ${y - 8} 130 ${y + 8} 190 ${y}`} />
              ))}
            </g>
            {THREADS.map((t) => (
              <path
                key={t.scale}
                className="lg-mark-thread"
                d={SHIELD}
                pathLength={1}
                stroke={t.colour}
                strokeWidth={t.width / t.scale}
                strokeOpacity={t.opacity}
                transform={`translate(100 120) scale(${t.scale}) translate(-100 -120)`}
              />
            ))}
            {/* The lock: shackle, body and keyhole. */}
            <path
              className="lg-mark-thread"
              pathLength={1}
              d="M86 116 V104 a14 14 0 0 1 28 0 V116"
              stroke="#8cc4ff"
              strokeWidth="1.6"
            />
            <rect
              className="lg-mark-thread"
              pathLength={1}
              x="78"
              y="116"
              width="44"
              height="36"
              rx="7"
              stroke="#4d9fff"
              strokeWidth="1.6"
            />
            <path className="lg-mark-thread" pathLength={1} d="M100 128 V140" stroke="#ededf3" strokeWidth="2" />
            <circle className="lg-mark-knot" cx="100" cy="128" r="3" fill="#ededf3" />
          </g>
        ) : (
          <g filter={`url(#${id}-glow)`} fill="none" strokeLinecap="round">
            {/* A home node, four groups, and their pages: one thread from each knot to the next. */}
            {MAP_LINKS.map((d, i) => (
              <path
                key={d}
                className="lg-mark-thread"
                pathLength={1}
                d={d}
                stroke={i < 4 ? '#4d9fff' : '#8cc4ff'}
                strokeWidth={i < 4 ? 1.5 : 1}
                strokeOpacity={i < 4 ? 0.9 : 0.55}
              />
            ))}
            {MAP_NODES.map(([x, y, r]) => (
              <circle
                key={`${x}-${y}`}
                className="lg-mark-knot"
                cx={x}
                cy={y}
                r={r}
                fill={r > 4 ? '#ededf3' : '#8cc4ff'}
              />
            ))}
          </g>
        )}
      </svg>
    </div>
  )
}
