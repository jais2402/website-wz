import { useMemo } from 'react'
import { countries, reach } from '@/content/site'
import { arcPoints, facingRotationY } from '@/lib/geo'
import { latLonToVec3, mulberry32 } from '@/lib/shapes'

// Static, code-drawn SVG stand-ins for the WebGL scenes, used in lite mode. No three.js is loaded.

const THREAD_COLOURS = ['#8b7bff', '#ff47c7', '#2fd0ff', '#ff7a59', '#ff4763', '#4d9fff']

/** Hero: tangled colourful threads converging into a ring "loom" and leaving as one bundle. */
export function LoomLiteArt() {
  const threads = useMemo(() => {
    const rng = mulberry32(7)
    return Array.from({ length: 70 }, (_, i) => {
      const y0 = 40 + rng() * 520
      const c1x = 120 + rng() * 260
      const c1y = rng() * 600
      const c2y = 300 + (rng() - 0.5) * 140
      return { d: `M-20 ${y0.toFixed(1)} C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, 520 ${c2y.toFixed(1)}, 700 ${(300 + (rng() - 0.5) * 40).toFixed(1)}`, c: THREAD_COLOURS[i % THREAD_COLOURS.length] }
    })
  }, [])
  return (
    <svg className="lite-art lite-loom" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <radialGradient id="lite-glow">
          <stop offset="0%" stopColor="#fff4e6" stopOpacity="0.95" />
          <stop offset="35%" stopColor="#b8a8ff" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#7f6cff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="lite-bundle" x1="0" x2="1">
          <stop offset="0%" stopColor="#d9c8a6" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#8cc4ff" stopOpacity="0.5" />
        </linearGradient>
      </defs>
      <circle cx="700" cy="300" r="230" fill="url(#lite-glow)" />
      {threads.map((t, i) => (
        <path key={i} d={t.d} stroke={t.c} strokeOpacity="0.45" strokeWidth="1.2" fill="none" />
      ))}
      <path d="M700 270 L1220 285 L1220 315 L700 330 Z" fill="url(#lite-bundle)" opacity="0.55" />
      {[0, 1, 2, 3, 4, 5].map((k) => (
        <ellipse key={k} cx={700 + k * 85} cy="300" rx={18 - k} ry={112 - k * 15} fill="none" stroke="#2b3042" strokeWidth={k === 0 ? 9 : 6} />
      ))}
      <ellipse cx="700" cy="300" rx="18" ry="112" fill="none" stroke="#fff4e6" strokeOpacity="0.6" strokeWidth="2" strokeDasharray="6 22" />
    </svg>
  )
}

/** Story: the three principles as static woven shapes; the active one is shown. */
export function StoryLiteArt({ step }: { step: number }) {
  const cone = useMemo(
    () =>
      Array.from({ length: 16 }, (_, k) => {
        const t = k / 15
        const r = 20 + t * t * 160
        return { y: 520 - t * 420, r }
      }),
    [],
  )
  return (
    <svg className="lite-art lite-story" viewBox="0 0 600 600" aria-hidden="true">
      <g className={step === 0 ? 'is-on' : ''}>
        {Array.from({ length: 13 }, (_, i) => (
          <path key={`h${i}`} d={`M90 ${150 + i * 25} Q 300 ${150 + i * 25 + (i % 2 ? 6 : -6)} 510 ${150 + i * 25}`} className="lite-thread" />
        ))}
        {Array.from({ length: 19 }, (_, i) => (
          <path key={`v${i}`} d={`M${90 + i * 23.3} 150 Q ${90 + i * 23.3 + (i % 2 ? 6 : -6)} 300 ${90 + i * 23.3} 450`} className="lite-thread alt" />
        ))}
      </g>
      <g className={step === 1 ? 'is-on' : ''}>
        {cone.map((c, i) => (
          <ellipse key={i} cx="300" cy={c.y} rx={c.r} ry={c.r * 0.22} className="lite-thread" />
        ))}
        <path d="M280 520 L120 100 M320 520 L480 100" className="lite-thread alt" />
      </g>
      <g className={step === 2 ? 'is-on' : ''}>
        {Array.from({ length: 9 }, (_, i) => (
          <ellipse key={`a${i}`} cx="300" cy="300" rx="190" ry={190 * Math.abs(Math.cos((i / 9) * Math.PI))} transform={`rotate(${i * 20} 300 300)`} className="lite-thread" />
        ))}
        <circle cx="300" cy="300" r="34" fill="#fff1dc" opacity="0.85" />
      </g>
    </svg>
  )
}

/** Countries: a flat globe with arcs from the HQ to every country (same maths as the WebGL globe). */
export function GlobeLiteArt() {
  const { arcs, pins, hqPin } = useMemo(() => {
    const R = 200
    const rotY = facingRotationY(70) // turn the globe so the Gulf, India and South-East Asia face the viewer
    const project = (v: [number, number, number]) => {
      const x = v[0] * Math.cos(rotY) + v[2] * Math.sin(rotY)
      const z = -v[0] * Math.sin(rotY) + v[2] * Math.cos(rotY)
      return { x: 300 + x, y: 300 - v[1], front: z >= -20 }
    }
    const hq = countries.find((c) => c.name === reach.hq)!
    const arcs = countries
      .filter((c) => c !== hq)
      .map((c) => {
        const pts = arcPoints(hq, c, R, 40)
        let d = ''
        for (let i = 0; i <= 40; i++) {
          const p = project([pts[i * 3], pts[i * 3 + 1], pts[i * 3 + 2]])
          d += `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)} `
        }
        return d
      })
    const pins = countries.map((c) => project(latLonToVec3(c.lat, c.lon, R)))
    return { arcs, pins, hqPin: project(latLonToVec3(hq.lat, hq.lon, R)) }
  }, [])
  return (
    <svg className="lite-art lite-globe" viewBox="0 0 600 600" aria-hidden="true">
      <circle cx="300" cy="300" r="200" fill="rgba(77,159,255,0.05)" stroke="rgba(140,196,255,0.35)" />
      {[-60, -30, 0, 30, 60].map((lat) => {
        const y = 300 - 200 * Math.sin((lat * Math.PI) / 180)
        const rx = 200 * Math.cos((lat * Math.PI) / 180)
        return <ellipse key={lat} cx="300" cy={y} rx={rx} ry={rx * 0.18} fill="none" stroke="rgba(140,196,255,0.18)" />
      })}
      {arcs.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="#6badff" strokeWidth="1.4" opacity="0.8" />
      ))}
      {pins
        .filter((p) => p.front)
        .map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4" fill="#8cc4ff" />
        ))}
      <circle cx={hqPin.x} cy={hqPin.y} r="7" fill="#e6f1ff" />
    </svg>
  )
}
