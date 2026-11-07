import { useEffect, useRef } from 'react'
import { loom } from '@/content/site'
import { drawsInSoftware } from '@/gfx/gfxMode'
import {
  APP_MIN_W,
  appFit,
  chaosScene,
  type Gate,
  hash,
  knotGate,
  cardRect,
  overlapsAny,
  pickOnThread,
  type Pt,
  type Rect,
  type Scene,
  strandPoint,
} from '@/lib/chaos'
import { SystemApp } from './SystemApp'

type Problem = (typeof loom.chaos.problems)[number]
// A problem card riding on main thread `i` at `t`: `el` is its positioner (moved every frame, faded when the thread
// carries it behind the copy), holding the note itself (faded in and out by CSS).
type Card =
  | { el: HTMLElement; i: number; t: number; size: { w: number; h: number }; rot: number; start: number; dur: number }
  | { retry: number }
type Pulse = { start: number; strong: boolean }

const SEGMENTS = 64
const PULSE_S = 1.6
// The Before/After tangle's colours (loom.css, .ba-tangle).
const TANGLE = ['255,120,150', '139,123,255', '47,208,255']
// A few light threads, as in the Before/After tangle (a little brighter, so they read over the hero's haze).
const TANGLE_ALPHA = [0.5, 0.55, 0.45]

