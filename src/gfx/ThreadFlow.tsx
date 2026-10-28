import { useEffect, useRef } from 'react'
import { flowPoint, type Pt } from '@/lib/gfx'

// The loom's thread colours (the live scene's palette): pink, violet, ice blue, gold, mint, white.
const COLOURS = ['255,143,208', '180,155,255', '127,216,255', '255,210,127', '157,255,207', '255,255,255']
// Without a GPU, anything moving under the hero's frosted panel makes the browser redraw its blur, which holds the
// page at about 30 fps however little is drawn: no point drawing faster.
const FPS = 30

// Waves of light along the threads: how many at once, seconds from the tangle to the mouth, half-width (of the
// screen width) and peak strength.
const WAVES = 2
const WAVE_SECONDS = 3.6
const WAVE_HALF = 0.09
const WAVE_PEAK = 0.9

type Rider = { start: Pt; t: number; speed: number; colour: string; width: number }

/**
 * Motion for a poster still, so its threads feel drawn into the loom: waves of light travelling along the threads
 * into the mouth, and small glowing riders running the same way. The waves are the still itself, redrawn in a
 * moving band and screened over it (mix-blend-mode in loom.css), so only the threads brighten, not the dark.
 * A plain 2D canvas (no WebGL), sized for machines without a GPU: a narrow band of image and a few dozen strokes a
 * frame, at most 30 fps, at 1x pixels, and nothing at all while `active` is false or under reduced motion.
 * `mouth` is in 0..1 of the still; the still (the <img> beside this canvas) fills its box like object-fit: cover.
 */
export function ThreadFlow({
  mouth,
  image,
  active,
}: {
  mouth: Pt
  image: { width: number; height: number }
  active: boolean
}) {
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const el = canvas.current
    const ctx = el?.getContext('2d')
    if (!el || !ctx || !active) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let w = 0
    let h = 0
    let m: Pt = { x: 0, y: 0 }
    let left = 0
    let top = 0
    let dw = 0
    let dh = 0
    const still = el.parentElement?.querySelector('img')
    const fit = () => {
      w = el.clientWidth
      h = el.clientHeight
      el.width = Math.round(w)
      el.height = Math.round(h)
      // object-fit: cover, centred: where the still's mouth lands on screen.
      const scale = Math.max(w / image.width, h / image.height)
      dw = image.width * scale
      dh = image.height * scale
      left = (w - dw) / 2
      top = (h - dh) / 2
      m = { x: left + mouth.x * dw, y: top + mouth.y * dh }
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)

    const portrait = h > w
    const count = portrait ? 17 : 32
    const spawn = (r?: Rider): Rider => {
      // Start somewhere in the loose tangle left of the mouth; the further out, the wider the spread.
      const reach = Math.max(80, m.x - Math.max(left, -w * 0.05))
      const along = Math.random()
      const x = m.x - reach * (0.35 + along * 0.65)
      const spread = (portrait ? 0.16 : 0.42) * h * (0.35 + along)
      const rider = r ?? ({} as Rider)
      rider.start = { x, y: m.y + (Math.random() - 0.5) * 2 * spread }
      rider.t = 0
      rider.speed = 1 / (2.6 + Math.random() * 3.2)
      rider.colour = COLOURS[(Math.random() * COLOURS.length) | 0]
      rider.width = 1.2 + Math.random() * 1.4
      return rider
    }
    const riders = Array.from({ length: count }, () => {
      const r = spawn()
      r.t = Math.random() // already on their way when the still appears
      return r
    })

    let raf = 0
    let last = 0
    let clock = 0
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      const dt = last ? (now - last) / 1000 : 0
      if (last && dt < 1 / FPS - 0.002) return
      last = now
      clock += Math.min(dt, 0.1)
      ctx.clearRect(0, 0, w, h)

      // Waves: a band of the still itself, sliding from the tangle into the mouth and speeding up as it goes.
      if (still?.complete && still.naturalWidth) {
        const from = Math.max(left, 0)
        const half = w * WAVE_HALF
        for (let i = 0; i < WAVES; i++) {
          const u = (clock / WAVE_SECONDS + i / WAVES) % 1
          const x = from + (m.x - from) * u * u
          const x0 = Math.max(0, x - half)
          const x1 = Math.min(w, x + half)
          if (x1 <= x0) continue
          // Fades in out of the tangle and out into the mouth's glow.
          const a = WAVE_PEAK * Math.sin(Math.PI * u)
          ctx.save()
          ctx.beginPath()
          ctx.rect(x0, 0, x1 - x0, h)
          ctx.clip()
          ctx.drawImage(still, left, top, dw, dh)
          ctx.globalCompositeOperation = 'destination-in'
          const g = ctx.createLinearGradient(x - half, 0, x + half, 0)
          g.addColorStop(0, 'rgba(0,0,0,0)')
          g.addColorStop(0.5, `rgba(0,0,0,${a.toFixed(3)})`)
          g.addColorStop(1, 'rgba(0,0,0,0)')
          ctx.fillStyle = g
          ctx.fillRect(x0, 0, x1 - x0, h)
          ctx.restore()
        }
      }

      ctx.globalCompositeOperation = 'lighter'
      ctx.lineCap = 'round'
      for (const r of riders) {
        r.t += Math.min(dt, 0.1) * r.speed
        if (r.t >= 1) spawn(r)
        const head = flowPoint(r.start, m, r.t)
        const tail = flowPoint(r.start, m, Math.max(0, r.t - 0.12))
        // Fade in out of the tangle, brightest as it reaches the mouth.
        const a = Math.min(1, r.t * 4) * (0.45 + 0.55 * r.t)
        ctx.beginPath()
        ctx.moveTo(tail.x, tail.y)
        ctx.lineTo(head.x, head.y)
        // A soft halo under a bright core.
        ctx.strokeStyle = `rgba(${r.colour},${(a * 0.22).toFixed(3)})`
        ctx.lineWidth = r.width * 4
        ctx.stroke()
        ctx.strokeStyle = `rgba(${r.colour},${(a * 0.95).toFixed(3)})`
        ctx.lineWidth = r.width
        ctx.stroke()
        ctx.fillStyle = `rgba(${r.colour},${a.toFixed(3)})`
        ctx.beginPath()
        ctx.arc(head.x, head.y, r.width * 0.9, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalCompositeOperation = 'source-over'
    }
    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      ctx.clearRect(0, 0, el.width, el.height)
    }
  }, [active, mouth, image])

  return <canvas ref={canvas} className="thread-flow" aria-hidden="true" />
}
