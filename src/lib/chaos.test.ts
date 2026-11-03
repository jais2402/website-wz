import { describe, expect, it } from 'vitest'
import { CARD_HOLD, cardPose, chaosGate, nearestThread, nodeY, pickSpawn, strandPoint } from './chaos'

const W = 1440
const H = 900
const gate = chaosGate(W, H)

describe('chaosGate', () => {
  it('sits right of centre, higher on phones', () => {
    expect(gate.x).toBeGreaterThan(W * 0.6)
    const phone = chaosGate(390, 844)
    expect(phone.x).toBeGreaterThan(390 * 0.6)
    expect(phone.bottom).toBeLessThan(844 * 0.6)
  })
})

describe('threads', () => {
  it('start off the left edge and arrive level at their own circle', () => {
    const start = strandPoint(3, 14, 0, 1.2, 1, W, H, gate)
    expect(start.x).toBeLessThan(0)
    const end = strandPoint(3, 14, 1, 1.2, 1, W, H, gate)
    expect(end.x).toBeCloseTo(gate.x)
    expect(end.y).toBeCloseTo(nodeY(3, 14, gate))
  })
  it('come out of the gate evenly spaced, in order', () => {
    expect(nodeY(0, 14, gate)).toBe(gate.top)
    expect(nodeY(13, 14, gate)).toBe(gate.bottom)
    expect(nodeY(4, 14, gate)).toBeLessThan(nodeY(5, 14, gate))
  })
  it('stop moving when chaos is 0', () => {
    expect(strandPoint(7, 14, 0.3, 0, 0, W, H, gate)).toEqual(strandPoint(7, 14, 0.3, 5, 0, W, H, gate))
  })
  it('a card is pulled into the circle nearest its height', () => {
    expect(nearestThread(gate.top - 100, 14, gate)).toBe(0)
    expect(nearestThread(gate.bottom + 100, 14, gate)).toBe(13)
    expect(nearestThread(nodeY(6, 14, gate) + 2, 14, gate)).toBe(6)
  })
})

describe('cardPose', () => {
  const from = { x: 300, y: 200 }
  const to = { x: gate.x, y: nodeY(2, 14, gate) }
  it('fades in where it appeared, tilted', () => {
    expect(cardPose(0, from, to, 0.1).alpha).toBe(0)
    const p = cardPose(CARD_HOLD * 0.8, from, to, 0.1)
    expect(p.alpha).toBe(1)
    expect(p.x).toBe(from.x)
    expect(p.rot).toBe(0.1)
  })
  it('ends in its circle, straight, small and gone', () => {
    const p = cardPose(1, from, to, 0.1)
    expect(p.x).toBeCloseTo(to.x)
    expect(p.y).toBeCloseTo(to.y)
    expect(p.rot).toBeCloseTo(0)
    expect(p.scale).toBeLessThan(0.3)
    expect(p.alpha).toBeCloseTo(0)
  })
})

describe('pickSpawn', () => {
  it('keeps clear of the hero copy when there is room, left of the gate', () => {
    let s = 1
    const rand = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646
    const copy = { x: 100, y: 200, w: 760, h: 600 }
    const size = { w: 220, h: 44 }
    for (let k = 0; k < 20; k++) {
      const c = pickSpawn(rand, W, H, size, gate, [copy], [])
      if (!c) throw new Error('no spot')
      const r = { x: c.x - size.w / 2, y: c.y - size.h / 2 }
      const hit = r.x < copy.x + copy.w && copy.x < r.x + size.w && r.y < copy.y + copy.h && copy.y < r.y + size.h
      expect(hit).toBe(false)
      expect(c.x + size.w / 2).toBeLessThan(gate.x)
    }
  })
  it('gives up rather than placing a card under the copy', () => {
    const all = { x: 0, y: 0, w: W, h: H }
    expect(pickSpawn(Math.random, W, H, { w: 220, h: 44 }, gate, [all], [])).toBeNull()
  })
})
