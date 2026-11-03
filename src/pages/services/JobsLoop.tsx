import { servicesPage as p } from '@/content/pages'
import { services } from '@/content/site'

// Three stations on a ring (top, bottom right, bottom left), the order of the three jobs.
const STATIONS = [
  { x: 160, y: 34 },
  { x: 269, y: 223 },
  { x: 51, y: 223 },
]

/**
 * Beside "What we do for every system": the three jobs as one cycle round your system. Build, connect, keep it
 * running, then round again as the system grows. A pulse travels the ring while the section is on screen.
 * Decorative: the three cards below say the same in text.
 */
export function JobsLoop() {
  return (
    <div className="jl">
      <svg className="jl-ring" viewBox="0 0 320 300" focusable="false">
        <defs>
          <linearGradient id="jl-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--lime)" />
            <stop offset="0.5" stopColor="var(--violet)" />
            <stop offset="1" stopColor="var(--coral)" />
          </linearGradient>
        </defs>
        <circle cx="160" cy="160" r="126" className="jl-track" />
        <circle cx="160" cy="160" r="126" className="jl-arc" pathLength={100} />
      </svg>
      <span className="jl-pulse" />
      <div className="jl-core">
        <span className="mono">{p.loopCore}</span>
        <b>{p.loopCoreTitle}</b>
      </div>
      {services.map((s, i) => (
        <div key={s.key} className={`jl-node tone-${s.tone}`} style={{ left: `${(STATIONS[i].x / 320) * 100}%`, top: `${(STATIONS[i].y / 300) * 100}%` }}>
          <i>{i + 1}</i>
          <span>{s.kicker}</span>
        </div>
      ))}
    </div>
  )
}
