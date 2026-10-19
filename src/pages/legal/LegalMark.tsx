import { useId } from 'react'

// The quiet hero visual of the legal pages: a shield with a lock in a few glowing threads in the site's blue, drawn
// once (CSS in legal.css; static under reduced motion).

const SHIELD = 'M100 14 C126 30 154 36 180 38 C180 122 158 180 100 224 C42 180 20 122 20 38 C46 36 74 30 100 14 Z'
// The same outline, pulled in towards the centre: three threads that never quite overlap.
const THREADS = [
  { scale: 1, colour: '#4d9fff', width: 1.6, opacity: 0.9 },
  { scale: 0.91, colour: '#8cc4ff', width: 1, opacity: 0.55 },
  { scale: 0.82, colour: '#8b7bff', width: 0.9, opacity: 0.45 },
]

export function LegalMark() {
  const id = useId().replace(/:/g, '')
  return (
    <div className="lg-mark is-shield" aria-hidden="true">
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
      </svg>
    </div>
  )
}
