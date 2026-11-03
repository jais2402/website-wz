import { useEffect, useRef } from 'react'
import { loom } from '@/content/site'
import { drawsInSoftware } from '@/gfx/gfxMode'
import {
  cardPose,
  chaosGate,
  type Gate,
  hash,
  nearestThread,
  nodeY,
  pickSpawn,
  type Pt,
  type Rect,
  strandPoint,
} from '@/lib/chaos'

type Problem = (typeof loom.chaos.problems)[number]
type Sprite = { img: HTMLCanvasElement; w: number; h: number }
type Card = { sprite: Sprite; from: Pt; start: number; dur: number; rot: number; seed: number } | { retry: number }
type Pulse = { line: number; start: number; strong: boolean }

const SEGMENTS = 56
const PULSE_S = 2.4
const RIPPLE_S = 1.1
// The Before/After tangle's tones, a little quieter; the threads turn to the accent blue as they reach the gate.
const TANGLE = ['236,120,150', '160,130,255', '110,190,210', '200,140,230']

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

/** One problem card (the Before/After notes and sticky notes), drawn once with its shadow, then only copied. */
function drawSprite(p: Problem, dpr: number, small: boolean): Sprite {
  const mono = cssVar('--f-mono', 'monospace')
  const body = cssVar('--f-body', 'sans-serif')
  const m = document.createElement('canvas').getContext('2d')!
  const pad = 22 // room for the shadow
  const fs = small ? 10.5 : 12.5
  const sticky = p.kind === 'sticky'
  let w: number
  let h: number
  let lines: string[] = [p.text]
  if (sticky) {
    m.font = `500 ${fs + 1.5}px ${body}`
    const max = small ? 108 : 136
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
    h = lines.length * (fs + 8) + 26
  } else {
    m.font = `500 ${fs}px ${mono}`
    const badge = p.badge ? Math.max(19, m.measureText(p.badge).width + 11) + 9 : 0
    w = Math.ceil(m.measureText(p.text).width) + badge + 30
    h = fs + 26
  }
  const c = document.createElement('canvas')
  c.width = Math.ceil((w + pad * 2) * dpr)
  c.height = Math.ceil((h + pad * 2) * dpr)
  const ctx = c.getContext('2d')!
  ctx.scale(dpr, dpr)
  ctx.translate(pad, pad)
  ctx.shadowColor = 'rgba(0,0,0,0.6)'
  ctx.shadowBlur = 22
  ctx.shadowOffsetY = 10
  roundRect(ctx, 0, 0, w, h, sticky ? 5 : 12)
  const fill = ctx.createLinearGradient(0, 0, 0, h)
  if (sticky) {
    fill.addColorStop(0, '#f7da78')
    fill.addColorStop(1, '#ecc95a')
  } else {
    fill.addColorStop(0, 'rgba(44,38,54,0.96)')
    fill.addColorStop(1, 'rgba(24,21,31,0.96)')
  }
  ctx.fillStyle = fill
  ctx.fill()
  ctx.shadowColor = 'transparent'
  if (!sticky) {
    // Hairline edge, and a faint highlight along the top like light catching glass.
    ctx.strokeStyle = 'rgba(255,255,255,0.11)'
    ctx.lineWidth = 1
    roundRect(ctx, 0.5, 0.5, w - 1, h - 1, 11.5)
    ctx.stroke()
    const hi = ctx.createLinearGradient(0, 0, w, 0)
    hi.addColorStop(0, 'rgba(255,255,255,0)')
    hi.addColorStop(0.5, 'rgba(255,255,255,0.16)')
    hi.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.strokeStyle = hi
    ctx.beginPath()
    ctx.moveTo(12, 0.75)
    ctx.lineTo(w - 12, 0.75)
    ctx.stroke()
  }
  ctx.textBaseline = 'middle'
  if (sticky) {
    ctx.font = `500 ${fs + 1.5}px ${body}`
    ctx.fillStyle = '#3b2f0c'
    lines.forEach((l, i) => ctx.fillText(l, 14, 13 + (fs + 8) * (i + 0.5)))
  } else {
    let x = 15
    if (p.badge) {
      ctx.font = `700 ${fs - 2}px ${mono}`
      const bw = Math.max(19, ctx.measureText(p.badge).width + 11)
      roundRect(ctx, x, h / 2 - 9.5, bw, 19, 9.5)
      ctx.fillStyle = '#ff4763'
      ctx.fill()
      ctx.fillStyle = '#fff'
      ctx.textAlign = 'center'
      ctx.fillText(p.badge, x + bw / 2, h / 2 + 0.5)
      ctx.textAlign = 'left'
      x += bw + 9
    }
    ctx.font = `500 ${fs}px ${mono}`
    ctx.fillStyle = '#dcd5e2'
    ctx.fillText(p.text, x, h / 2 + 0.5)
  }
  return { img: c, w: w + pad * 2, h: h + pad * 2 }
}