/** One problem card as the Before/After notes are written (.ba-note, .ba-sticky): real text, so it stays sharp. */
function cardElement(p: Problem): HTMLElement {
  const el = document.createElement('span')
  el.className = p.kind === 'sticky' ? 'ba-sticky chaos-card' : 'ba-note chaos-card'
  const pos = document.createElement('span')
  pos.className = 'chaos-card-pos'
  pos.append(el)
  if (p.badge) {
    const badge = document.createElement('i')
    badge.className = 'badge'
    badge.textContent = p.badge
    el.append(badge, ' ')
  }
  el.append(p.text)
  return pos
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
    let dust = 70
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
    // Parallax: the tangle shifts a little with the pointer (desktop), the fine threads less than the main ones.
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 }
    const parallax = window.matchMedia('(pointer: fine)').matches && !reducedMotion
    const onPointer = (e: PointerEvent) => {
      pointer.tx = (e.clientX / window.innerWidth) * 2 - 1
      pointer.ty = (e.clientY / window.innerHeight) * 2 - 1
    }
    if (parallax) window.addEventListener('pointermove', onPointer, { passive: true })
    const glow = glowSprite()
    const problems = loom.chaos.problems
    const t0 = performance.now()
    let seed = 7
    const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646

    // The scene as last drawn, so cards are placed on the threads where they are now.
    let curTime = 0
    let curChaos = 1
    // A point on a thread, shifted by the parallax (fading out into the knot, which stays put).
    const at = (i: number, count: number, t: number, depth: number) => {
      const p = strandPoint(i, count, t, curTime, curChaos, w, h, gate)
      const k = (1 - t) * depth
      return { x: p.x - pointer.x * k, y: p.y - pointer.y * k * 0.6 }
    }
    const MAIN_DEPTH = 22
    const onThread = (c: { i: number; t: number }) => at(c.i, n, c.t, MAIN_DEPTH)
    const placed = (c: Card) => ('retry' in c ? [] : [cardRect(onThread(c), c.size)])
    // What cards keep clear of, re-read twice a second (the copy panel changes as the hero scrolls).
    let blocked: Rect[] = []
    let blockedAt = -1
    let covered = false

    // A card on a thread where there is clear space; when there is none (the copy panel fills the screen), a retry
    // a little later. It fades in, rides its thread and fades out (CSS, .chaos-card); `life` starts it part-way.
    const spawn = (now: number, life = 0): Card => {
      const el = cardElement(problems[next % problems.length])
      el.style.visibility = 'hidden'
      layer.append(el)
      const size = { w: el.offsetWidth, h: el.offsetHeight }
      blocked = blockers(canvas.getBoundingClientRect())
      blockedAt = now
      const others = cards.flatMap(placed)
      const bounds = { x: 8, y: gate.spanTop, w: w - 16, h: gate.spanBottom - gate.spanTop }
      const spot = pickOnThread(rand, n, size, (i, t) => at(i, n, t, MAIN_DEPTH), bounds, blocked, others)
      if (!spot) {
        el.remove()
        return { retry: now + 900 }
      }
      next++
      const dur = (6 + rand() * 3) * 1000
      const note = el.firstElementChild as HTMLElement
      note.style.animationDuration = `${dur}ms`
      note.style.animationDelay = `${-life * dur}ms`
      el.style.visibility = ''
      const card = { el, ...spot, size, rot: (rand() - 0.5) * 10, start: now - life * dur, dur }
      move(card)
      return card
    }
    // Keeps a card on its thread; hides it while the thread carries it behind the copy panel.
    const move = (c: Extract<Card, { el: HTMLElement }>) => {
      const p = onThread(c)
      c.el.style.transform = `translate(${(p.x - c.size.w / 2).toFixed(1)}px, ${(p.y - c.size.h / 2).toFixed(1)}px) rotate(${c.rot.toFixed(1)}deg)`
      c.el.classList.toggle('is-covered', overlapsAny(cardRect(p, c.size), blocked, 4))
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
      n = small ? 9 : 12
      // Fewer specks where the processor draws everything.
      dust = software ? 24 : small ? 30 : 50
      // The dashboard: level with the knot (landscape) or under it (phones). The line ends at its edge.
      // Landscape: laid out at a readable width, then scaled down to its slot and to the screen's height, so on a
      // small window it shrinks instead of clipping its rows and running off the right edge.
      const layoutW = scene.portrait ? scene.app.w : Math.max(scene.app.w, APP_MIN_W)
      app.style.left = `${scene.app.x}px`
      app.style.width = `${layoutW}px`
      app.style.top = `${scene.app.y}px`
      app.classList.toggle('is-portrait', scene.portrait)
      app.style.setProperty('--fit', String(scene.portrait ? 1 : appFit(scene.app.w, layoutW, app.offsetHeight, h)))
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
      curTime = time
      curChaos = chaos
      const { knot } = scene
      const from = scene.link.from
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      ctx.lineCap = 'round'
      ctx.imageSmoothingQuality = 'high'

      pointer.x += (pointer.tx - pointer.x) * 0.06
      pointer.y += (pointer.ty - pointer.y) * 0.06

      // The threads, brightening to white as they gather into the knot.
      const paths: Pt[][] = []
      for (let i = 0; i < n; i++) {
        const pts: Pt[] = []
        for (let s = 0; s <= SEGMENTS; s++) pts.push(at(i, n, s / SEGMENTS, MAIN_DEPTH))
        paths.push(pts)
      }
      ctx.globalCompositeOperation = 'source-over'
      ctx.lineWidth = small ? 1.1 : 1.4
      for (let i = 0; i < n; i++) {
        const k = i % TANGLE.length
        const a = TANGLE_ALPHA[k] + hash(i + 7) * 0.1
        const g = ctx.createLinearGradient(0, 0, knot.x, 0)
        g.addColorStop(0, `rgba(${TANGLE[k]},0)`)
        g.addColorStop(0.12, `rgba(${TANGLE[k]},${a})`)
        g.addColorStop(0.85, `rgba(${TANGLE[k]},${a})`)
        g.addColorStop(1, 'rgba(230,240,255,1)')
        ctx.strokeStyle = g
        ctx.beginPath()
        paths[i].forEach((p, s) => (s ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)))
        ctx.stroke()
      }

      // Dust: fine specks of light drifting through the tangle towards the knot, twinkling.
      if (!reducedMotion) {
        ctx.globalCompositeOperation = 'lighter'
        for (let d = 0; d < dust; d++) {
          const u = (time * (0.02 + hash(d + 900) * 0.03) + hash(d + 700)) % 1
          const e = u * u
          const sx = hash(d + 800) * knot.x * 0.9
          const sy = gate.spanTop + hash(d + 600) * (gate.spanBottom - gate.spanTop)
          const x = sx + (knot.x - sx) * e + Math.sin(time * 0.5 + d) * 6 - pointer.x * 30 * (1 - e)
          const y = sy + (knot.y - sy) * e + Math.cos(time * 0.4 + d * 1.3) * 6 - pointer.y * 18 * (1 - e)
          const size = (2 + hash(d + 500) * 4) * (small ? 0.8 : 1)
          ctx.globalAlpha = Math.min(1, u * 5) * (1 - e) * (0.35 + 0.35 * Math.sin(time * 2 + d * 2.1) ** 2)
          ctx.drawImage(glow, x - size, y - size, size * 2, size * 2)
        }
        ctx.globalAlpha = 1
        ctx.globalCompositeOperation = 'source-over'
      }

      // Light flowing along every thread into the knot: everything moves to the centre.
      if (!reducedMotion) {
        ctx.globalCompositeOperation = 'lighter'
        for (let i = 0; i < n; i++) {
          const u = (time * (0.07 + hash(i + 41) * 0.05) + hash(i + 17)) % 1
          const p = strandPoint(i, n, u, time, chaos, w, h, gate)
          const s = small ? 9 : 12
          ctx.globalAlpha = Math.min(1, u * 4) * (0.5 + 0.5 * u)
          ctx.drawImage(glow, p.x - s / 2, p.y - s / 2, s, s)
        }
        ctx.globalAlpha = 1
        ctx.globalCompositeOperation = 'source-over'
      }

      // Cards ride their threads, then fade out (solved): the knot flares and a light runs to the dashboard, and the
      // next problem appears on another thread.
      if (now - blockedAt > 500) {
        const box = canvas.getBoundingClientRect()
        blocked = blockers(box)
        blockedAt = now
        // On screens too narrow for both, the dashboard waits while the hero copy (the intro, then each step's card)
        // would cover it.
        const panel = app.getBoundingClientRect()
        covered = [...document.querySelectorAll('.loom-intro:not(.is-gone), .loom-phase.is-active')].some((el) => {
          const c = el.getBoundingClientRect()
          return c.right > panel.left + 8 && c.bottom > panel.top && c.top < panel.bottom
        })
        app.classList.toggle('is-covered', covered)
      }
      for (let k = 0; k < cards.length; k++) {
        const c = cards[k]
        if ('retry' in c) {
          if (now >= c.retry && !reducedMotion) cards[k] = spawn(now)
        } else if (now - c.start >= c.dur && !reducedMotion) {
          c.el.remove()
          flash = 1
          pulses.push({ start: now, strong: true })
          cards[k] = spawn(now)
        } else move(c)
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

      // The knot: a solid white ball the threads converge into, in a soft glow. It swells and flares as a problem is
      // solved.
      flash = Math.max(0, flash - 0.035)
      const halo = knot.r * (9 + flash * 3)
      ctx.globalAlpha = 0.6 + flash * 0.35 + 0.06 * Math.sin(time * 1.6)
      ctx.drawImage(glow, knot.x - halo / 2, knot.y - halo / 2, halo, halo)
      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = 'source-over'
      // Solid white, with only a faint cool rim so it reads as a ball against its glow.
      const R = knot.r * (1 + flash * 0.12)
      const ball = ctx.createRadialGradient(knot.x, knot.y, 0, knot.x, knot.y, R)
      ball.addColorStop(0, '#ffffff')
      ball.addColorStop(0.82, '#ffffff')
      ball.addColorStop(1, '#e4eeff')
      ctx.fillStyle = ball
      ctx.beginPath()
      ctx.arc(knot.x, knot.y, R, 0, Math.PI * 2)
      ctx.fill()
      // A lens streak through the knot, like light caught by a film camera: wide and thin, breathing with the glow.
      ctx.globalCompositeOperation = 'lighter'
      const streak = 0.5 + 0.15 * Math.sin(time * 1.2) + flash * 0.4
      ctx.globalAlpha = streak * 0.55
      ctx.drawImage(glow, knot.x - knot.r * 16, knot.y - knot.r * 0.7, knot.r * 32, knot.r * 1.4)
      ctx.globalAlpha = streak * 0.35
      ctx.drawImage(glow, knot.x - knot.r * 30, knot.y - knot.r * 0.22, knot.r * 60, knot.r * 0.44)
      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = 'source-over'
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
      window.removeEventListener('pointermove', onPointer)
      clearCards()
      timers.forEach((t) => window.clearTimeout(t))
    }
  }, [active, reducedMotion, progress])

  return (
    <div className="chaos-hero" aria-hidden="true">
      <canvas ref={ref} />
      <div ref={cardsRef} className={`chaos-cards${reducedMotion ? ' is-still' : ''}`} />
      <SystemApp ref={appRef} className="chaos-app" extended />
    </div>
  )
}
