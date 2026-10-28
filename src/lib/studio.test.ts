import { describe, expect, it } from 'vitest'
import { formatStudio, parseStudio, scaleCount, STUDIO_DEFAULTS, threadGain } from './studio'

describe('parseStudio', () => {
  it('is null without a value', () => {
    expect(parseStudio(null)).toBeNull()
    expect(parseStudio('')).toBeNull()
  })
  it('reads the keys it knows and keeps defaults for the rest', () => {
    expect(parseStudio('threads:0.5,speed:0.6,dpr:2,glow:1.5,cam:0.6')).toEqual({
      threads: 0.5,
      speed: 0.6,
      dpr: 2,
      glow: 1.5,
      cam: 0.6,
    })
    expect(parseStudio('speed:0.4')).toEqual({ ...STUDIO_DEFAULTS, speed: 0.4 })
  })
  it('clamps to the limits and ignores junk', () => {
    expect(parseStudio('threads:0,speed:9,dpr:0.1,glow:9,cam:2')).toEqual({
      threads: 0.1,
      speed: 2,
      dpr: 0.5,
      glow: 4,
      cam: 1,
    })
    expect(parseStudio('threads:abc,colour:3,speed:')).toEqual(STUDIO_DEFAULTS)
  })
})

describe('formatStudio', () => {
  it('round-trips through parseStudio', () => {
    const p = { threads: 0.4, speed: 0.7, dpr: 2, glow: 1.5, cam: 0.3 }
    expect(parseStudio(formatStudio(p))).toEqual(p)
    expect(formatStudio(STUDIO_DEFAULTS)).toBe('threads:1,speed:1')
  })
})

describe('threadGain', () => {
  it('is 1 without the studio or at the budget', () => {
    expect(threadGain(null, 0.9)).toBe(1)
    expect(threadGain(STUDIO_DEFAULTS, 0.9)).toBe(1)
  })
  it('makes up for a sharper pixel ratio, never dims for a softer one, and applies the glow', () => {
    expect(threadGain({ ...STUDIO_DEFAULTS, dpr: 2 }, 1)).toBe(2)
    expect(threadGain({ ...STUDIO_DEFAULTS, dpr: 0.5 }, 1)).toBe(1)
    expect(threadGain({ ...STUDIO_DEFAULTS, dpr: 2, glow: 1.5 }, 1)).toBe(3)
  })
})

describe('scaleCount', () => {
  it('scales and rounds, never to zero', () => {
    expect(scaleCount(800, 0.5)).toBe(400)
    expect(scaleCount(3, 0.1)).toBe(1)
  })
})
