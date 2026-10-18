import { clamp, damp, mapRange } from './math'

describe('clamp', () => {
  it('limits to the default 0..1 range', () => {
    expect(clamp(-1)).toBe(0)
    expect(clamp(2)).toBe(1)
    expect(clamp(0.4)).toBe(0.4)
  })
})

describe('mapRange', () => {
  it('remaps and clamps', () => {
    expect(mapRange(50, 0, 100, 0, 10)).toBe(5)
    expect(mapRange(150, 0, 100, 0, 10)).toBe(10)
  })

  it('returns outMin for a zero-width input range', () => {
    expect(mapRange(5, 3, 3, 1, 2)).toBe(1)
  })
})

describe('damp', () => {
  it('moves toward the target without overshooting', () => {
    const next = damp(0, 10, 4, 1 / 60)
    expect(next).toBeGreaterThan(0)
    expect(next).toBeLessThan(10)
  })

  it('does not move when delta is zero', () => {
    expect(damp(3, 10, 4, 0)).toBe(3)
  })
})
