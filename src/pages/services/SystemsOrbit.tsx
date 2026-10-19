import type { CSSProperties } from 'react'
import { navSystems } from '@/content/site'

/**
 * Systems overview hero visual: the six systems as nodes on a tilted ring round a glowing core, each tied to it by
 * a thread. The ring turns slowly; labels counter-rotate so they always face the viewer. CSS 3D only.
 */
export function SystemsOrbit() {
  return (
    <div className="so" aria-hidden="true">
      <div className="so-tilt">
        <div className="so-spin">
          <span className="so-ring" />
          <span className="so-ring is-inner" />
          {navSystems.map((s, i) => {
            const a = `${(360 / navSystems.length) * i}deg`
            return (
              <span key={s.href} className="so-arm" style={{ '--a': a } as CSSProperties}>
                <span className="so-thread" />
                <span className="so-node">
                  <span className="so-label mono">{s.short}</span>
                </span>
              </span>
            )
          })}
        </div>
      </div>
      <span className="so-core" />
    </div>
  )
}
