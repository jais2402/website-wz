import type { CSSProperties } from 'react'
import { technologyPage } from '@/content/site'

/**
 * Technology hero visual: the six layers of a Wezigns system (Screens → Hosting) as glowing plates stacked in 3D,
 * with a light dropping through them. CSS 3D only; static under reduced motion.
 */
export function StackVisual() {
  const layers = technologyPage.layers
  return (
    <div className="tech-stack3d" aria-hidden="true">
      <div className="tech-stack3d-scene">
        {layers.map((l, i) => (
          <div key={l.name} className="tech-plate" style={{ '--i': i, '--n': layers.length } as CSSProperties}>
            <span className="tech-plate-grid" />
            <span className="tech-plate-label mono">{l.name}</span>
          </div>
        ))}
        <span className="tech-stack3d-drop" />
      </div>
    </div>
  )
}
