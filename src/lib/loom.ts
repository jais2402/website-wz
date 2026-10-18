import { mulberry32 } from './shapes'

// Geometry data for the time-loom hero. Every strand is a polyline whose real position is computed on the GPU
// (see loom/shaders.ts) from its progress `t` (0 = far-left chaos, 1 = far-right ordered bundle) and four seeds.

export type StrandData = {
  /** Per-vertex progress along the strand, 0..1. */
  t: Float32Array
  /** Per-vertex strand seeds (4 per vertex, identical for every vertex of one strand). */
  seed: Float32Array
  /** Line-segment index pairs: (0,1) (1,2) … for each strand, never bridging two strands. */
  index: Uint32Array
  /** The seeds of each strand, so particles can ride exactly on existing threads. */
  strandSeeds: Float32Array
}

export function buildStrands(strands: number, points: number, seed = 11): StrandData {
  const rng = mulberry32(seed)
  const vertexCount = strands * points
  const t = new Float32Array(vertexCount)
  const seeds = new Float32Array(vertexCount * 4)
  const index = new Uint32Array(strands * (points - 1) * 2)
  const strandSeeds = new Float32Array(strands * 4)

  let k = 0
  for (let s = 0; s < strands; s++) {
    const sd = [rng(), rng(), rng(), rng()]
    strandSeeds.set(sd, s * 4)
    for (let p = 0; p < points; p++) {
      const v = s * points + p
      t[v] = p / (points - 1)
      seeds.set(sd, v * 4)
      if (p < points - 1) {
        index[k++] = v
        index[k++] = v + 1
      }
    }
  }
  return { t, seed: seeds, index, strandSeeds }
}

export type ParticleData = { seed: Float32Array; phase: Float32Array; speed: Float32Array }

/** Particles that travel along randomly chosen strands. */
export function buildParticles(count: number, strandSeeds: Float32Array, seed = 23): ParticleData {
  const rng = mulberry32(seed)
  const strands = strandSeeds.length / 4
  const out = new Float32Array(count * 4)
  const phase = new Float32Array(count)
  const speed = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    const s = Math.floor(rng() * strands)
    out.set(strandSeeds.subarray(s * 4, s * 4 + 4), i * 4)
    phase[i] = rng()
    speed[i] = 0.018 + rng() * 0.035
  }
  return { seed: out, phase, speed }
}

/** World-space x range the strands span, and where the loom mouth sits. Mirrored in the shader. */
export const LOOM = { x0: -15, x1: 18, mouth: 0, throat: 4.6 }

/**
 * How chaotic a strand is at world x (1 = fully tangled, 0 = woven into the bundle).
 * Mirrors `chaosEnvelope` in loom/shaders.ts; keep them in sync.
 */
export function chaosEnvelope(x: number): number {
  const edge0 = LOOM.mouth + 0.4
  const edge1 = LOOM.mouth - 9
  const s = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)))
  return Math.pow(s * s * (3 - 2 * s), 0.55)
}
