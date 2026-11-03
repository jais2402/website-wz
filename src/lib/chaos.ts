// The "chaos to system" hero (loom/ChaosHero.tsx), drawn on a 2D canvas for machines that can't run the live loom.
// Tangled threads run in from the left and are pulled through a glowing ring; out of it they come as one ordered
// band. Problem cards appear in the tangle, drift into the ring and vanish. Pure maths here: no DOM, no canvas.

export type Pt = { x: number; y: number }
export type Rect = { x: number; y: number; w: number; h: number }
export type Ring = { x: number; y: number; r: number }

/** Where the ring sits: right of centre, where the hero copy leaves room (landscape) or right of the panel (phones). */
export function chaosRing(w: number, h: number): Ring {
  const portrait = h > w
  return portrait
    ? // Phones: above the middle, clear of the scroll copy card that sits low on the screen.
      { x: w * 0.76, y: h * 0.36, r: Math.min(70, Math.max(34, w * 0.13)) }
    : { x: w * 0.8, y: h * 0.5, r: Math.min(120, Math.max(46, Math.min(w, h) * 0.15)) }
}

/** A stable pseudo-random number in [0, 1) for an integer seed (same strand, same shape on every frame). */
export function hash(n: number): number {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return s - Math.floor(s)
}

const smooth = (t: number) => t * t * (3 - 2 * t)

/** How far strand `i` of `n` enters the ring from its centre, and leaves it in the ordered band (px, signed). */
export function strandOffset(i: number, n: number, ring: Ring): number {
  return (n > 1 ? i / (n - 1) - 0.5 : 0) * ring.r * 1.3
}

/**
 * A point on the tangled part of strand `i` (t 0 at the left edge, 1 in the ring's mouth). `time` in seconds moves
 * the tangle; `chaos` (0..1) scales how wild it is (scrolling through the hero calms it).
 */
export function strandPoint(i: number, n: number, t: number, time: number, chaos: number, w: number, h: number, ring: Ring): Pt {
  const a = hash(i)
  const b = hash(i + 101)
  const c = hash(i + 202)
  const startY = (a * 1.3 - 0.15) * h
  const endY = ring.y + strandOffset(i, n, ring)
  // The wobble dies away towards the ring: the closer to the mouth, the more orderly.
  const fade = Math.pow(1 - t, 1.3)
  const amp = h * 0.16 * chaos * fade
  const y =
    startY +
    (endY - startY) * smooth(t) +
    amp * (Math.sin(t * (5 + b * 7) + a * 6.28 + time * (0.35 + c * 0.4)) + 0.6 * Math.sin(t * (11 + c * 9) + b * 6.28 - time * (0.5 + a * 0.5)))
  const x = -0.06 * w + (ring.x + 0.06 * w) * t + w * 0.05 * chaos * fade * Math.sin(t * (4 + c * 5) + c * 6.28 + time * 0.3)
  return { x, y }
}

/** The ordered band: strand `i` at `x` (from the ring to the right edge), narrowing slightly like the loom's cone. */
export function bandY(i: number, n: number, x: number, w: number, ring: Ring): number {
  const u = Math.min(1, Math.max(0, (x - ring.x) / Math.max(1, w - ring.x)))
  return ring.y + strandOffset(i, n, ring) * (1 - 0.35 * u)
}

/** Share of a card's life spent floating where it appeared before the ring pulls it in. */
export const CARD_HOLD = 0.45

export type CardPose = { x: number; y: number; rot: number; scale: number; alpha: number }

/**
 * A problem card at life `t` (0..1): fades in where it appeared (`from`, its centre) and bobs, then is pulled into
 * the ring's mouth (`to`) faster and faster, straightening, shrinking and fading as it goes in.
 */
export function cardPose(t: number, from: Pt, to: Pt, rot0: number, seed = 0): CardPose {
  const bob = Math.sin(t * 9 + seed * 6.28) * 4
  if (t < CARD_HOLD) {
    const alpha = smooth(Math.min(1, t / 0.1))
    return { x: from.x, y: from.y + bob, rot: rot0, scale: 0.92 + 0.08 * alpha, alpha }
  }
  const u = Math.min(1, (t - CARD_HOLD) / (1 - CARD_HOLD))
  const e = u * u * u
  // A slight arc rather than a straight line: it swings towards the ring's height first.
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
 * Where a card of size `size` should appear (its centre): in the tangle left of the ring, clear of `blockers` (the
 * hero copy, the nav) and of the cards already showing (`others`, their rects). `rand` returns [0, 1). The least
 * crowded of up to 80 tries; when nowhere is clear it still returns a spot.
 */
export function pickSpawn(
  rand: () => number,
  w: number,
  h: number,
  size: { w: number; h: number },
  ring: Ring,
  blockers: Rect[],
  others: Rect[],
): Pt {
  const minX = w * 0.03
  const maxX = Math.max(minX, ring.x - ring.r * 0.3 - size.w)
  const minY = h * 0.1
  const maxY = Math.max(minY, h * 0.95 - size.h)
  let best: Pt = { x: minX + size.w / 2, y: minY + size.h / 2 }
  let bestHits = Infinity
  for (let k = 0; k < 80; k++) {
    const r: Rect = { x: minX + rand() * (maxX - minX), y: minY + rand() * (maxY - minY), w: size.w, h: size.h }
    const hits = blockers.filter((b) => overlaps(r, b, 12)).length * 2 + others.filter((o) => overlaps(r, o, 18)).length
    if (hits < bestHits) {
      bestHits = hits
      best = { x: r.x + size.w / 2, y: r.y + size.h / 2 }
      if (hits === 0) break
    }
  }
  return best
}
