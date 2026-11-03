// The "chaos to system" hero (loom/ChaosHero.tsx), drawn on a 2D canvas for machines that can't run the live loom.
// In the style of the Before/After section: on the left, slow tangled threads and the everyday problems; the threads
// all run into one glowing knot (a ball of thread), and out of it comes a single line into the "after" dashboard.
// Problem cards appear in the tangle and fade out in turn. Pure maths here: no DOM, no canvas.

export type Pt = { x: number; y: number }
export type Rect = { x: number; y: number; w: number; h: number }
/**
 * Where the threads arrive: at `x`, spread from `top` to `bottom` (the knot's mouth); `r` is the knot's radius. They
 * stay inside a funnel that is `spanTop`..`spanBottom` high at the left edge and narrows into the knot.
 */
export type Gate = { x: number; top: number; bottom: number; r: number; spanTop: number; spanBottom: number }

/**
 * The scene's layout. Landscape: the knot just right of the hero copy, the dashboard to its right, level with it,
 * the line running across. Phones: the knot top right, the dashboard under it (above the scroll copy card that sits
 * low on the screen), the line running down. `app`: the dashboard's top-left corner and width. `link`: the line.
 * `span`: how high the threads' funnel is at the left edge.
 */
export function chaosScene(w: number, h: number) {
  const portrait = h > w
  if (portrait) {
    const r = Math.min(26, Math.max(16, w * 0.05))
    const knot = { x: w * 0.78, y: h * 0.15, r }
    const app = { x: w * 0.07, y: h * 0.22, w: w * 0.86 }
    const span = { top: h * 0.08, bottom: h * 0.21 }
    return { portrait, knot, app, span, link: { from: { x: knot.x, y: knot.y + r }, to: { x: knot.x, y: app.y } } }
  }
  const r = Math.min(34, Math.max(20, h * 0.036))
  const knot = { x: w * 0.64, y: h * 0.52, r }
  const app = { x: w * 0.705, y: h * 0.52, w: Math.min(460, w * 0.27) }
  // Clear of the nav at the top and of the bottom of the screen.
  const span = { top: h * 0.14, bottom: h * 0.88 }
  return { portrait, knot, app, span, link: { from: { x: knot.x + r, y: knot.y }, to: { x: app.x, y: knot.y } } }
}

export type Scene = ReturnType<typeof chaosScene>

/** The threads' destination: they all converge on the knot's centre (a hair apart, so they keep their order). */
export function knotGate(scene: Scene): Gate {
  const { x, y, r } = scene.knot
  return { x, top: y - r * 0.06, bottom: y + r * 0.06, r, spanTop: scene.span.top, spanBottom: scene.span.bottom }
}

/** A stable pseudo-random number in [0, 1) for an integer seed (same thread, same shape on every frame). */
export function hash(n: number): number {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return s - Math.floor(s)
}

const smooth = (t: number) => t * t * (3 - 2 * t)

/** The height at which thread `i` of `n` enters the knot. */
export function nodeY(i: number, n: number, gate: Gate): number {
  return gate.top + (gate.bottom - gate.top) * (n > 1 ? i / (n - 1) : 0.5)
}

/**
 * A point on the tangled part of thread `i` (t 0 off the left edge, 1 in the knot). Long, slow waves
 * like the Before/After tangle. `time` in seconds moves them; `chaos` (0..1) scales how wild they are (scrolling
 * through the hero calms them). The waves die away into the knot, so the threads gather into it, and every point is
 * kept inside the funnel (eased in at its edges, so a thread brushing the edge bends along it rather than clipping).
 */
export function strandPoint(i: number, n: number, t: number, time: number, chaos: number, w: number, _h: number, gate: Gate): Pt {
  const a = hash(i)
  const b = hash(i + 101)
  const c = hash(i + 202)
  // The funnel at this point: full height at the left edge, narrowing into the knot's mouth.
  const k = smooth(t)
  const top = gate.spanTop + (gate.top - gate.spanTop) * k
  const bottom = gate.spanBottom + (gate.bottom - gate.spanBottom) * k
  const mid = (top + bottom) / 2
  const half = Math.max(0.5, (bottom - top) / 2)
  const half0 = (gate.spanBottom - gate.spanTop) / 2
  const startY = (gate.spanTop + gate.spanBottom) / 2 + (a * 2 - 1) * half0 * 0.85
  const endY = nodeY(i, n, gate)
  const fade = Math.pow(1 - t, 1.4)
  const amp = half0 * 0.6 * chaos * fade
  let y =
    startY +
    (endY - startY) * k +
    amp *
      (Math.sin(t * (2 + b * 2.5) + a * 6.28 + time * (0.12 + c * 0.18)) +
        0.35 * Math.sin(t * (4.5 + c * 3) + b * 6.28 - time * (0.2 + a * 0.2)))
  const x = -0.08 * w + (gate.x + 0.08 * w) * t
  return { x, y: mid + half * Math.tanh((y - mid) / half) }
}

const overlaps = (a: Rect, b: Rect, pad: number) =>
  a.x < b.x + b.w + pad && b.x < a.x + a.w + pad && a.y < b.y + b.h + pad && b.y < a.y + a.h + pad

/** A card's box, `size` centred on `p`. */
export function cardRect(p: Pt, size: { w: number; h: number }): Rect {
  return { x: p.x - size.w / 2, y: p.y - size.h / 2, w: size.w, h: size.h }
}

/** Whether a box overlaps any of `rects` (with a little room round it). */
export function overlapsAny(r: Rect, rects: Rect[], pad = 12): boolean {
  return rects.some((b) => overlaps(r, b, pad))
}

/**
 * Where a problem card should sit: on one of the `n` threads (`pointAt(i, t)` is thread i at t), between `tMin` and
 * `tMax` along it, inside `bounds`, clear of `blockers` (the hero copy, the nav, the dashboard) and of the cards
 * already showing (`others`). `rand` returns [0, 1). Null when none of 80 tries is clear: a card under the copy panel
 * shows through its glass as a smudge, so it waits instead.
 */
export function pickOnThread(
  rand: () => number,
  n: number,
  size: { w: number; h: number },
  pointAt: (i: number, t: number) => Pt,
  bounds: Rect,
  blockers: Rect[],
  others: Rect[],
  tMin = 0.15,
  tMax = 0.82,
): { i: number; t: number } | null {
  for (let k = 0; k < 80; k++) {
    const i = Math.floor(rand() * n)
    const t = tMin + rand() * (tMax - tMin)
    const r = cardRect(pointAt(i, t), size)
    const inside = r.x >= bounds.x && r.y >= bounds.y && r.x + r.w <= bounds.x + bounds.w && r.y + r.h <= bounds.y + bounds.h
    if (inside && !overlapsAny(r, blockers) && !overlapsAny(r, others, 18)) return { i, t }
  }
  return null
}
