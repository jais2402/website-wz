// The story threads for browsers without WebGL, drawn on a 2D canvas (src/gfx/Story2D.tsx). The shapes are the
// story shader's (scene/threadShaders.ts: tangle → woven panel → helix cone → woven sphere), ported to plain
// maths so both read as the same threads; keep the two in sync. Pure: no React, no canvas.

export type V3 = [number, number, number]
export type Seed = [number, number, number, number]

const TAU = Math.PI * 2
const mix = (a: number, b: number, t: number) => a + (b - a) * t

/** Weight of shape `i` at blended stage `s` (triangle, as in the shader). */
export const stageWeight = (s: number, i: number) => Math.max(0, 1 - Math.abs(s - i))

/** Stage 0: loose, drifting tangle spanning the frame. */
export function tangle(t: number, s: Seed, time: number): V3 {
  const x = mix(-5.5, 5.5, t)
  const k = x * 0.45
  const y = Math.sin(k * 1.3 + s[0] * 23 + time * 0.35) * 1.5 + Math.sin(k * 2.9 + s[1] * 13 - time * 0.6) * 0.7
  const z = Math.cos(k * 1.1 + s[2] * 17 + time * 0.42) * 1.4 + Math.sin(k * 3.4 + s[3] * 11 + time * 0.55) * 0.6
  const m = 0.7 + s[3] * 0.5
  return [x * m, y * m, z * m]
}

/** Stage 1: a woven panel; half the strands run across, half down, going over and under. */
export function weave(t: number, s: Seed): V3 {
  if (s[0] < 0.5) {
    const row = Math.floor(s[1] * 18)
    const x = mix(-2.1, 2.1, t)
    return [x, (row / 17 - 0.5) * 2.5, Math.sin(x * Math.PI * 2.9 + row * Math.PI) * 0.09]
  }
  const col = Math.floor(s[1] * 28)
  const y = mix(-1.25, 1.25, t)
  return [(col / 27 - 0.5) * 4.2, y, -Math.sin(y * Math.PI * 3.5 + col * Math.PI) * 0.09]
}

/** Stage 2: counter-rotating helices up a cone that widens as it rises. */
export function helixCone(t: number, s: Seed): V3 {
  const dir = s[2] > 0.5 ? 1 : -1
  const a = s[0] * TAU + t * 5.5 * dir
  const r = 0.3 + t * t * 1.8
  return [Math.cos(a) * r, -2 + t * 4, Math.sin(a) * r]
}

