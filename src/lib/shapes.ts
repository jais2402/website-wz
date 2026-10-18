// Morph targets for the particle field. Each generator returns `count * 3` floats (xyz).
// Order matters: index = scroll "stage" (0 chaos → 1 simplify → 2 scale → 3 secure → 4 globe).

export type Rng = () => number

/** Deterministic PRNG so shapes are identical between renders (and in tests). */
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const TAU = Math.PI * 2

/** Stage 0 — scattered fragments: loose clusters ("spreadsheets, threads") inside a wide ellipsoid. */
export function chaos(count: number, rng: Rng): Float32Array {
  const out = new Float32Array(count * 3)
  const clusters = Array.from({ length: 14 }, () => [
    (rng() - 0.5) * 9,
    (rng() - 0.5) * 5,
    (rng() - 0.5) * 4,
  ])
  for (let i = 0; i < count; i++) {
    const inCluster = rng() < 0.55
    if (inCluster) {
      const c = clusters[i % clusters.length]
      // Small flat "card" around each cluster centre.
      out[i * 3] = c[0] + (rng() - 0.5) * 0.9
      out[i * 3 + 1] = c[1] + (rng() - 0.5) * 0.55
      out[i * 3 + 2] = c[2] + (rng() - 0.5) * 0.05
    } else {
      out[i * 3] = (rng() - 0.5) * 12
      out[i * 3 + 1] = (rng() - 0.5) * 7
      out[i * 3 + 2] = (rng() - 0.5) * 6
    }
  }
  return out
}

/** Stage 1 — simplify: a tidy, slightly tilted grid of dashboard cards. */
export function grid(count: number, rng: Rng): Float32Array {
  const out = new Float32Array(count * 3)
  const cols = 3
  const rows = 3
  const cardW = 1.45
  const cardH = 0.9
  const gap = 0.28
  const totalW = cols * cardW + (cols - 1) * gap
  const totalH = rows * cardH + (rows - 1) * gap
  for (let i = 0; i < count; i++) {
    const card = i % (cols * rows)
    const cx = (card % cols) * (cardW + gap) - totalW / 2 + cardW / 2
    const cy = Math.floor(card / cols) * (cardH + gap) - totalH / 2 + cardH / 2
    // 40% on the card outline, the rest as horizontal "rows" of data.
    let x: number
    let y: number
    if (rng() < 0.4) {
      const t = rng() * 2 * (cardW + cardH)
      if (t < cardW) [x, y] = [t - cardW / 2, -cardH / 2]
      else if (t < cardW + cardH) [x, y] = [cardW / 2, t - cardW - cardH / 2]
      else if (t < 2 * cardW + cardH) [x, y] = [t - cardW - cardH - cardW / 2, cardH / 2]
      else [x, y] = [-cardW / 2, t - 2 * cardW - cardH - cardH / 2]
    } else {
      const line = Math.floor(rng() * 4)
      const len = 0.35 + ((card * 7 + line * 3) % 5) * 0.12
      x = -cardW / 2 + 0.15 + rng() * len
      y = cardH / 2 - 0.22 - line * 0.2
    }
    out[i * 3] = cx + x
    out[i * 3 + 1] = cy + y
    out[i * 3 + 2] = 0
  }
  return out
}

/** Stage 2 — scale: stacked rings that widen as they rise, a growing foundation. */
export function tower(count: number, rng: Rng): Float32Array {
  const out = new Float32Array(count * 3)
  const levels = 18
  for (let i = 0; i < count; i++) {
    const level = i % levels
    const t = level / (levels - 1)
    const radius = 0.35 + t * t * 2.1
    const a = rng() * TAU
    out[i * 3] = Math.cos(a) * radius
    out[i * 3 + 1] = -2.3 + t * 3.9
    out[i * 3 + 2] = Math.sin(a) * radius
  }
  return out
}

/** Stage 3 — secure: a protective shell around a dense core. */
export function shield(count: number, rng: Rng): Float32Array {
  const out = new Float32Array(count * 3)
  const shellCount = Math.floor(count * 0.72)
  for (let i = 0; i < count; i++) {
    if (i < shellCount) {
      // Fibonacci sphere: even distribution on the shell.
      const k = i + 0.5
      const phi = Math.acos(1 - (2 * k) / shellCount)
      const theta = Math.PI * (1 + Math.sqrt(5)) * k
      const r = 2.4
      out[i * 3] = Math.cos(theta) * Math.sin(phi) * r
      out[i * 3 + 1] = Math.cos(phi) * r
      out[i * 3 + 2] = Math.sin(theta) * Math.sin(phi) * r
    } else {
      // Core cube.
      const s = 0.75
      out[i * 3] = (rng() - 0.5) * s
      out[i * 3 + 1] = (rng() - 0.5) * s
      out[i * 3 + 2] = (rng() - 0.5) * s
    }
  }
  return out
}

/** Converts latitude/longitude (degrees) to a point on a sphere of `radius`. */
export function latLonToVec3(lat: number, lon: number, radius: number): [number, number, number] {
  const phi = ((90 - lat) * Math.PI) / 180
  const theta = ((lon + 180) * Math.PI) / 180
  return [-radius * Math.sin(phi) * Math.cos(theta), radius * Math.cos(phi), radius * Math.sin(phi) * Math.sin(theta)]
}

/** Stage 4 — globe: latitude/longitude lines of dots. */
export function globe(count: number, rng: Rng, radius = 2.3): Float32Array {
  const out = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    let lat: number
    let lon: number
    if (i % 2 === 0) {
      lat = -80 + Math.floor(rng() * 17) * 10
      lon = rng() * 360 - 180
    } else {
      lon = -180 + Math.floor(rng() * 24) * 15
      lat = rng() * 170 - 85
    }
    const [x, y, z] = latLonToVec3(lat, lon, radius)
    out[i * 3] = x
    out[i * 3 + 1] = y
    out[i * 3 + 2] = z
  }
  return out
}

export const STAGE_COUNT = 5

export function buildStages(count: number, seed = 7): Float32Array[] {
  const rng = mulberry32(seed)
  return [chaos(count, rng), grid(count, rng), tower(count, rng), shield(count, rng), globe(count, rng)]
}

/** Triangle weights for blending stage `i` at continuous progress `p` (0..STAGE_COUNT-1). Weights sum to 1. */
export function stageWeights(p: number, stages = STAGE_COUNT): number[] {
  const clamped = Math.min(stages - 1, Math.max(0, p))
  return Array.from({ length: stages }, (_, i) => Math.max(0, 1 - Math.abs(clamped - i)))
}
