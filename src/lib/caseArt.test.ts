import { WEAVE_END_X, WEAVE_H, WEAVE_KNOT, WEAVE_W, weaveThreads } from './caseArt'

describe('portfolio hero weave', () => {
  const seeds = [1, 2, 3, 4, 5, 6, 7, 8, 9]

  it('draws one stable thread per case, every tangle ending at the shared knot', () => {
    const w = weaveThreads(seeds)
    expect(w).toHaveLength(9)
    expect(weaveThreads(seeds)).toEqual(w)
    for (const t of w) {
      expect(t.tangle.endsWith(`${WEAVE_KNOT.x} ${WEAVE_KNOT.y}`)).toBe(true)
      expect(t.out.startsWith(`M${WEAVE_KNOT.x} ${WEAVE_KNOT.y}`)).toBe(true)
      expect(t.out.endsWith(`L${WEAVE_END_X} ${t.end.y}`)).toBe(true)
    }
  })

  it('leaves the knot as ordered lines, top to bottom, inside the viewBox', () => {
    const ends = weaveThreads(seeds).map((t) => t.end.y)
    expect([...ends].sort((a, b) => a - b)).toEqual(ends)
    expect(new Set(ends).size).toBe(ends.length)
    for (const t of weaveThreads(seeds)) {
      expect(t.end.y).toBeGreaterThan(0)
      expect(t.end.y).toBeLessThan(WEAVE_H)
      expect(t.start.y).toBeGreaterThan(0)
      expect(t.start.y).toBeLessThan(WEAVE_H)
      expect(t.end.x).toBeLessThan(WEAVE_W)
    }
  })
})