/** Stage 3: strands wrapped as great circles round a sphere. */
export function sphereWrap(t: number, s: Seed): V3 {
  let ax: V3 = [s[0] * 2 - 1 + 1e-4, s[1] * 2 - 1 + 1e-4, s[2] * 2 - 1 + 1e-4]
  const l = Math.hypot(...ax)
  ax = [ax[0] / l, ax[1] / l, ax[2] / l]
  const h: V3 = Math.abs(ax[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0]
  let u: V3 = [ax[1] * h[2] - ax[2] * h[1], ax[2] * h[0] - ax[0] * h[2], ax[0] * h[1] - ax[1] * h[0]]
  const ul = Math.hypot(...u)
  u = [u[0] / ul, u[1] / ul, u[2] / ul]
  const v: V3 = [ax[1] * u[2] - ax[2] * u[1], ax[2] * u[0] - ax[0] * u[2], ax[0] * u[1] - ax[1] * u[0]]
  const a = t * TAU
  const r = 1.9 + s[3] * 0.18
  const c = Math.cos(a)
  const n = Math.sin(a)
  return [(u[0] * c + v[0] * n) * r, (u[1] * c + v[1] * n) * r, (u[2] * c + v[2] * n) * r]
}

/** A thread point at progress `t` for blended `stage` (0..3), and how much of it is still loose tangle. */
export function threadPos(t: number, s: Seed, stage: number, time: number): { p: V3; loose: number } {
  // Stagger mid-morph so threads ripple into place; zero at rest so shapes stay crisp.
  const st = Math.min(3, Math.max(0, stage + (s[3] - 0.5) * 0.6 * Math.sin(Math.PI * (stage % 1))))
  const w = [0, 1, 2, 3].map((i) => stageWeight(st, i))
  const parts = [tangle(t, s, time), weave(t, s), helixCone(t, s), sphereWrap(t, s)]
  const p: V3 = [0, 0, 0]
  for (let i = 0; i < 4; i++) {
    if (!w[i]) continue
    p[0] += parts[i][0] * w[i]
    p[1] += parts[i][1] * w[i]
    p[2] += parts[i][2] * w[i]
  }
  // Threads lift away from each other between shapes, then settle.
  const f = st % 1
  const between = f < 0.001 ? 0 : 1 - Math.abs(f - 0.5) * 2
  if (between) {
    const l = Math.hypot(...p) || 1
    const k = (between * 0.5 * s[3]) / l
    p[0] += p[0] * k
    p[1] += p[1] * k
    p[2] += p[2] * k
  }
  return { p, loose: w[0] }
}

// Same palette as the loom hero (0..1 rgb).
const PALETTE: V3[] = [
  [0.45, 0.22, 1],
  [0.05, 0.72, 0.95],
  [0.95, 0.12, 0.62],
  [1, 0.55, 0.22],
  [0.95, 0.12, 0.2],
  [0.78, 1, 0.24],
]
const BANDS = [0.24, 0.42, 0.58, 0.72, 0.86]
function palette(h: number): V3 {
  const i = BANDS.findIndex((b) => h < b)
  return PALETTE[i < 0 ? PALETTE.length - 1 : i]
}

/** Thread colour: loose threads use the loom palette; woven threads settle into gold / lime with violet accents. */
export function threadColor(s: Seed, loose: number): V3 {
  const gold: V3 = [0.95, 0.78, 0.5]
  const lime: V3 = [0.78, 1, 0.24]
  const violet: V3 = [0.55, 0.48, 1]
  const ordered: V3 =
    s[2] > 0.82 ? violet : [mix(gold[0], lime[0], s[1]), mix(gold[1], lime[1], s[1]), mix(gold[2], lime[2], s[1])]
  const loom = palette(s[2])
  return [mix(ordered[0], loom[0], loose), mix(ordered[1], loom[1], loose), mix(ordered[2], loom[2], loose)]
}

/** Rotate round Y then X (three.js Euler XYZ with no Z), scale, then move by `at`. */
export function place(p: V3, scale: number, rotX: number, rotY: number, at: V3): V3 {
  const cy = Math.cos(rotY)
  const sy = Math.sin(rotY)
  const x1 = p[0] * cy + p[2] * sy
  const z1 = -p[0] * sy + p[2] * cy
  const cx = Math.cos(rotX)
  const sx = Math.sin(rotX)
  const y2 = p[1] * cx - z1 * sx
  const z2 = p[1] * sx + z1 * cx
  return [x1 * scale + at[0], y2 * scale + at[1], z2 * scale + at[2]]
}

/** The story camera: at z = 7.5 looking at the origin, 45° vertical field of view. */
export const CAMERA_Z = 7.5
const HALF_FOV = (22.5 * Math.PI) / 180
/** World height visible at z = 0 (the story's `viewport.height` in R3F). */
export const VIEW_HEIGHT = 2 * CAMERA_Z * Math.tan(HALF_FOV)

/** Screen position (px) of world point `p` on a `width`×`height` canvas; null behind the camera. */
export function project(p: V3, width: number, height: number): { x: number; y: number; depth: number } | null {
  const d = CAMERA_Z - p[2]
  if (d <= 0.1) return null
  const f = height / 2 / Math.tan(HALF_FOV)
  return { x: width / 2 + (f * p[0]) / d, y: height / 2 - (f * p[1]) / d, depth: d }
}

/** Seeds for `count` strands from a small deterministic generator (same every load). */
export function strandSeeds(count: number, seed = 31): Seed[] {
  let a = seed >>> 0
  const rng = () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  return Array.from({ length: count }, () => [rng(), rng(), rng(), rng()] as Seed)
}
