import { describe, expect, it } from 'vitest'
import {
  helixCone,
  place,
  project,
  type Seed,
  sphereWrap,
  stageWeight,
  strandSeeds,
  threadColor,
  threadPos,
  VIEW_HEIGHT,
  weave,
} from './story2d'

const s: Seed = [0.3, 0.6, 0.4, 0.5]

describe('shapes', () => {
  it('weave keeps warp strands on a row and weft strands on a column', () => {
    expect(weave(0, [0.2, 0.5, 0, 0])[0]).toBeCloseTo(-2.1)
    expect(weave(1, [0.2, 0.5, 0, 0])[0]).toBeCloseTo(2.1)
    const a = weave(0, [0.8, 0.5, 0, 0])
    const b = weave(1, [0.8, 0.5, 0, 0])
    expect(a[0]).toBeCloseTo(b[0])
    expect(b[1] - a[1]).toBeCloseTo(2.5)
  })
  it('the cone widens as it rises', () => {
    const r = (t: number) => Math.hypot(helixCone(t, s)[0], helixCone(t, s)[2])
    expect(r(1)).toBeGreaterThan(r(0))
    expect(helixCone(0, s)[1]).toBe(-2)
  })
  it('sphere strands stay on the shell', () => {
    for (const t of [0, 0.3, 0.8]) expect(Math.hypot(...sphereWrap(t, s))).toBeCloseTo(1.9 + s[3] * 0.18)
  })
})

describe('threadPos', () => {
  it('lands exactly on each shape at whole stages', () => {
    expect(threadPos(0.4, s, 1, 0).p).toEqual(weave(0.4, s))
    expect(threadPos(0.4, s, 2, 0).p).toEqual(helixCone(0.4, s))
    expect(threadPos(0.4, s, 3, 5).loose).toBe(0)
    expect(threadPos(0.4, s, 0, 5).loose).toBe(1)
  })
  it('blends weights by triangle', () => {
    expect(stageWeight(1.25, 1)).toBeCloseTo(0.75)
    expect(stageWeight(1.25, 2)).toBeCloseTo(0.25)
    expect(stageWeight(1.25, 3)).toBe(0)
  })
})

describe('threadColor', () => {
  it('gives woven violet accents and stays within 0..1', () => {
    expect(threadColor([0, 0, 0.9, 0], 0)).toEqual([0.55, 0.48, 1])
    for (const c of threadColor(s, 0.5)) {
      expect(c).toBeGreaterThanOrEqual(0)
      expect(c).toBeLessThanOrEqual(1)
    }
  })
})

describe('place and project', () => {
  it('projects the origin to the centre and the view height to the screen edges', () => {
    expect(project([0, 0, 0], 800, 600)).toEqual({ x: 400, y: 300, depth: 7.5 })
    expect(project([0, VIEW_HEIGHT / 2, 0], 800, 600)!.y).toBeCloseTo(0)
    expect(project([0, 0, 8], 800, 600)).toBeNull()
  })
  it('rotates, scales and moves', () => {
    const p = place([1, 0, 0], 2, 0, Math.PI / 2, [0.5, 0, 0])
    expect(p[0]).toBeCloseTo(0.5)
    expect(p[2]).toBeCloseTo(-2)
  })
})

describe('strandSeeds', () => {
  it('is deterministic and in range', () => {
    const a = strandSeeds(20)
    expect(a).toEqual(strandSeeds(20))
    expect(a.flat().every((v) => v >= 0 && v < 1)).toBe(true)
  })
})
