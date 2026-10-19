// Portfolio hero weave geometry (the case cards now use a module window, CaseArt.tsx).

import { mulberry32 } from './shapes'

const r = (n: number) => Math.round(n * 10) / 10

// Portfolio hero (pages/portfolio/PortfolioWeave.tsx): one tangled thread per case, all pulled through one knot and
// leaving as ordered lines, each ending in that case's own knot. Coordinates are in a WEAVE_W × WEAVE_H viewBox.

export const WEAVE_W = 560
export const WEAVE_H = 460
export const WEAVE_KNOT = { x: 268, y: 230 }
/** x where the ordered lines end (each case's knot); labels sit to the right of it. */
export const WEAVE_END_X = 424

export type WeaveThread = {
  /** Loose end at the left edge, then a tangle into the shared knot. */
  tangle: string
  /** From the shared knot to this case's knot. */
  out: string
  start: { x: number; y: number }
  end: { x: number; y: number }
}

/** One thread per seed, top to bottom. Seeded, so the tangle is stable between visits. */
export function weaveThreads(seeds: readonly number[]): WeaveThread[] {
  const n = seeds.length
  const k = WEAVE_KNOT
  const step = (span: number) => (n > 1 ? span / (n - 1) : 0)
  return seeds.map((seed, i) => {
    const rand = mulberry32(seed * 7919 + 101)
    const start = { x: 6, y: r(36 + i * step(WEAVE_H - 72) + (rand() - 0.5) * 18) }
    // A waypoint somewhere in the left half, so the threads cross each other on the way in.
    const via = { x: r(70 + rand() * 110), y: r(40 + rand() * (WEAVE_H - 80)) }
    const c1 = { x: r(30 + rand() * 50), y: r(start.y + (rand() - 0.5) * 160) }
    const c2 = { x: r(via.x - 30 - rand() * 30), y: r(via.y + (rand() - 0.5) * 140) }
    const c3 = { x: r(via.x + 30 + rand() * 40), y: r(via.y + (rand() - 0.5) * 160) }
    const c4 = { x: r(k.x - 40 - rand() * 30), y: r(k.y + (rand() - 0.5) * 90) }
    const tangle =
      `M${start.x} ${start.y} C${c1.x} ${c1.y} ${c2.x} ${c2.y} ${via.x} ${via.y}` +
      ` C${c3.x} ${c3.y} ${c4.x} ${c4.y} ${k.x} ${k.y}`
    const end = { x: WEAVE_END_X, y: r(70 + i * step(WEAVE_H - 140)) }
    const out = `M${k.x} ${k.y} C${k.x + 56} ${k.y} ${k.x + 70} ${end.y} ${k.x + 120} ${end.y} L${end.x} ${end.y}`
    return { tangle, out, start, end }
  })
}
