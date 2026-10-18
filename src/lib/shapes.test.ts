import { buildStages, latLonToVec3, mulberry32, STAGE_COUNT, stageWeights } from './shapes'

describe('mulberry32', () => {
  it('is deterministic and stays in [0, 1)', () => {
    const a = mulberry32(1)
    const b = mulberry32(1)
    for (let i = 0; i < 100; i++) {
      const v = a()
      expect(v).toBe(b())
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })
})

describe('buildStages', () => {
  const stages = buildStages(500)

  it('builds one buffer per stage with count * 3 finite floats', () => {
    expect(stages).toHaveLength(STAGE_COUNT)
    for (const s of stages) {
      expect(s).toHaveLength(1500)
      expect(s.every(Number.isFinite)).toBe(true)
    }
  })

  it('keeps every shape within a sane bounding box for the camera', () => {
    for (const s of stages) {
      for (const v of s) expect(Math.abs(v)).toBeLessThan(8)
    }
  })
})

describe('stageWeights', () => {
  it('sums to 1 across the range', () => {
    for (const p of [0, 0.3, 1, 2.5, 3.99, 4]) {
      const sum = stageWeights(p).reduce((a, b) => a + b, 0)
      expect(sum).toBeCloseTo(1)
    }
  })

  it('is fully on one stage at integer progress and clamps outside', () => {
    expect(stageWeights(2)).toEqual([0, 0, 1, 0, 0])
    expect(stageWeights(-3)).toEqual([1, 0, 0, 0, 0])
    expect(stageWeights(99)).toEqual([0, 0, 0, 0, 1])
  })
})

describe('latLonToVec3', () => {
  it('puts the north pole on +Y', () => {
    const [x, y, z] = latLonToVec3(90, 0, 2)
    expect(y).toBeCloseTo(2)
    expect(Math.hypot(x, z)).toBeCloseTo(0)
  })
})
