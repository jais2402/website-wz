import { buildParticles, buildStrands, chaosEnvelope, LOOM } from './loom'

describe('buildStrands', () => {
  const strands = 5
  const points = 8
  const d = buildStrands(strands, points)

  it('sizes every buffer for strands × points', () => {
    expect(d.t).toHaveLength(strands * points)
    expect(d.seed).toHaveLength(strands * points * 4)
    expect(d.strandSeeds).toHaveLength(strands * 4)
    expect(d.index).toHaveLength(strands * (points - 1) * 2)
  })

  it('runs t from 0 to 1 along each strand', () => {
    expect(d.t[0]).toBe(0)
    expect(d.t[points - 1]).toBe(1)
    expect(d.t[points]).toBe(0)
  })

  it('never connects the last point of one strand to the first of the next', () => {
    for (let i = 0; i < d.index.length; i += 2) {
      const a = d.index[i]
      const b = d.index[i + 1]
      expect(b).toBe(a + 1)
      expect(Math.floor(a / points)).toBe(Math.floor(b / points))
    }
  })

  it('gives every vertex of a strand the same seed', () => {
    const first = Array.from(d.seed.subarray(0, 4))
    const last = Array.from(d.seed.subarray((points - 1) * 4, points * 4))
    expect(last).toEqual(first)
  })
})

describe('buildParticles', () => {
  it('assigns each particle the seeds of an existing strand', () => {
    const { strandSeeds } = buildStrands(4, 3)
    const p = buildParticles(50, strandSeeds)
    const known = new Set(Array.from({ length: 4 }, (_, s) => strandSeeds[s * 4]))
    for (let i = 0; i < 50; i++) expect(known.has(p.seed[i * 4])).toBe(true)
    expect(p.phase.every((v) => v >= 0 && v < 1)).toBe(true)
    expect(p.speed.every((v) => v > 0)).toBe(true)
  })
})

describe('chaosEnvelope', () => {
  it('is fully tangled far left and fully woven at and after the loom mouth', () => {
    expect(chaosEnvelope(LOOM.x0)).toBe(1)
    expect(chaosEnvelope(LOOM.mouth + 1)).toBe(0)
    expect(chaosEnvelope(LOOM.x1)).toBe(0)
  })

  it('decreases monotonically toward the loom', () => {
    let prev = 2
    for (let x = LOOM.x0; x <= LOOM.mouth + 1; x += 0.25) {
      const v = chaosEnvelope(x)
      expect(v).toBeLessThanOrEqual(prev)
      prev = v
    }
  })
})
