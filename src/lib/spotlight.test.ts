import { describe, expect, it } from 'vitest'
import { spotVars, TILT_X, TILT_Y } from './spotlight'

const rect = { left: 100, top: 50, width: 200, height: 100 }

describe('spotVars', () => {
  it('centres the light and levels the card at the middle', () => {
    expect(spotVars(200, 100, rect)).toEqual({ '--mx': '50%', '--my': '50%', '--rx': '0deg', '--ry': '0deg' })
  })

  it('tilts toward the pointer at the corners, up to the max', () => {
    const v = spotVars(300, 50, rect)
    expect(v['--mx']).toBe('100%')
    expect(v['--my']).toBe('0%')
    expect(v['--rx']).toBe(`${TILT_X}deg`)
    expect(v['--ry']).toBe(`${TILT_Y}deg`)
  })

  it('clamps a pointer outside the card', () => {
    const v = spotVars(-500, 9999, rect)
    expect(v['--mx']).toBe('0%')
    expect(v['--my']).toBe('100%')
    expect(v['--rx']).toBe(`${-TILT_X}deg`)
  })

  it('survives an empty rect', () => {
    expect(spotVars(0, 0, { left: 0, top: 0, width: 0, height: 0 })['--mx']).toBe('50%')
  })
})