/** A soft white-blue glow, drawn once and stamped round the circles and the running lights. */
function glowSprite(): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
  g.addColorStop(0, 'rgba(255,255,255,0.9)')
  g.addColorStop(0.15, 'rgba(190,220,255,0.55)')
  g.addColorStop(0.45, 'rgba(77,159,255,0.14)')
  g.addColorStop(1, 'rgba(77,159,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 128, 128)
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
 * The hero for machines that can't run the live loom, in the style of the Before/After section. On the left, slow
 * tangled threads and everyday problems (site.ts, `loom.chaos`); each thread runs into its own small glowing circle
 * and comes out straight and evenly spaced. Cards drift into the circles: the circle ripples and a light runs along
 * its line. Scrolling through the hero calms the tangle. One 2D canvas, cards pre-drawn, paused off screen; 30 fps
 * on machines drawing without a graphics chip.
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
    const software = drawsInSoftware()
    const frameMs = software ? 1000 / 30 : 1000 / 60
    let alive = true
    let raf = 0
    let w = 0
    let h = 0
    let dpr = 1
    let gate: Gate = chaosGate(1, 1)
    let small = false
    let n = 16
    let sprites: Sprite[] = []
    let cards: Card[] = []
    let pulses: Pulse[] = []
    let ripples: { line: number; start: number }[] = []
    let next = 0
    let last = 0
    let ambient = 0
    let drawn = false
    const glow = glowSprite()
    const problems = loom.chaos.problems
    const t0 = performance.now()
    let seed = 7
    const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646

    // A card where there is clear space; when there is none (the copy panel fills the screen), a retry a little later.
    const spawn = (now: number, life = 0): Card => {
      const sprite = sprites[next % sprites.length]
      const box = canvas.getBoundingClientRect()
      const others = cards.flatMap((c) => ('retry' in c ? [] : [c])).map((c) => ({
        x: c.from.x - c.sprite.w / 2,
        y: c.from.y - c.sprite.h / 2,
        w: c.sprite.w,
        h: c.sprite.h,
      }))
      const from = pickSpawn(rand, w, h, { w: sprite.w - 30, h: sprite.h - 30 }, gate, blockers(box), others)
      if (!from) return { retry: now + 900 }
      next++
      const dur = (8 + rand() * 3) * 1000
      return { sprite, from, start: now - life * dur, dur, rot: (rand() - 0.5) * 0.2, seed: rand() }
    }

    const layout = () => {
      const r = canvas.getBoundingClientRect()
      if (!r.width || !r.height) return false
      w = r.width
      h = r.height
      // Sharp on every screen (2x on Retina); 1x where the processor draws everything.
      dpr = software ? 1 : Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      gate = chaosGate(w, h)
      small = w < 700
      n = small ? 11 : 14
      sprites = problems.map((p) => drawSprite(p, dpr, small))
      const now = performance.now()
      const count = small ? 3 : 5
      cards = []
      pulses = []
      ripples = []
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
      ctx.imageSmoothingQuality = 'high'

      // A faint seam where chaos turns into order, like the Before/After divider.
      const seam = ctx.createLinearGradient(0, gate.top - h * 0.2, 0, gate.bottom + h * 0.2)
      seam.addColorStop(0, 'rgba(140,196,255,0)')
      seam.addColorStop(0.5, 'rgba(140,196,255,0.14)')
      seam.addColorStop(1, 'rgba(140,196,255,0)')
      ctx.fillStyle = seam
      ctx.fillRect(gate.x - 0.5, gate.top - h * 0.2, 1, gate.bottom - gate.top + h * 0.4)

      // The tangle: fades in from the left edge and cools to blue as it reaches the gate.
      ctx.lineWidth = small ? 0.9 : 1.1
      for (let i = 0; i < n; i++) {
        const tone = TANGLE[i % TANGLE.length]
        const a = 0.42 + hash(i + 7) * 0.25
        const g = ctx.createLinearGradient(0, 0, gate.x, 0)
        g.addColorStop(0, `rgba(${tone},0)`)
        g.addColorStop(0.22, `rgba(${tone},${a})`)
        g.addColorStop(0.8, `rgba(${tone},${a})`)
        g.addColorStop(1, `rgba(170,210,255,${a + 0.15})`)
        ctx.strokeStyle = g
        ctx.beginPath()
        for (let s = 0; s <= SEGMENTS; s++) {
          const p = strandPoint(i, n, s / SEGMENTS, time, chaos, w, h, gate)
          if (s) ctx.lineTo(p.x, p.y)
          else ctx.moveTo(p.x, p.y)
        }
        ctx.stroke()
      }

      // The system: straight, evenly spaced, fading towards the edge.
      const order = ctx.createLinearGradient(gate.x, 0, w, 0)
      order.addColorStop(0, 'rgba(170,210,255,0.75)')
      order.addColorStop(1, 'rgba(120,180,255,0.12)')
      ctx.strokeStyle = order
      ctx.lineWidth = small ? 0.9 : 1
      ctx.beginPath()
      for (let i = 0; i < n; i++) {
        const y = nodeY(i, n, gate)
        ctx.moveTo(gate.x, y)
        ctx.lineTo(w, y)
      }
      ctx.stroke()

      // Cards: floating, then pulled into the circle nearest their height.
      for (let k = 0; k < cards.length; k++) {
        const c = cards[k]
        if ('retry' in c) {
          if (now >= c.retry && !reducedMotion) cards[k] = spawn(now)
          continue
        }
        const life = (now - c.start) / c.dur
        const line = nearestThread(c.from.y, n, gate)
        if (life >= 1 && !reducedMotion) {
          ripples.push({ line, start: now })
          pulses.push({ line, start: now, strong: true })
          cards[k] = spawn(now)
          continue
        }
        const pose = cardPose(Math.min(life, 0.999), c.from, { x: gate.x, y: nodeY(line, n, gate) }, c.rot, c.seed)
        if (pose.alpha <= 0.01) continue
        const cos = Math.cos(pose.rot) * pose.scale * dpr
        const sin = Math.sin(pose.rot) * pose.scale * dpr
        ctx.globalAlpha = pose.alpha
        ctx.setTransform(cos, sin, -sin, cos, dpr * pose.x, dpr * pose.y)
        ctx.drawImage(c.sprite.img, -c.sprite.w / 2, -c.sprite.h / 2, c.sprite.w, c.sprite.h)
      }
      ctx.globalAlpha = 1
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      ctx.globalCompositeOperation = 'lighter'
      // Lights running along the system lines: a faint one now and then, a bright one per problem taken in.
      if (!reducedMotion && time - ambient > 0.9) {
        ambient = time
        pulses.push({ line: Math.floor(rand() * n), start: now, strong: false })
      }
      pulses = pulses.filter((p) => (now - p.start) / 1000 < PULSE_S)
      const len = Math.max(60, (w - gate.x) * 0.22)
      for (const p of pulses) {
        const u = (now - p.start) / 1000 / PULSE_S
        const head = gate.x + (w - gate.x + len) * (1 - Math.pow(1 - u, 1.6))
        const tail = Math.max(gate.x, head - len)
        const x1 = Math.min(w, head)
        if (x1 <= tail) continue
        const y = nodeY(p.line, n, gate)
        const peak = p.strong ? 0.95 : 0.4
        const lg = ctx.createLinearGradient(tail, 0, x1, 0)
        lg.addColorStop(0, 'rgba(255,255,255,0)')
        lg.addColorStop(1, `rgba(255,255,255,${peak})`)
        ctx.strokeStyle = lg
        ctx.lineWidth = p.strong ? 1.8 : 1.2
        ctx.beginPath()
        ctx.moveTo(tail, y)
        ctx.lineTo(x1, y)
        ctx.stroke()
        if (head <= w) {
          const s = p.strong ? 26 : 14
          ctx.globalAlpha = peak
          ctx.drawImage(glow, head - s / 2, y - s / 2, s, s)
          ctx.globalAlpha = 1
        }
      }

      // The circles: a soft halo, a hairline ring and a bright core, each breathing slowly; brighter as it takes a
      // card in.
      ripples = ripples.filter((r) => (now - r.start) / 1000 < RIPPLE_S)
      for (let i = 0; i < n; i++) {
        const y = nodeY(i, n, gate)
        const hit = ripples.find((r) => r.line === i)
        const boost = hit ? 1 - (now - hit.start) / 1000 / RIPPLE_S : 0
        const breathe = 0.5 + 0.5 * Math.sin(time * 1.4 + i * 0.9)
        const halo = gate.r * (7 + breathe * 2 + boost * 6)
        ctx.globalAlpha = 0.45 + breathe * 0.15 + boost * 0.5
        ctx.drawImage(glow, gate.x - halo / 2, y - halo / 2, halo, halo)
        ctx.globalAlpha = 1
      }
      ctx.globalCompositeOperation = 'source-over'
      ctx.lineWidth = 1
      for (let i = 0; i < n; i++) {
        const y = nodeY(i, n, gate)
        ctx.strokeStyle = 'rgba(200,225,255,0.55)'
        ctx.beginPath()
        ctx.arc(gate.x, y, gate.r * 1.7, 0, Math.PI * 2)
        ctx.stroke()
        ctx.fillStyle = '#fff'
        ctx.beginPath()
        ctx.arc(gate.x, y, gate.r * 0.55, 0, Math.PI * 2)
        ctx.fill()
      }
      // A fine ring spreading out from a circle that has just taken a problem in.
      for (const r of ripples) {
        const u = (now - r.start) / 1000 / RIPPLE_S
        ctx.strokeStyle = `rgba(200,225,255,${0.6 * (1 - u)})`
        ctx.beginPath()
        ctx.arc(gate.x, nodeY(r.line, n, gate), gate.r * (1.7 + u * 7), 0, Math.PI * 2)
        ctx.stroke()
      }

      if (!drawn) {
        drawn = true
        ready.current?.()
      }
    }

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      if (now - last < frameMs - 2) return
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
      if (!w) return
      const r = canvas.getBoundingClientRect()
      if (Math.abs(r.width - w) < 1 && Math.abs(r.height - h) < 1) return
      start()
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
