// SVG path for the Our Work thread: a loose tangle at `start`, then strung through each knot, sagging between them.

export type Pt = { x: number; y: number }

const r = (n: number) => Math.round(n * 10) / 10

/**
 * `start` is where the loose end sits (beside the intro); `knots` are the card tops it is strung through, in order.
 * `sag` is how far the thread dips between two knots (negative arcs it upward).
 */
export function threadPath(start: Pt, knots: Pt[], sag = 26): string {
  if (!knots.length) return ''
  const { x, y } = start
  // Two loose loops before it heads off to the first card: the "tangle" the work untangles.
  let d = `M${r(x)} ${r(y)}`
  d += ` C${r(x + 40)} ${r(y - 46)} ${r(x + 92)} ${r(y + 30)} ${r(x + 52)} ${r(y + 24)}`
  d += ` C${r(x + 14)} ${r(y + 18)} ${r(x + 58)} ${r(y - 40)} ${r(x + 110)} ${r(y - 8)}`
  let prev = { x: x + 110, y: y - 8 }
  for (const k of knots) {
    const mid = (prev.x + k.x) / 2
    d += ` C${r(mid)} ${r(prev.y + sag)} ${r(mid)} ${r(k.y + sag)} ${r(k.x)} ${r(k.y)}`
    prev = k
  }
  return d
}
