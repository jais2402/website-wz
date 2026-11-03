import { forwardRef } from 'react'
import { loom, sampleDataLabel } from '@/content/site'

/**
 * The "after" dashboard: one system with live figures, used by the Before/After slider and the 2D hero
 * (ChaosHero). Figures and names are invented and the window carries `sampleDataLabel`.
 */
export const SystemApp = forwardRef<HTMLDivElement, { className?: string }>(function SystemApp({ className }, ref) {
  const app = loom.beforeAfter.app
  return (
    <div ref={ref} className={`ba-app${className ? ` ${className}` : ''}`}>
      <div className="win-bar">
        <i />
        <i />
        <i />
        <span className="mono">{app.url}</span>
        <span className="mono win-sample">{sampleDataLabel}</span>
      </div>
      <div className="ba-app-body">
        <div className="ba-kpis">
          {app.kpis.map((k) => (
            <b key={k.label}>
              <small>{k.label}</small>
              {k.value}
            </b>
          ))}
        </div>
        <svg className="ba-chart" viewBox="0 0 300 80" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 64 L40 58 L80 60 L120 44 L160 46 L200 30 L240 26 L300 12" />
          <path d="M0 64 L40 58 L80 60 L120 44 L160 46 L200 30 L240 26 L300 12 L300 80 L0 80 Z" className="fill" />
        </svg>
        <ul className="ba-rows">
          {app.rows.map((r) => (
            <li key={r.label}>
              {r.label} <em>{r.status}</em>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
})
