// The guide light: one glow that travels between anchors as you scroll. Pure maths, no DOM.

/** Scroll range (in page px) during which the light rests on an anchor. a === b for a single resting point. */
export type Span = { a: number; b: number }

export type Segment = { from: number; to: number; t: number }

const smooth = (t: number) => t * t * (3 - 2 * t)

/**
 * Which anchor(s) the light sits between at scroll position `s`. Rests on anchor i while s is inside spans[i],
 * glides (eased) from i to i+1 between them, and stays on the first / last anchor outside the whole range.
 */
export function guideSegment(s: number, spans: Span[]): Segment {
  if (spans.length === 0 || s <= spans[0].b) return { from: 0, to: 0, t: 0 }
  for (let i = 0; i < spans.length - 1; i++) {
    const cur = spans[i]
    const next = spans[i + 1]
    if (s <= cur.b) return { from: i, to: i, t: 0 }
    if (s < next.a) {
      const gap = next.a - cur.b
      return { from: i, to: i + 1, t: gap > 0 ? smooth((s - cur.b) / gap) : 1 }
    }
  }
  return { from: spans.length - 1, to: spans.length - 1, t: 0 }
}

/** Light size while travelling: full at rest, shrinks to `min` halfway between anchors. */
export function travelScale(seg: Segment, min = 0.7): number {
  if (seg.from === seg.to) return 1
  return min + (1 - min) * Math.abs(1 - 2 * seg.t)
}
