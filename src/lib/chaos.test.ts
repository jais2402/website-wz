import { describe, expect, it } from 'vitest'
import { cardRect, chaosScene, knotGate, nodeY, overlapsAny, pickOnThread, strandPoint } from './chaos'

const W = 1440
const H = 900
const scene = chaosScene(W, H)
const gate = knotGate(scene)

describe('chaosScene', () => {
  it('puts the knot right of centre and the dashboard after it, the line joining them', () => {
    expect(scene.knot.x).toBeGreaterThan(W * 0.6)
    expect(scene.app.x).toBeGreaterThan(scene.knot.x + scene.knot.r)
    expect(scene.app.x + scene.app.w).toBeLessThanOrEqual(W)
    expect(scene.link.to.x).toBe(scene.app.x)
    expect(scene.link.from.y).toBe(scene.link.to.y)
  })
  it('stacks them on phones: knot top right, dashboard below, above the middle', () => {
    const phone = chaosScene(390, 844)
    expect(phone.portrait).toBe(true)
    expect(phone.app.y).toBeGreaterThan(phone.knot.y + phone.knot.r)
    expect(phone.app.y).toBeLessThan(844 * 0.4)
    expect(phone.link.from.x).toBe(phone.link.to.x)
  })
  it('gathers the threads inside the knot', () => {
    expect(gate.top).toBeGreaterThan(scene.knot.y - scene.knot.r)
    expect(gate.bottom).toBeLessThan(scene.knot.y + scene.knot.r)
  })
})

describe('threads', () => {
  it('start off the left edge and arrive level at their own circle', () => {
    const start = strandPoint(3, 14, 0, 1.2, 1, W, H, gate)
    expect(start.x).toBeLessThan(0)
    const end = strandPoint(3, 14, 1, 1.2, 1, W, H, gate)
    expect(end.x).toBeCloseTo(gate.x)
    expect(end.y).toBeCloseTo(nodeY(3, 14, gate), 0)
  })
  it('enter the knot in order', () => {
    expect(nodeY(0, 14, gate)).toBe(gate.top)
    expect(nodeY(13, 14, gate)).toBe(gate.bottom)
    expect(nodeY(4, 14, gate)).toBeLessThan(nodeY(5, 14, gate))
  })
  it('stay inside the funnel: its full height at the left edge, narrowing into the knot', () => {
    for (let i = 0; i < 28; i++)
      for (let s = 0; s <= 40; s++) {
        const t = s / 40
        const p = strandPoint(i, 28, t, 3.7, 1, W, H, gate)
        expect(p.y).toBeGreaterThanOrEqual(gate.spanTop - 0.01)
        expect(p.y).toBeLessThanOrEqual(gate.spanBottom + 0.01)
      }
    expect(gate.spanTop).toBeGreaterThan(H * 0.1)
  })
  it('stop moving when chaos is 0', () => {
    expect(strandPoint(7, 14, 0.3, 0, 0, W, H, gate)).toEqual(strandPoint(7, 14, 0.3, 5, 0, W, H, gate))
  })
})

describe('pickOnThread', () => {
  let seed = 1
  const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
  const pointAt = (i: number, t: number) => strandPoint(i, 14, t, 2, 1, W, H, gate)
  const bounds = { x: 0, y: 0, w: W, h: H }
  const size = { w: 220, h: 44 }
  it('puts a card on a thread, clear of the copy panel', () => {
    const copy = { x: 100, y: 520, w: 600, h: 320 }
    for (let k = 0; k < 20; k++) {
      const spot = pickOnThread(rand, 14, size, pointAt, bounds, [copy], [])
      if (!spot) throw new Error('no spot')
      const c = pointAt(spot.i, spot.t)
      expect(overlapsAny(cardRect(c, size), [copy])).toBe(false)
      expect(spot.t).toBeGreaterThanOrEqual(0.15)
      expect(spot.t).toBeLessThanOrEqual(0.82)
    }
  })
  it('gives up rather than placing a card under the copy', () => {
    expect(pickOnThread(rand, 14, size, pointAt, bounds, [bounds], [])).toBeNull()
  })
})
