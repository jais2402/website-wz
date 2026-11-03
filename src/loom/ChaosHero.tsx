import { useEffect, useRef } from 'react'
import { loom } from '@/content/site'
import { drawsInSoftware } from '@/gfx/gfxMode'
import {
  cardPose,
  chaosScene,
  type Gate,
  hash,
  knotGate,
  pickSpawn,
  type Pt,
  type Rect,
  type Scene,
  strandPoint,
} from '@/lib/chaos'
import { SystemApp } from './SystemApp'

type Problem = (typeof loom.chaos.problems)[number]
type Sprite = { img: HTMLCanvasElement; w: number; h: number }
type Card = { sprite: Sprite; from: Pt; start: number; dur: number; rot: number; seed: number } | { retry: number }
type Pulse = { start: number; strong: boolean }

const SEGMENTS = 56
const PULSE_S = 1.6
const LOOPS = 16
// The Before/After tangle's colours (loom.css, .ba-tangle).
const TANGLE = ['255,120,150', '139,123,255', '47,208,255']
const TANGLE_ALPHA = [0.38, 0.44, 0.34]

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

/** One problem card, drawn like the Before/After notes (.ba-note, .ba-sticky) once, then only copied. */
function drawSprite(p: Problem, dpr: number, small: boolean): Sprite {
  const mono = cssVar('--f-mono', 'monospace')
  const body = cssVar('--f-body', 'sans-serif')
  const m = document.createElement('canvas').getContext('2d')!
  const pad = 24 // room for the shadow
  const fs = small ? 10.5 : 12.5
  const sticky = p.kind === 'sticky'
  let w: number
  let h: number
  let lines: string[] = [p.text]
  if (sticky) {
    m.font = `500 ${fs + 1.5}px ${body}`
    const max = small ? 106 : 132
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
    const badge = p.badge ? Math.max(20, m.measureText(p.badge).width + 10) + 8 : 0
    w = Math.ceil(m.measureText(p.text).width) + badge + 28
    h = fs + 24
  }
  const c = document.createElement('canvas')
  c.width = Math.ceil((w + pad * 2) * dpr)
  c.height = Math.ceil((h + pad * 2) * dpr)
  const ctx = c.getContext('2d')!
  ctx.scale(dpr, dpr)
  ctx.translate(pad, pad)
  // 0 16px 30px -12px rgba(0,0,0,.7), as on the notes.
  ctx.shadowColor = 'rgba(0,0,0,0.7)'
  ctx.shadowBlur = 24
  ctx.shadowOffsetY = 14
  roundRect(ctx, 0, 0, w, h, sticky ? 4 : 12)
  ctx.fillStyle = sticky ? '#f6d365' : 'rgba(30,24,34,0.92)'
  ctx.fill()
  ctx.shadowColor = 'transparent'
  if (!sticky) {
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'
    ctx.lineWidth = 1
    roundRect(ctx, 0.5, 0.5, w - 1, h - 1, 11.5)
    ctx.stroke()
  }
  ctx.textBaseline = 'middle'
  if (sticky) {
    ctx.font = `500 ${fs + 1.5}px ${body}`
    ctx.fillStyle = '#3b2f0c'
    lines.forEach((l, i) => ctx.fillText(l, 14, 13 + (fs + 8) * (i + 0.5)))
  } else {
    let x = 14
    if (p.badge) {
      ctx.font = `600 ${fs - 2.5}px ${body}`
      const bw = Math.max(20, ctx.measureText(p.badge).width + 10)
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

/** A soft white-blue glow, drawn once and stamped round the knot and the running lights. */
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
  const sel = '.loom-intro:not(.is-gone), .loom-phase.is-active, .nav, .test-badge, .chaos-app'
  return Array.from(document.querySelectorAll(sel)).map((el) => {
    const r = el.getBoundingClientRect()
    return { x: r.left - box.left, y: r.top - box.top, w: r.width, h: r.height }
  })
}

/**
 * The hero for machines that can't run the live loom, in the style of the Before/After section. Everyday problems
 * (site.ts, `loom.chaos`) float in a tangle of threads; the threads all run into one glowing knot, and the cards
 * drift into it too. Out of the knot comes a single line into the "after" dashboard (SystemApp); a light runs along
 * it for each problem taken in, and a row of the dashboard lights up as it arrives. Scrolling through the hero calms
 * the tangle. One 2D canvas, cards pre-drawn, paused off screen; 30 fps on machines drawing without a graphics chip.
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
  const appRef = useRef<HTMLDivElement>(null)
  const ready = useRef(onReady)
  useEffect(() => {
    ready.current = onReady
  }, [onReady])

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    const app = appRef.current
    if (!canvas || !ctx || !app) {
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
    let scene: Scene = chaosScene(1, 1)
    let gate: Gate = knotGate(scene)
    let to: Pt = scene.link.to
    let small = false
    let n = 16
    let sprites: Sprite[] = []
    let cards: Card[] = []
    let pulses: Pulse[] = []
    let next = 0
    let row = 0
    let flash = 0
    let port = 0
    let last = 0
    let ambient = 0
    let drawn = false
    const timers = new Set<number>()
    const glow = glowSprite()
    const problems = loom.chaos.problems
    const t0 = performance.now()
    let seed = 7
    const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646

    // A card where there is clear space; when there is none (the copy panel fills the screen), a retry a little later.
    const spawn = (now: number, life = 0): Card => {
      const sprite = sprites[next % sprites.length]
      const box = canvas.getBoundingClientRect()
      const others = cards
        .flatMap((c) => ('retry' in c ? [] : [c]))
        .map((c) => ({ x: c.from.x - c.sprite.w / 2, y: c.from.y - c.sprite.h / 2, w: c.sprite.w, h: c.sprite.h }))
      const from = pickSpawn(rand, w, h, { w: sprite.w - 34, h: sprite.h - 34 }, gate, blockers(box), others)
      if (!from) return { retry: now + 900 }
      next++
      const dur = (8 + rand() * 3) * 1000
      return { sprite, from, start: now - life * dur, dur, rot: (rand() - 0.5) * 0.2, seed: rand() }
    }

    // A problem reached the dashboard: light up its next row for a moment.
    const arrive = () => {
      port = 1
      const rows = app.querySelectorAll('.ba-rows li')
      const li = rows[row++ % rows.length]
      if (!li) return
      li.classList.add('is-live')
      const t = window.setTimeout(() => {
        li.classList.remove('is-live')
        timers.delete(t)
      }, 1600)
      timers.add(t)
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
      scene = chaosScene(w, h)
      gate = knotGate(scene)
      small = w < 700
      n = small ? 11 : 16
      // The dashboard: level with the knot (landscape) or under it (phones). The line ends at its edge.
      app.style.left = `${scene.app.x}px`
      app.style.width = `${scene.app.w}px`
      app.style.top = `${scene.app.y}px`
      app.classList.toggle('is-portrait', scene.portrait)
      const box = app.getBoundingClientRect()
      to = scene.portrait ? { x: scene.link.to.x, y: box.top - r.top } : { x: box.left - r.left, y: scene.link.to.y }
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
      const { knot } = scene
      const from = scene.link.from
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      ctx.lineCap = 'round'
      ctx.imageSmoothingQuality = 'high'

      // The tangle: fades in from the left edge, brightens as it gathers into the knot.
      ctx.lineWidth = small ? 1.1 : 1.4
      for (let i = 0; i < n; i++) {
        const k = i % TANGLE.length
        const a = TANGLE_ALPHA[k] + hash(i + 7) * 0.12
        const g = ctx.createLinearGradient(0, 0, knot.x, 0)
        g.addColorStop(0, `rgba(${TANGLE[k]},0)`)
        g.addColorStop(0.2, `rgba(${TANGLE[k]},${a})`)
        g.addColorStop(0.85, `rgba(${TANGLE[k]},${a})`)
        g.addColorStop(1, `rgba(210,230,255,${a + 0.25})`)
        ctx.strokeStyle = g
        ctx.beginPath()
        for (let s = 0; s <= SEGMENTS; s++) {
          const p = strandPoint(i, n, s / SEGMENTS, time, chaos, w, h, gate)
          if (s) ctx.lineTo(p.x, p.y)
          else ctx.moveTo(p.x, p.y)
        }
        ctx.stroke()
      }

      // Cards: floating, then pulled into the knot.
      for (let k = 0; k < cards.length; k++) {
        const c = cards[k]
        if ('retry' in c) {
          if (now >= c.retry && !reducedMotion) cards[k] = spawn(now)
          continue
        }
        const life = (now - c.start) / c.dur
        if (life >= 1 && !reducedMotion) {
          flash = 1
          pulses.push({ start: now, strong: true })
          cards[k] = spawn(now)
          continue
        }
        const pose = cardPose(Math.min(life, 0.999), c.from, knot, c.rot, c.seed)
        if (pose.alpha <= 0.01) continue
        const cos = Math.cos(pose.rot) * pose.scale * dpr
        const sin = Math.sin(pose.rot) * pose.scale * dpr
        ctx.globalAlpha = pose.alpha
        ctx.setTransform(cos, sin, -sin, cos, dpr * pose.x, dpr * pose.y)
        ctx.drawImage(c.sprite.img, -c.sprite.w / 2, -c.sprite.h / 2, c.sprite.w, c.sprite.h)
      }
      ctx.globalAlpha = 1
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      // The single line out of the knot into the dashboard: a fine core over a soft glow.
      ctx.globalCompositeOperation = 'lighter'
      ctx.strokeStyle = 'rgba(140,196,255,0.16)'
      ctx.lineWidth = 6
      ctx.beginPath()
      ctx.moveTo(from.x, from.y)
      ctx.lineTo(to.x, to.y)
      ctx.stroke()
      ctx.strokeStyle = 'rgba(200,225,255,0.85)'
      ctx.lineWidth = 1.4
      ctx.stroke()

      // Lights along it: a faint one now and then, a bright one per problem taken in.
      if (!reducedMotion && time - ambient > 1.1) {
        ambient = time
        pulses.push({ start: now, strong: false })
      }
      const dx = to.x - from.x
      const dy = to.y - from.y
      pulses = pulses.filter((p) => {
        const u = (now - p.start) / 1000 / PULSE_S
        if (u >= 1) {
          if (p.strong) arrive()
          return false
        }
        const e = u * u * (3 - 2 * u)
        const s = p.strong ? 30 : 14
        ctx.globalAlpha = p.strong ? 1 : 0.55
        ctx.drawImage(glow, from.x + dx * e - s / 2, from.y + dy * e - s / 2, s, s)
        return true
      })
      // The port where the line enters the dashboard, brighter as a problem arrives.
      port = Math.max(0, port - 0.03)
      const ps = 18 + port * 26
      ctx.globalAlpha = 0.6 + port * 0.4
      ctx.drawImage(glow, to.x - ps / 2, to.y - ps / 2, ps, ps)

      // The knot: a glowing ball of thread, its loops turning slowly; it flares as it takes a card in.
      flash = Math.max(0, flash - 0.035)
      const halo = knot.r * (6 + flash * 2.5)
      ctx.globalAlpha = 0.55 + flash * 0.4 + 0.06 * Math.sin(time * 1.6)
      ctx.drawImage(glow, knot.x - halo / 2, knot.y - halo / 2, halo, halo)
      const core = knot.r * (1.8 + flash * 0.6)
      ctx.globalAlpha = 0.9
      ctx.drawImage(glow, knot.x - core / 2, knot.y - core / 2, core, core)
      ctx.globalAlpha = 1
      ctx.lineWidth = 1
      for (let j = 0; j < LOOPS; j++) {
        const dir = j % 2 ? 1 : -1
        const rot = hash(j) * Math.PI + time * (0.2 + hash(j + 9) * 0.35) * dir
        const rx = knot.r * (0.7 + 0.3 * hash(j + 3))
        const ry = knot.r * (0.25 + 0.7 * hash(j + 5))
        ctx.strokeStyle = `rgba(${j % 3 ? '200,225,255' : '255,190,210'},${0.32 + hash(j + 11) * 0.3})`
        ctx.beginPath()
        ctx.ellipse(knot.x, knot.y, rx, ry, rot, 0, Math.PI * 2)
        ctx.stroke()
      }
      ctx.globalCompositeOperation = 'source-over'

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
      timers.forEach((t) => window.clearTimeout(t))
    }
  }, [active, reducedMotion, progress])

  return (
    <div className="chaos-hero" aria-hidden="true">
      <canvas ref={ref} />
      <SystemApp ref={appRef} className="chaos-app" />
    </div>
  )
}
