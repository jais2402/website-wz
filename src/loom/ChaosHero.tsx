import { useEffect, useRef } from 'react'
import { loom } from '@/content/site'
import {
  bandY,
  cardPose,
  chaosRing,
  hash,
  pickSpawn,
  type Pt,
  type Rect,
  type Ring,
  strandPoint,
} from '@/lib/chaos'

type Problem = (typeof loom.chaos.problems)[number]
type Sprite = { img: HTMLCanvasElement; w: number; h: number }
type Card = { sprite: Sprite; from: Pt; start: number; dur: number; rot: number; seed: number }
type Pulse = { line: number; start: number }

// Drawn at most this many pixels (the browser scales it up), at most 30 fps: these machines draw without a GPU.
const PIXEL_BUDGET = 1.6e6
const FRAME_MS = 1000 / 30
const SEGMENTS = 40
const PULSE_S = 1.8
// Tangled threads in muted warm/cool tones (the Before/After "before" palette); the ordered band in the accent blue.
const TANGLE = ['255,110,140', '170,120,255', '90,175,205', '255,150,110', '210,140,255']

const cssVar = (name: string, fallback: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

/** One problem card, drawn once to its own canvas (with its shadow), then only copied each frame. */
function drawSprite(p: Problem, dpr: number, small: boolean): Sprite {
  const mono = cssVar('--f-mono', 'monospace')
  const body = cssVar('--f-body', 'sans-serif')
  const m = document.createElement('canvas').getContext('2d')!
  const pad = 18 // room for the shadow
  let w: number
  let h: number
  let lines: string[] = [p.text]
  const fs = small ? 11 : 13
  const sticky = p.kind === 'sticky'
  if (sticky) {
    m.font = `500 ${fs + 1}px ${body}`
    const max = small ? 112 : 140
    lines = []
    let line = ''
    for (const word of p.text.split(' ')) {
      const next = line ? `${line} ${word}` : word
      if (line && m.measureText(next).width > max) {
        lines.push(line)
        line = word
      } else line = next
    }
    lines.push(line)
    w = max + 28
    h = lines.length * (fs + 7) + 26
  } else {
    m.font = `500 ${fs}px ${mono}`
    const badge = p.badge ? Math.max(20, m.measureText(p.badge).width + 12) + 8 : 0
    w = Math.ceil(m.measureText(p.text).width) + badge + 28
    h = fs + 24
  }
  const c = document.createElement('canvas')
  c.width = Math.ceil((w + pad * 2) * dpr)
  c.height = Math.ceil((h + pad * 2) * dpr)
  const ctx = c.getContext('2d')!
  ctx.scale(dpr, dpr)
  ctx.translate(pad, pad)
  ctx.shadowColor = 'rgba(0,0,0,0.55)'
  ctx.shadowBlur = 16
  ctx.shadowOffsetY = 8
  roundRect(ctx, 0, 0, w, h, sticky ? 4 : 12)
  ctx.fillStyle = sticky ? '#f6d365' : 'rgba(30,24,34,0.94)'
  ctx.fill()
  ctx.shadowColor = 'transparent'
  if (!sticky) {
    ctx.strokeStyle = 'rgba(255,255,255,0.13)'
    ctx.lineWidth = 1
    ctx.stroke()
  }
  ctx.textBaseline = 'middle'
  if (sticky) {
    ctx.font = `500 ${fs + 1}px ${body}`
    ctx.fillStyle = '#3b2f0c'
    lines.forEach((l, i) => ctx.fillText(l, 14, 13 + (fs + 7) * (i + 0.5)))
  } else {
    let x = 14
    if (p.badge) {
      ctx.font = `700 ${fs - 2}px ${mono}`
      const bw = Math.max(20, ctx.measureText(p.badge).width + 12)
      roundRect(ctx, x, h / 2 - 10, bw, 20, 10)
      ctx.fillStyle = '#ff4763'
      ctx.fill()
      ctx.fillStyle = '#fff'
      ctx.textAlign = 'center'
      ctx.fillText(p.badge, x + bw / 2, h / 2 + 0.5)
      ctx.textAlign = 'left'
      x += bw + 8
    }
    ctx.font = `500 ${fs}px ${mono}`
    ctx.fillStyle = '#d7d0dc'
    ctx.fillText(p.text, x, h / 2 + 0.5)
  }
  return { img: c, w: w + pad * 2, h: h + pad * 2 }
}

/** A soft white-blue glow, drawn once and stamped behind the ring. */
function glowSprite(): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128)
  g.addColorStop(0, 'rgba(255,255,255,0.95)')
  g.addColorStop(0.18, 'rgba(200,225,255,0.6)')
  g.addColorStop(0.45, 'rgba(77,159,255,0.18)')
  g.addColorStop(1, 'rgba(77,159,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 256, 256)
  return c
}

