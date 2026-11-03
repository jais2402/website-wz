// The "chaos to system" hero (loom/ChaosHero.tsx), drawn on a 2D canvas for machines that can't run the live loom.
// In the style of the Before/After section: on the left, slow tangled threads and the everyday problems; the threads
// all run into one glowing knot (a ball of thread), and out of it comes a single line into the "after" dashboard.
// Problem cards drift into the knot and vanish. Pure maths here: no DOM, no canvas.

export type Pt = { x: number; y: number }
export type Rect = { x: number; y: number; w: number; h: number }
/** Where the threads arrive: at `x`, spread from `top` to `bottom` (the knot's mouth). `r`: the knot's radius. */
export type Gate = { x: number; top: number; bottom: number; r: number }

/**
 * The scene's layout. Landscape: the knot just right of the hero copy, the dashboard to its right, level with it,
 * the line running across. Phones: the knot top right, the dashboard under it (above the scroll copy card that sits
 * low on the screen), the line running down. `app`: the dashboard's top-left corner and width. `link`: the line.
 */
export function chaosScene(w: number, h: number) {
  const portrait = h > w
  if (portrait) {
    const r = Math.min(26, Math.max(16, w * 0.05))
    const knot = { x: w * 0.78, y: h * 0.15, r }
    const app = { x: w * 0.07, y: h * 0.22, w: w * 0.86 }
    return { portrait, knot, app, link: { from: { x: knot.x, y: knot.y + r }, to: { x: knot.x, y: app.y } } }
  }
  const r = Math.min(34, Math.max(20, h * 0.036))
  const knot = { x: w * 0.64, y: h * 0.52, r }
  const app = { x: w * 0.705, y: h * 0.52, w: Math.min(460, w * 0.27) }
  return { portrait, knot, app, link: { from: { x: knot.x + r, y: knot.y }, to: { x: app.x, y: knot.y } } }
}

export type Scene = ReturnType<typeof chaosScene>

/** The threads' destination: the knot's mouth, a little narrower than the knot. */
export function knotGate(scene: Scene): Gate {
  const { x, y, r } = scene.knot
  return { x, top: y - r * 0.45, bottom: y + r * 0.45, r }
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
 * through the hero calms them). The waves die away into the knot, so the threads gather into it.
 */
export function strandPoint(i: number, n: number, t: number, time: number, chaos: number, w: number, h: number, gate: Gate): Pt {
  const a = hash(i)
  const b = hash(i + 101)
  const c = hash(i + 202)
  const startY = (a * 1.4 - 0.2) * h
  const endY = nodeY(i, n, gate)
  const fade = Math.pow(1 - t, 1.4)
  const amp = h * 0.24 * chaos * fade
  const y =
    startY +
    (endY - startY) * smooth(t) +
    amp *
      (Math.sin(t * (2 + b * 2.5) + a * 6.28 + time * (0.12 + c * 0.18)) +
        0.35 * Math.sin(t * (4.5 + c * 3) + b * 6.28 - time * (0.2 + a * 0.2)))
  const x = -0.08 * w + (gate.x + 0.08 * w) * t
  return { x, y }
}

/** Share of a card's life spent floating where it appeared before the knot pulls it in. */
export const CARD_HOLD = 0.45

export type CardPose = { x: number; y: number; rot: number; scale: number; alpha: number }

/**
 * A problem card at life `t` (0..1): fades in where it appeared (`from`, its centre) and bobs, then is pulled into
 * the knot (`to`) faster and faster, straightening, shrinking and fading as it goes in.
 */
export function cardPose(t: number, from: Pt, to: Pt, rot0: number, seed = 0): CardPose {
  const bob = Math.sin(t * 9 + seed * 6.28) * 4
  if (t < CARD_HOLD) {
    const alpha = smooth(Math.min(1, t / 0.1))
    return { x: from.x, y: from.y + bob, rot: rot0, scale: 0.92 + 0.08 * alpha, alpha }
  }
  const u = Math.min(1, (t - CARD_HOLD) / (1 - CARD_HOLD))
  const e = u * u * u
  // A slight arc rather than a straight line: it swings towards the knot's height first.
  const cx = from.x + (to.x - from.x) * 0.35
  const cy = to.y + (from.y - to.y) * 0.25
  const k = 1 - e
  const x = k * k * from.x + 2 * k * e * cx + e * e * to.x
  const y = k * k * (from.y + bob) + 2 * k * e * cy + e * e * to.y
  return { x, y, rot: rot0 * (1 - e), scale: 1 - 0.82 * e, alpha: 1 - smooth(Math.max(0, (u - 0.78) / 0.22)) }
}

const overlaps = (a: Rect, b: Rect, pad: number) =>
  a.x < b.x + b.w + pad && b.x < a.x + a.w + pad && a.y < b.y + b.h + pad && b.y < a.y + a.h + pad

/**
 * Where a card of size `size` should appear (its centre): in the tangle left of the knot, clear of `blockers` (the
 * hero copy, the nav, the dashboard) and of the cards already showing (`others`, their rects). `rand` returns [0, 1). Null when
 * none of 80 tries is clear: a card under the copy panel shows through its glass as a smudge, so it waits instead.
 */
export function pickSpawn(
  rand: () => number,
  w: number,
  h: number,
  size: { w: number; h: number },
  gate: Gate,
  blockers: Rect[],
  others: Rect[],
): Pt | null {
  const minX = w * 0.03
  const maxX = Math.max(minX, gate.x - gate.r - 30 - size.w)
  const minY = h * 0.1
  const maxY = Math.max(minY, h * 0.95 - size.h)
  for (let k = 0; k < 80; k++) {
    const r: Rect = { x: minX + rand() * (maxX - minX), y: minY + rand() * (maxY - minY), w: size.w, h: size.h }
    if (!blockers.some((b) => overlaps(r, b, 12)) && !others.some((o) => overlaps(r, o, 18)))
      return { x: r.x + size.w / 2, y: r.y + size.h / 2 }
  }
  return null
}
