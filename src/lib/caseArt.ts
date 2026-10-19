// Our Work card motif: a few tangled threads pulled into a knot, leaving as clean parallel lines.
// Seeded so each card's tangle is different but stable between visits. Coordinates are in a 300×96 viewBox.

import { mulberry32 } from './shapes'

export const ART_W = 300
export const ART_H = 96
export const KNOT = { x: 196, y: 48 }

const r = (n: number) => Math.round(n * 10) / 10

/** The tangled threads coming in from the left, each ending at the knot. */
export function tangleThreads(seed: number, count = 6): string[] {
  const rand = mulberry32(seed * 977 + 13)
  return Array.from({ length: count }, () => {
    const y0 = 8 + rand() * (ART_H - 16)
    const c1 = { x: 30 + rand() * 60, y: rand() * ART_H }
    const c2 = { x: 110 + rand() * 50, y: rand() * ART_H }
    return `M0 ${r(y0)} C${r(c1.x)} ${r(c1.y)} ${r(c2.x)} ${r(c2.y)} ${KNOT.x} ${KNOT.y}`
  })
}

/** The ordered threads leaving the knot to the right. */
export function orderedThreads(count = 3, gap = 7): string[] {
  const top = KNOT.y - ((count - 1) * gap) / 2
  return Array.from({ length: count }, (_, i) => {
    const y = top + i * gap
    return `M${KNOT.x} ${KNOT.y} C${KNOT.x + 30} ${KNOT.y} ${KNOT.x + 34} ${r(y)} ${KNOT.x + 64} ${r(y)} L${ART_W} ${r(y)}`
  })
}

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
