import { describe, expect, it } from 'vitest'
import { bandY, CARD_HOLD, cardPose, chaosRing, pickSpawn, strandOffset, strandPoint } from './chaos'

const W = 1440
const H = 900
const ring = chaosRing(W, H)

describe('chaosRing', () => {
  it('sits right of centre, smaller on phones', () => {
    expect(ring.x).toBeGreaterThan(W * 0.6)
    const phone = chaosRing(390, 844)
    expect(phone.x).toBeGreaterThan(390 * 0.6)
    expect(phone.r).toBeLessThan(ring.r)
  })
})

describe('strands', () => {
  it('start off the left edge and end in the ring mouth, at their band offset', () => {
    const start = strandPoint(3, 20, 0, 1.2, 1, W, H, ring)
    expect(start.x).toBeLessThan(0)
    const end = strandPoint(3, 20, 1, 1.2, 1, W, H, ring)
    expect(end.x).toBeCloseTo(ring.x)
    expect(end.y).toBeCloseTo(ring.y + strandOffset(3, 20, ring))
    expect(Math.abs(strandOffset(3, 20, ring))).toBeLessThan(ring.r)
  })
  it('come out of the ring where they went in, and stay in order', () => {
    expect(bandY(5, 20, ring.x, W, ring)).toBeCloseTo(ring.y + strandOffset(5, 20, ring))
    expect(bandY(4, 20, W, W, ring)).toBeLessThan(bandY(5, 20, W, W, ring))
  })
  it('calm down when chaos is 0', () => {
    const a = strandPoint(7, 20, 0.3, 0, 0, W, H, ring)
    const b = strandPoint(7, 20, 0.3, 5, 0, W, H, ring)
    expect(a).toEqual(b)
  })
})

describe('cardPose', () => {
  const from = { x: 300, y: 200 }
  const to = { x: ring.x, y: ring.y }
  it('fades in where it appeared, tilted', () => {
    expect(cardPose(0, from, to, 0.1).alpha).toBe(0)
    const p = cardPose(CARD_HOLD * 0.8, from, to, 0.1)
    expect(p.alpha).toBe(1)
    expect(p.x).toBe(from.x)
    expect(p.rot).toBe(0.1)
  })
  it('ends in the ring, straight, small and gone', () => {
    const p = cardPose(1, from, to, 0.1)
    expect(p.x).toBeCloseTo(to.x)
    expect(p.y).toBeCloseTo(to.y)
    expect(p.rot).toBeCloseTo(0)
    expect(p.scale).toBeLessThan(0.3)
    expect(p.alpha).toBeCloseTo(0)
  })
})

describe('pickSpawn', () => {
  it('keeps clear of the hero copy and of other cards when there is room', () => {
    let s = 1
    const rand = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646
    const copy = { x: 100, y: 200, w: 760, h: 600 }
    const size = { w: 220, h: 44 }
    for (let k = 0; k < 20; k++) {
      const c = pickSpawn(rand, W, H, size, ring, [copy], [])
      const r = { x: c.x - size.w / 2, y: c.y - size.h / 2 }
      const hit = r.x < copy.x + copy.w && copy.x < r.x + size.w && r.y < copy.y + copy.h && copy.y < r.y + size.h
      expect(hit).toBe(false)
      expect(c.x + size.w / 2).toBeLessThan(ring.x)
    }
  })
})
