import { describe, expect, it } from 'vitest'
import { damp, pointerOffset, tiltAngles } from './tilt'

const box = { left: 100, top: 50, width: 200, height: 100 }

describe('pointerOffset', () => {
  it('is 0,0 at the centre and ±1 at the edges', () => {
    expect(pointerOffset(200, 100, box)).toEqual({ x: 0, y: 0 })
    expect(pointerOffset(100, 50, box)).toEqual({ x: -1, y: -1 })
    expect(pointerOffset(300, 150, box)).toEqual({ x: 1, y: 1 })
  })

  it('clamps outside the box and survives an empty box', () => {
    expect(pointerOffset(900, -400, box)).toEqual({ x: 1, y: -1 })
    const empty = pointerOffset(10, 10, { left: 10, top: 10, width: 0, height: 0 })
    expect(empty.x).toBeGreaterThanOrEqual(-1)
    expect(empty.x).toBeLessThanOrEqual(1)
  })
})

describe('tiltAngles', () => {
  it('turns the card toward the pointer', () => {
    expect(tiltAngles({ x: 1, y: 0 }, 10)).toEqual({ rx: 0, ry: 10 })
    expect(tiltAngles({ x: 0, y: 1 }, 10)).toEqual({ rx: -10, ry: 0 })
    expect(tiltAngles({ x: 0, y: 0 }, 10)).toEqual({ rx: 0, ry: 0 })
  })
})

describe('damp', () => {
  it('moves toward the target without overshooting', () => {
    const v = damp(0, 10, 5, 1 / 60)
    expect(v).toBeGreaterThan(0)
    expect(v).toBeLessThan(10)
  })

  it('stays put with no time passed and arrives after a long time', () => {
    expect(damp(3, 10, 5, 0)).toBe(3)
    expect(damp(3, 10, 5, 100)).toBeCloseTo(10)
  })
})
