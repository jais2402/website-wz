import { useEffect, useRef } from 'react'
import { principles, storySection } from '@/content/site'
import { stillPaths } from '@/lib/story2d'

const W = 400
const H = 300
const STAGES = [1, 2, 3] as const

/**
 * One settled story shape as a still: the same threads as the 3D story, added up as light, with its haze (and the
 * sphere's core). Drawn once on a 2D canvas (again only when the card's width changes), so scrolling costs nothing.
 */
function PrincipleArt({ stage }: { stage: 1 | 2 | 3 }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const el = ref.current
    const ctx = el?.getContext('2d')
    if (!el || !ctx || typeof Path2D === 'undefined') return
    const paths = stillPaths(stage, W, H).map((p) => ({
      path: new Path2D(p.d),
      style: `rgba(${p.color.map((c) => Math.round((c + (0.85 - c) * 0.4) * 255)).join(',')},${p.alpha.toFixed(3)})`,
    }))
    let drawn = 0
    const draw = () => {
      const w = el.clientWidth
      if (!w || w === drawn) return
      drawn = w
      const k = (w * Math.min(window.devicePixelRatio || 1, 2)) / W
      el.width = Math.round(W * k)
      el.height = Math.round(H * k)
      ctx.setTransform(k, 0, 0, k, 0, 0)
      const haze = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, H * 0.55)
      haze.addColorStop(0, `rgba(150,140,220,${stage === 1 ? 0.12 : 0.26})`)
      haze.addColorStop(1, 'rgba(150,140,220,0)')
      ctx.fillStyle = haze
      ctx.fillRect(0, 0, W, H)
      ctx.globalCompositeOperation = 'lighter'
      ctx.lineWidth = 0.7
      for (const p of paths) {
        ctx.strokeStyle = p.style
        ctx.stroke(p.path)
      }
      ctx.globalCompositeOperation = 'source-over'
      if (stage === 3) {
        const core = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, 36)
        core.addColorStop(0, '#fff')
        core.addColorStop(0.42, '#fff')
        core.addColorStop(0.5, 'rgba(235,232,255,0.3)')
        core.addColorStop(1, 'rgba(200,190,255,0)')
        ctx.fillStyle = core
        ctx.fillRect(0, 0, W, H)
      }
    }
    draw()
    window.addEventListener('resize', draw)
    return () => window.removeEventListener('resize', draw)
  }, [stage])

  return <canvas ref={ref} className="pr-art" aria-hidden="true" />
}

/**
 * The story for browsers without WebGL: Simplify, Scale and Secure as one plain section of three cards, each with
 * a still of its thread shape. Replaces the pinned scroll story (Story.tsx), which needs the 3D canvas.
 */
export function StoryStatic() {
  return (
    <section className="panel pr" aria-label="Our principles">
      <div className="wrap">
        <p className="mono label">{storySection.kicker}</p>
        <h2 className="display pr-heading">{storySection.title}</h2>
        <ul className="pr-grid">
          {principles.map((p, i) => (
            <li key={p.key} className="pr-card">
              <PrincipleArt stage={STAGES[i]} />
              <h3 className="pr-title">{p.title}.</h3>
              <p className="pr-body">{p.body}</p>
              <ul className="chip-row">
                {p.chips.map((c) => (
                  <li className="chip" key={c}>
                    {c}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
