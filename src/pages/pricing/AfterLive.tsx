import type { CSSProperties } from 'react'
import { pricingPage } from '@/content/pages'
import { useSeen } from './useSeen'

const ICONS: Record<string, string> = {
  backup: 'M4 5c0-1.1 2.7-2 6-2s6 .9 6 2-2.7 2-6 2-6-.9-6-2Zm0 0v10c0 1.1 2.7 2 6 2s6-.9 6-2V5M4 10c0 1.1 2.7 2 6 2s6-.9 6-2',
  shield: 'M10 2.5 16 5v4.6c0 3.7-2.5 6.6-6 7.9-3.5-1.3-6-4.2-6-7.9V5l6-2.5Zm-2.6 7.6 1.9 1.9 3.4-3.6',
  spark: 'M10 2.5v4M10 13.5v4M2.5 10h4M13.5 10h4M4.7 4.7l2.6 2.6M12.7 12.7l2.6 2.6M15.3 4.7l-2.6 2.6M7.3 12.7l-2.6 2.6',
  chat: 'M3.5 5.5c0-1.1.9-2 2-2h9c1.1 0 2 .9 2 2v6c0 1.1-.9 2-2 2H9l-3.5 3v-3h0c-1.1 0-2-.9-2-2v-6Z',
}

// A calm heartbeat across a 320 × 56 box: flat runs with a beat every 80 units.
const BEAT = (x: number) => `L${x} 32 L${x + 8} 32 L${x + 13} 14 L${x + 19} 46 L${x + 24} 26 L${x + 29} 32`
const PULSE = `M0 32 ${[24, 104, 184, 264].map(BEAT).join(' ')} L320 32`

/**
 * After launch: the system's status window, in the white app-window style of the cream section. A heartbeat line
 * draws across and keeps a slow pulse running along it, the status reads "All running", and the activity rows
 * arrive one by one when the window first scrolls in. Paused off screen; finished and still under reduced motion.
 * Decorative: the ledger beside it says what we do after launch in text.
 */
export function AfterLive() {
  const a = pricingPage.afterLive
  const { ref, seen, visible } = useSeen<HTMLDivElement>(0.3)
  return (
    <div
      ref={ref}
      className={`pr-live glass-card${seen ? ' is-on' : ''}${visible ? ' is-visible' : ''}`}
      aria-hidden="true"
    >
      <div className="pr-live-bar">
        <span className="pr-live-dots">
          <i />
          <i />
          <i />
        </span>
        <span className="pr-live-title">{a.title}</span>
      </div>
      <div className="pr-live-body">
        <div className="pr-live-status">
          <span className="pr-live-pill">
            <i />
            {a.status}
          </span>
          <span className="mono pr-live-tag">{a.pulse}</span>
        </div>
        <svg className="pr-live-beat" viewBox="0 0 320 56">
          <path className="pr-live-base" d="M0 32 L320 32" />
          <path className="pr-live-line" d={PULSE} pathLength={1} />
          <path className="pr-live-scan" d={PULSE} pathLength={1} />
        </svg>
        <p className="mono pr-live-label">{a.logLabel}</p>
        <ul className="pr-live-log">
          {a.log.map((r, i) => (
            <li key={r.text} style={{ '--i': i } as CSSProperties}>
              <span className={`pr-live-icon is-${r.icon}`}>
                <svg viewBox="0 0 20 20">
                  <path d={ICONS[r.icon]} />
                </svg>
              </span>
              <span className="pr-live-text">
                {r.text} <em>· {r.state}</em>
              </span>
              <span className="mono pr-live-when">{r.when}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
