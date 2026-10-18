import { guideSegment, travelScale } from './guide'

const spans = [
  { a: 0, b: 1000 }, // pinned hero
  { a: 1500, b: 1500 }, // single point
  { a: 2500, b: 4000 }, // pinned story
]

describe('guideSegment', () => {
  it('rests on the first anchor before and during its span', () => {
    expect(guideSegment(-50, spans)).toEqual({ from: 0, to: 0, t: 0 })
    expect(guideSegment(800, spans)).toEqual({ from: 0, to: 0, t: 0 })
  })

  it('glides between anchors with eased progress', () => {
    const mid = guideSegment(1250, spans)
    expect(mid.from).toBe(0)
    expect(mid.to).toBe(1)
    expect(mid.t).toBeCloseTo(0.5)
    expect(guideSegment(1100, spans).t).toBeLessThan(0.2) // eased: slow start
  })

  it('rests on a pinned anchor through its whole span and on the last one after it', () => {
    expect(guideSegment(3000, spans)).toEqual({ from: 2, to: 2, t: 0 })
    expect(guideSegment(9000, spans)).toEqual({ from: 2, to: 2, t: 0 })
  })

  it('handles no anchors', () => {
    expect(guideSegment(100, [])).toEqual({ from: 0, to: 0, t: 0 })
  })
})

describe('travelScale', () => {
  it('is full size at rest and smallest halfway', () => {
    expect(travelScale({ from: 1, to: 1, t: 0 })).toBe(1)
    expect(travelScale({ from: 0, to: 1, t: 0.5 }, 0.7)).toBeCloseTo(0.7)
    expect(travelScale({ from: 0, to: 1, t: 0 }, 0.7)).toBeCloseTo(1)
  })
})
