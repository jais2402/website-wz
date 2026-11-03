import { useEffect, useRef } from 'react'
import { loom } from '@/content/site'
import { drawsInSoftware } from '@/gfx/gfxMode'
import {
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
type Card = { el: HTMLElement; box: Rect; start: number; dur: number } | { retry: number }
type Pulse = { start: number; strong: boolean }

// Enough points per thread to draw its loops smoothly.
const SEGMENTS = 110
const PULSE_S = 1.6
const LOOPS = 16
// The Before/After tangle's colours (loom.css, .ba-tangle).
const TANGLE = ['255,120,150', '139,123,255', '47,208,255']
const TANGLE_ALPHA = [0.38, 0.44, 0.34]

/** One problem card as the Before/After notes are written (.ba-note, .ba-sticky): real text, so it stays sharp. */
function cardElement(p: Problem): HTMLElement {
  const el = document.createElement('span')
  el.className = p.kind === 'sticky' ? 'ba-sticky chaos-card' : 'ba-note chaos-card'
  if (p.badge) {
    const badge = document.createElement('i')
    badge.className = 'badge'
    badge.textContent = p.badge
    el.append(badge, ' ')
  }
  el.append(p.text)
  return el
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
 * (site.ts, `loom.chaos`) sit in a tangle of threads, appearing and fading out in turn; the threads all run into one
 * white knot. Out of the knot comes a single line into the "after" dashboard (SystemApp); a light runs along it for
 * each problem that fades out, and a row of the dashboard lights up as it arrives. Scrolling through the hero calms
 * the tangle. One 2D canvas (the cards are a few DOM notes), paused off screen; 30 fps on machines drawing without a graphics chip.
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
  const cardsRef = useRef<HTMLDivElement>(null)
  const ready = useRef(onReady)
  useEffect(() => {
    ready.current = onReady
  }, [onReady])

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    const app = appRef.current
    const layer = cardsRef.current
    if (!canvas || !ctx || !app || !layer) {
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

    // A card where there is clear space; when there is none (the copy panel fills the screen), a retry a little
    // later. It fades in, stays put and fades out (CSS, .chaos-card); `life` starts it part-way through.
    const spawn = (now: number, life = 0): Card => {
      const el = cardElement(problems[next % problems.length])
      el.style.visibility = 'hidden'
      layer.append(el)
      const size = { w: el.offsetWidth, h: el.offsetHeight }
      const box = canvas.getBoundingClientRect()
      const others = cards.flatMap((c) => ('retry' in c ? [] : [c.box]))
      const at = pickSpawn(rand, w, h, size, gate, blockers(box), others)
      if (!at) {
        el.remove()
        return { retry: now + 900 }
      }
      next++
      const dur = (6 + rand() * 3) * 1000
      el.style.left = `${at.x - size.w / 2}px`
      el.style.top = `${at.y - size.h / 2}px`
      el.style.rotate = `${((rand() - 0.5) * 12).toFixed(1)}deg`
      el.style.animationDuration = `${dur}ms`
      el.style.animationDelay = `${-life * dur}ms`
      el.style.visibility = ''
      return { el, box: { x: at.x - size.w / 2, y: at.y - size.h / 2, ...size }, start: now - life * dur, dur }
    }
    const clearCards = () => {
      cards.forEach((c) => 'el' in c && c.el.remove())
      cards = []
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
      n = small ? 16 : 28
      // The dashboard: level with the knot (landscape) or under it (phones). The line ends at its edge.
      app.style.left = `${scene.app.x}px`
      app.style.width = `${scene.app.w}px`
      app.style.top = `${scene.app.y}px`
      app.classList.toggle('is-portrait', scene.portrait)
      const box = app.getBoundingClientRect()
      to = scene.portrait ? { x: scene.link.to.x, y: box.top - r.top } : { x: box.left - r.left, y: scene.link.to.y }
      const now = performance.now()
      const count = small ? 3 : 5
      clearCards()
      pulses = []
      // Staggered through their lives, so the first frame already shows several problems, one about to fade.
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

      // Cards: each sits still where it appeared, then fades out (solved): the knot flares and a light runs to the
      // dashboard, and the next problem appears elsewhere.
      if (!reducedMotion)
        for (let k = 0; k < cards.length; k++) {
          const c = cards[k]
          if ('retry' in c) {
            if (now >= c.retry) cards[k] = spawn(now)
          } else if (now - c.start >= c.dur) {
            c.el.remove()
            flash = 1
            pulses.push({ start: now, strong: true })
            cards[k] = spawn(now)
          }
        }

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

      // The knot: a solid white ball the threads converge into, in a soft glow, with faint thread loops turning on
      // its surface. It swells and flares as it takes a card in.
      flash = Math.max(0, flash - 0.035)
      const halo = knot.r * (6.5 + flash * 2.5)
      ctx.globalAlpha = 0.6 + flash * 0.35 + 0.06 * Math.sin(time * 1.6)
      ctx.drawImage(glow, knot.x - halo / 2, knot.y - halo / 2, halo, halo)
      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = 'source-over'
      const R = knot.r * (1 + flash * 0.12)
      const ball = ctx.createRadialGradient(knot.x - R * 0.25, knot.y - R * 0.3, R * 0.1, knot.x, knot.y, R)
      ball.addColorStop(0, '#ffffff')
      ball.addColorStop(0.6, '#f4f8ff')
      ball.addColorStop(1, '#d6e6ff')
      ctx.fillStyle = ball
      ctx.beginPath()
      ctx.arc(knot.x, knot.y, R, 0, Math.PI * 2)
      ctx.fill()
      ctx.save()
      ctx.clip()
      ctx.lineWidth = 0.8
      for (let j = 0; j < LOOPS; j++) {
        const dir = j % 2 ? 1 : -1
        const rot = hash(j) * Math.PI + time * (0.2 + hash(j + 9) * 0.35) * dir
        ctx.strokeStyle = `rgba(120,160,230,${0.1 + hash(j + 11) * 0.12})`
        ctx.beginPath()
        ctx.ellipse(knot.x, knot.y, R * (0.7 + 0.3 * hash(j + 3)), R * (0.25 + 0.7 * hash(j + 5)), rot, 0, Math.PI * 2)
        ctx.stroke()
      }
      ctx.restore()
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

    // Cards are measured to place them: wait (briefly) for the site's fonts so they are measured at their real size.
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
      clearCards()
      timers.forEach((t) => window.clearTimeout(t))
    }
  }, [active, reducedMotion, progress])

  return (
    <div className="chaos-hero" aria-hidden="true">
      <canvas ref={ref} />
      <div ref={cardsRef} className={`chaos-cards${reducedMotion ? ' is-still' : ''}`} />
      <SystemApp ref={appRef} className="chaos-app" />
    </div>
  )
}
