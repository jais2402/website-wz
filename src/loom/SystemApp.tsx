import { forwardRef } from 'react'
import { loom, sampleDataLabel } from '@/content/site'

/**
 * The "after" dashboard: one system with live figures, used by the Before/After slider and the 2D hero
 * (ChaosHero). `extended` adds the hero's sync status, reminders and action buttons. Figures and names are
 * invented and the window carries `sampleDataLabel`.
 */
export const SystemApp = forwardRef<HTMLDivElement, { className?: string; extended?: boolean }>(function SystemApp(
  { className, extended = false },
  ref,
) {
  const app = loom.beforeAfter.app
  const more = loom.chaos.app
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
        {extended && (
          <p className="mono sys-sync">
            <i aria-hidden="true" />
            {more.sync}
          </p>
        )}
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
        {extended && (
          <>
            <div className="sys-reminders">
              <p className="mono">{more.remindersTitle}</p>
              <ul className="ba-rows">
                {more.reminders.map((r) => (
                  <li key={r.label}>
                    <span>
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15L6 16ZM10 20a2 2 0 0 0 4 0" />
                      </svg>
                      {r.label}
                    </span>
                    <em>{r.status}</em>
                  </li>
                ))}
              </ul>
            </div>
            <div className="sys-actions">
              <span className="sys-btn is-primary">{more.actions.primary}</span>
              <span className="sys-btn">{more.actions.secondary}</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
})