/** Elements the cards keep clear of, in the canvas's coordinates. */
function blockers(box: DOMRect): Rect[] {
  const sel = '.loom-intro:not(.is-gone), .loom-phase.is-active, .nav, .test-badge'
  return Array.from(document.querySelectorAll(sel)).map((el) => {
    const r = el.getBoundingClientRect()
    return { x: r.left - box.left, y: r.top - box.top, w: r.width, h: r.height }
  })
}

/**
 * The hero for machines that can't run the live loom: a 2D take on the same story. Everyday problems (site.ts,
 * `loom.chaos`) appear in a tangle of threads and are pulled into a glowing ring; out of it comes one ordered band,
 * a light running along it for each problem it takes in. Scrolling through the hero calms the tangle.
 * Cheap on purpose: one 2D canvas, under 1.6M pixels, 30 fps, cards pre-drawn, paused off screen.
 */
export function ChaosHero({
  active,
  reducedMotion,
  progress,
  onReady,
}: {
  active: boolean
  reducedMotion: boolean
  progress: () => number
  onReady?: () => void
}) {
  const ref = useRef<HTMLCanvasElement>(null)
  const ready = useRef(onReady)
  useEffect(() => {
    ready.current = onReady
  }, [onReady])

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) {
      ready.current?.()
      return
    }
    let alive = true
    let raf = 0
    let w = 0
    let h = 0
    let dpr = 1
    let ring: Ring = chaosRing(1, 1)
    let small = false
    let n = 34
    let sprites: Sprite[] = []
    let cards: Card[] = []
    let pulses: Pulse[] = []
    let next = 0
    let flash = 0
    let last = 0
    let drawn = false
    const glow = glowSprite()
    const problems = loom.chaos.problems
    const t0 = performance.now()
    let seed = 7
    const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646

    const spawn = (now: number, life = 0): Card => {
      const sprite = sprites[next++ % sprites.length]
      const box = canvas.getBoundingClientRect()
      const others = cards.map((c) => ({ x: c.from.x - c.sprite.w / 2, y: c.from.y - c.sprite.h / 2, w: c.sprite.w, h: c.sprite.h }))
      const from = pickSpawn(rand, w, h, { w: sprite.w - 20, h: sprite.h - 20 }, ring, blockers(box), others)
      const dur = (7 + rand() * 2.5) * 1000
      return { sprite, from, start: now - life * dur, dur, rot: (rand() - 0.5) * 0.22, seed: rand() }
    }

    const layout = () => {
      const r = canvas.getBoundingClientRect()
      if (!r.width || !r.height) return false
      w = r.width
      h = r.height
      dpr = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(PIXEL_BUDGET / (w * h)))
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ring = chaosRing(w, h)
      small = w < 700
      n = small ? 22 : 34
      sprites = problems.map((p) => drawSprite(p, dpr, small))
      const now = performance.now()
      const count = small ? 3 : 5
      cards = []
      pulses = []
      // Staggered through their lives, so the first frame already shows cards floating and one being pulled in.
      for (let k = 0; k < count; k++) cards.push(spawn(now, 0.12 + (k / count) * 0.8))
      return true
    }

    const draw = (now: number) => {
      const time = (now - t0) / 1000
      const chaos = 1 - 0.6 * Math.min(1, progress())
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      ctx.lineCap = 'round'

      // The tangle.
      ctx.lineWidth = small ? 0.9 : 1.1
      for (let i = 0; i < n; i++) {
        ctx.strokeStyle = `rgba(${TANGLE[i % TANGLE.length]},${0.28 + hash(i + 7) * 0.22})`
        ctx.beginPath()
        for (let s = 0; s <= SEGMENTS; s++) {
          const p = strandPoint(i, n, s / SEGMENTS, time, chaos, w, h, ring)
          if (s) ctx.lineTo(p.x, p.y)
          else ctx.moveTo(p.x, p.y)
        }
        ctx.stroke()
      }

      // Cards: floating, then pulled into the ring.
      const mouth = { x: ring.x, y: ring.y }
      for (let k = 0; k < cards.length; k++) {
        const c = cards[k]
        const life = (now - c.start) / c.dur
        if (life >= 1 && !reducedMotion) {
          flash = 1
          pulses.push({ line: Math.floor(rand() * n), start: now })
          cards[k] = spawn(now)
          continue
        }
        const pose = cardPose(Math.min(life, 0.999), c.from, mouth, c.rot, c.seed)
        if (pose.alpha <= 0.01) continue
        ctx.globalAlpha = pose.alpha
        ctx.setTransform(dpr * pose.scale * Math.cos(pose.rot), dpr * pose.scale * Math.sin(pose.rot), -dpr * pose.scale * Math.sin(pose.rot), dpr * pose.scale * Math.cos(pose.rot), dpr * pose.x, dpr * pose.y)
        ctx.drawImage(c.sprite.img, -c.sprite.w / 2, -c.sprite.h / 2, c.sprite.w, c.sprite.h)
      }
      ctx.globalAlpha = 1
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      // Glow behind the ring, brighter for a moment as it takes a card in.
      flash = Math.max(0, flash - 0.04)
      ctx.globalCompositeOperation = 'lighter'
      const g = ring.r * (3.6 + flash * 0.9)
      ctx.globalAlpha = 0.7 + flash * 0.3 + 0.08 * Math.sin(time * 2)
      ctx.drawImage(glow, ring.x - g / 2, ring.y - g / 2, g, g)
      // A hot white core in the mouth, like the live loom's.
      const core = ring.r * (1.1 + flash * 0.5)
      ctx.globalAlpha = 0.85
      ctx.drawImage(glow, ring.x - core / 2, ring.y - core / 2, core, core)
      ctx.globalAlpha = 1

      // The ordered band, with a faint light on each line and a bright one per problem taken in.
      ctx.lineWidth = small ? 1 : 1.2
      for (let i = 0; i < n; i++) {
        const mid = Math.abs(i / (n - 1) - 0.5)
        ctx.strokeStyle = `rgba(140,196,255,${0.5 - mid * 0.4})`
        ctx.beginPath()
        ctx.moveTo(ring.x, bandY(i, n, ring.x, w, ring))
        ctx.lineTo(w + 4, bandY(i, n, w + 4, w, ring))
        ctx.stroke()
      }
      const len = Math.max(40, (w - ring.x) * 0.18)
      const rider = (i: number, u: number, alpha: number, width: number) => {
        const x = ring.x + (w - ring.x + len) * u - len
        const x0 = Math.max(ring.x, x)
        const x1 = Math.min(w, x + len)
        if (x1 <= x0) return
        const lg = ctx.createLinearGradient(x0, 0, x1, 0)
        lg.addColorStop(0, 'rgba(255,255,255,0)')
        lg.addColorStop(1, `rgba(255,255,255,${alpha})`)
        ctx.strokeStyle = lg
        ctx.lineWidth = width
        ctx.beginPath()
        ctx.moveTo(x0, bandY(i, n, x0, w, ring))
        ctx.lineTo(x1, bandY(i, n, x1, w, ring))
        ctx.stroke()
      }
      for (let i = 0; i < n; i += 3) rider(i, (time * 0.22 + hash(i + 3)) % 1, 0.35, 1.2)
      pulses = pulses.filter((p) => (now - p.start) / 1000 < PULSE_S)
      for (const p of pulses) rider(p.line, (now - p.start) / 1000 / PULSE_S, 0.95, 2.2)
      ctx.globalCompositeOperation = 'source-over'

      // The ring (seen edge-on like the loom's), with smaller echoes down the band, and lights turning round it.
      for (let e = 3; e >= 0; e--) {
        const x = ring.x + e * ring.r * 0.75
        const ry = ring.r * (1 - e * 0.15)
        const rx = ry * 0.3
        ctx.lineWidth = e ? 3 : 6
        ctx.strokeStyle = e ? `rgba(28,32,48,${0.9 - e * 0.18})` : '#1a1e2c'
        ctx.beginPath()
        ctx.ellipse(x, ring.y, rx, ry, 0, 0, Math.PI * 2)
        ctx.stroke()
        ctx.lineWidth = 1
        ctx.strokeStyle = `rgba(200,220,255,${e ? 0.25 - e * 0.05 : 0.55})`
        ctx.beginPath()
        ctx.ellipse(x - 1, ring.y, rx, ry, 0, Math.PI * 0.55, Math.PI * 1.45)
        ctx.stroke()
      }
      ctx.fillStyle = '#fff'
      for (let d = 0; d < 12; d++) {
        const a = (d / 12) * Math.PI * 2 + time * 0.6
        const front = Math.cos(a) < 0.2
        ctx.globalAlpha = front ? 0.9 : 0.35
        ctx.beginPath()
        ctx.arc(ring.x + Math.cos(a) * ring.r * 0.3, ring.y + Math.sin(a) * ring.r, small ? 1.6 : 2.2, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1

      if (!drawn) {
        drawn = true
        ready.current?.()
      }
    }

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      if (now - last < FRAME_MS - 2) return
      last = now
      draw(now)
    }

    const start = () => {
      cancelAnimationFrame(raf)
      if (!layout()) return
      if (reducedMotion || !active) draw(performance.now())
      else raf = requestAnimationFrame(loop)
    }

    // The cards are drawn with the site's fonts: wait for them (briefly) so they aren't drawn in a fallback face.
    const fonts = document.fonts?.ready ?? Promise.resolve()
    void Promise.race([fonts, new Promise((r) => setTimeout(r, 1500))]).then(() => alive && start())
    const ro = new ResizeObserver(() => {
      if (w && Math.abs(canvas.getBoundingClientRect().width - w) < 1 && Math.abs(canvas.getBoundingClientRect().height - h) < 1) return
      if (w) start()
    })
    ro.observe(canvas)
    return () => {
      alive = false
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [active, reducedMotion, progress])

  return (
    <div className="chaos-hero" aria-hidden="true">
      <canvas ref={ref} />
    </div>
  )
}
