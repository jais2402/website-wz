import { useEffect, useRef, useState } from 'react'
import { countries, reach } from '@/content/site'
import { arcPoints, facingRotationY } from '@/lib/geo'
import { damp } from '@/lib/math'
import { sceneStore } from '@/lib/sceneStore'
import { latLonToVec3, stageWeights } from '@/lib/shapes'
import { place, project, type Seed, strandSeeds, threadColor, threadPos, type V3, VIEW_HEIGHT } from '@/lib/story2d'

// Same placement as the WebGL story (scene/ThreadField.tsx, scene/Globe.tsx): keep in sync.
const STAGE_OFFSET_X = [0.08, 0.2, 0.22, 0.22]
const GLOBE_R = 1.9
// The canvas is plain 2D (often drawn on the CPU): at most 30 frames a second and about 2M pixels.
const FPS = 30
const MAX_PIXELS = 2_000_000

const rgba = (c: V3, a: number) =>
  `rgba(${Math.round(c[0] * 255)},${Math.round(c[1] * 255)},${Math.round(c[2] * 255)},${Math.min(1, a).toFixed(3)})`

/**
 * The story scenes and the countries globe for browsers without WebGL, drawn on a 2D canvas behind the page in
 * the same place as the WebGL canvas (and with its .canvas-root background). The same threads as the 3D story,
 * fewer of them: additive light, riders running along them, and a soft glow pass in place of the bloom. Follows
 * the scroll through sceneStore (stage, globe) like the 3D scenes; renders only while a [data-3d-zone] is on
 * screen, and holds still under reduced motion.
 */
export function Story2D({ reducedMotion }: { reducedMotion: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const [active, setActive] = useState(false)

  useEffect(() => {
    const zones = Array.from(document.querySelectorAll('[data-3d-zone]'))
    const on = new Set<Element>()
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) on.add(e.target)
          else on.delete(e.target)
        }
        sceneStore.visible = on.size > 0
        setActive(on.size > 0)
      },
      { rootMargin: '10% 0px' },
    )
    zones.forEach((z) => io.observe(z))
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const el = canvas.current
    const ctx = el?.getContext('2d')
    if (!el || !ctx || !active) return
    const small = window.matchMedia('(max-width: 768px), (pointer: coarse)').matches
    const seeds: Seed[] = strandSeeds(small ? 90 : 170)
    const POINTS = small ? 56 : 72
    const riders = seeds.map((s, i) => ({ s, phase: (i * 0.618) % 1, speed: 0.04 + s[3] * 0.05 }))
    const dust = strandSeeds(small ? 70 : 160, 7)

    // Globe geometry, built once in the globe's own space.
    const hq = countries.find((c) => c.name === reach.hq) ?? countries[0]
    const DOTS = small ? 420 : 760
    const dots: V3[] = Array.from({ length: DOTS }, (_, i) => {
      const k = i + 0.5
      const phi = Math.acos(1 - (2 * k) / DOTS)
      const theta = Math.PI * (1 + Math.sqrt(5)) * k
      return [
        Math.cos(theta) * Math.sin(phi) * GLOBE_R,
        Math.cos(phi) * GLOBE_R,
        Math.sin(theta) * Math.sin(phi) * GLOBE_R,
      ]
    })
    const rings: V3[][] = [-60, -30, 0, 30, 60].map((lat) =>
      Array.from({ length: 73 }, (_, i) => latLonToVec3(lat, (i / 72) * 360 - 180, GLOBE_R * 1.002)),
    )
    const arcs = countries
      .map((c, ci) => ({ c, ci }))
      .filter(({ c }) => c !== hq)
      .map(({ c, ci }) => {
        const flat = arcPoints(hq, c, GLOBE_R, 48)
        const pts: V3[] = []
        for (let i = 0; i < flat.length; i += 3) pts.push([flat[i], flat[i + 1], flat[i + 2]])
        return { pts, ci }
      })
    const pins = countries.map((c, i) => ({ p: latLonToVec3(c.lat, c.lon, GLOBE_R * 1.01), hq: c === hq, i }))
    const baseRotY = facingRotationY(62)

    // Glow pass: the frame shrunk to a quarter and laid back over itself, blurred by the scaling, like a bloom.
    const glow = document.createElement('canvas')
    const gctx = glow.getContext('2d')

    let w = 0
    let h = 0
    let dpr = 1
    const fit = () => {
      w = el.clientWidth
      h = el.clientHeight
      dpr = Math.min(window.devicePixelRatio || 1, 1.5, Math.sqrt(MAX_PIXELS / Math.max(1, w * h)))
      el.width = Math.round(w * dpr)
      el.height = Math.round(h * dpr)
      glow.width = Math.max(1, Math.round(w / 4))
      glow.height = Math.max(1, Math.round(h / 4))
    }
    fit()
    window.addEventListener('resize', fit)

    let stage = sceneStore.stage
    let globe = sceneStore.globe
    let draw = sceneStore.globe > 0.5 ? 1 : 0
    let spin = 0
    let time = 0
    let last = 0
    let raf = 0

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      const dt = last ? Math.min((now - last) / 1000, 0.1) : 0
      if (last && dt < 1 / FPS - 0.002) return
      last = now
      if (!reducedMotion) {
        time += dt
        spin += dt * 0.16
      }
      stage = reducedMotion ? sceneStore.stage : damp(stage, sceneStore.stage, 3, dt)
      globe = reducedMotion ? sceneStore.globe : damp(globe, sceneStore.globe, 4, dt)
      draw = reducedMotion ? 1 : sceneStore.globe > 0.5 ? damp(draw, 1, 1.4, dt) : damp(draw, 0, 6, dt)

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'lighter'
      ctx.lineJoin = 'round'
      const vw = (VIEW_HEIGHT * w) / h
      const vh = VIEW_HEIGHT
      const side = vw > 5.2

      // Dust: faint fixed stars.
      for (const d of dust) {
        ctx.fillStyle = `rgba(170,180,230,${(0.12 + d[2] * 0.25).toFixed(3)})`
        ctx.fillRect(d[0] * w, d[1] * h, 1 + d[3], 1 + d[3])
      }

      const fade = 1 - globe
      if (fade > 0.01) {
        const weights = stageWeights(stage, 4)
        const at: V3 = [
          side ? weights.reduce((a, wt, i) => a + wt * STAGE_OFFSET_X[i], 0) * vw : 0,
          side ? 0 : (1 - weights[0]) * vh * 0.23,
          0,
        ]
        const scale = side ? Math.min(1, vw / 11) : Math.min(1, vw / 6.2)
        const turning = weights[2] + weights[3]
        const rotY = spin * turning - weights[1] * 0.18
        const rotX = 0.12 * weights[1] + 0.22 * weights[2] + 0.15 * weights[3]
        const screen = (p: V3) => project(place(p, scale, rotX, rotY, at), w, h)

        // Fewer strands than the 3D story, so each carries more light.
        const boost = small ? 1.9 : 1.6
        ctx.lineWidth = small ? 1 : 1.15
        for (const s of seeds) {
          let loose = 0
          ctx.beginPath()
          for (let i = 0; i < POINTS; i++) {
            const t = i / (POINTS - 1)
            const r = threadPos(t, s, stage, time)
            loose = r.loose
            const q = screen(r.p)
            if (!q) continue
            if (i === 0) ctx.moveTo(q.x, q.y)
            else ctx.lineTo(q.x, q.y)
          }
          const alpha = (loose * 0.085 + (1 - loose) * 0.36) * (0.55 + s[3] * 0.9) * fade * boost
          ctx.strokeStyle = rgba(threadColor(s, loose), alpha)
          ctx.stroke()
        }
        // Riders: small lights running along the threads.
        for (const r of riders) {
          const t = (r.phase + time * r.speed) % 1
          const tp = threadPos(t, r.s, stage, time)
          const q = screen(tp.p)
          if (!q) continue
          const c = threadColor(r.s, tp.loose)
          const lit: V3 = [c[0] * 0.55 + 0.45, c[1] * 0.55 + 0.45, c[2] * 0.55 + 0.45]
          const size = (small ? 1.6 : 2) * (1 + r.s[3])
          ctx.fillStyle = rgba(lit, (0.45 + r.s[3] * 0.4) * fade)
          ctx.fillRect(q.x - size / 2, q.y - size / 2, size, size)
        }
        // The glowing core inside the Secure sphere.
        if (weights[3] > 0.01) {
          const c = screen([0, 0, 0])
          if (c) {
            const rad = (h / VIEW_HEIGHT) * scale * (0.9 + Math.sin(time * 2) * 0.05)
            const g = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, rad)
            g.addColorStop(0, `rgba(255,255,255,${(0.95 * weights[3] * fade).toFixed(3)})`)
            g.addColorStop(0.25, `rgba(255,236,200,${(0.5 * weights[3] * fade).toFixed(3)})`)
            g.addColorStop(1, 'rgba(255,220,160,0)')
            ctx.fillStyle = g
            ctx.fillRect(c.x - rad, c.y - rad, rad * 2, rad * 2)
          }
        }
        // Where the guide light and any later overlay look for the shape's centre.
        const centre = screen([0, 0, 0])
        if (centre) {
          sceneStore.core.x = centre.x / w
          sceneStore.core.y = centre.y / h
        }
      }

      if (globe > 0.01) {
        const at: V3 = [side ? vw * 0.2 : 0, side ? 0 : vh * 0.2, 0]
        const size = (side ? Math.min(1, vw / 10) : Math.min(1, vw / 5.4)) * (0.9 + globe * 0.1)
        const rotY = baseRotY + Math.atan2(-at[0], 7.5) + Math.sin(time * 0.15) * 0.22
        const g = (p: V3) => {
          const wp = place(p, size, 0.28, rotY, at)
          return { q: project(wp, w, h), front: wp[2] - at[2] > -0.2 * size }
        }
        for (const d of dots) {
          const { q, front } = g(d)
          if (!q) continue
          ctx.fillStyle = `rgba(154,163,199,${((front ? 0.55 : 0.16) * globe).toFixed(3)})`
          ctx.fillRect(q.x - 0.8, q.y - 0.8, 1.6, 1.6)
        }
        ctx.lineWidth = 1
        ctx.strokeStyle = `rgba(140,196,255,${(0.16 * globe).toFixed(3)})`
        for (const ring of rings) {
          ctx.beginPath()
          ring.forEach((p, i) => {
            const { q } = g(p)
            if (!q) return
            if (i === 0) ctx.moveTo(q.x, q.y)
            else ctx.lineTo(q.x, q.y)
          })
          ctx.stroke()
        }
        // Routes from Chennai, drawn outward as the globe fades in, each with a travelling light pulse.
        ctx.lineWidth = small ? 1.2 : 1.5
        for (const { pts, ci } of arcs) {
          const n = Math.max(1, Math.floor(draw * (pts.length - 1)))
          const lit = ci === sceneStore.highlight
          ctx.beginPath()
          for (let i = 0; i <= n; i++) {
            const { q } = g(pts[i])
            if (!q) continue
            if (i === 0) ctx.moveTo(q.x, q.y)
            else ctx.lineTo(q.x, q.y)
          }
          ctx.strokeStyle = `rgba(107,173,255,${((lit ? 1 : 0.6) * globe).toFixed(3)})`
          ctx.stroke()
          const pulse = Math.floor(((time * 0.28 + ci * 0.137) % 1) * (pts.length - 1))
          if (pulse <= n) {
            const { q } = g(pts[pulse])
            if (q) {
              ctx.fillStyle = `rgba(230,245,255,${(0.9 * globe).toFixed(3)})`
              ctx.fillRect(q.x - 1.5, q.y - 1.5, 3, 3)
            }
          }
        }
        for (const pin of pins) {
          const { q, front } = g(pin.p)
          if (!q || !front) continue
          const lit = pin.i === sceneStore.highlight
          const r = (pin.hq ? 4 : lit ? 3.5 : 2.4) * (1 + Math.sin(time * 3 + pin.i) * 0.15) * globe
          ctx.fillStyle = pin.hq ? `rgba(255,255,255,${globe.toFixed(3)})` : `rgba(140,196,255,${globe.toFixed(3)})`
          ctx.beginPath()
          ctx.arc(q.x, q.y, r, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // Bloom stand-in: blur by shrinking, then add back.
      if (gctx) {
        gctx.globalCompositeOperation = 'copy'
        gctx.drawImage(el, 0, 0, glow.width, glow.height)
        ctx.setTransform(1, 0, 0, 1, 0, 0)
        ctx.globalAlpha = 0.55
        ctx.drawImage(glow, 0, 0, el.width, el.height)
        ctx.globalAlpha = 1
      }
      ctx.globalCompositeOperation = 'source-over'
    }
    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', fit)
    }
  }, [active, reducedMotion])

  return (
    <div className={`canvas-root story-2d${active ? '' : ' is-paused'}`} aria-hidden="true">
      <canvas ref={canvas} />
    </div>
  )
}
