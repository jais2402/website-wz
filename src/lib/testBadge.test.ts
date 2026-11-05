import { describe, expect, it } from 'vitest'
import { badgeChoice, heroView, shortRenderer } from './testBadge'

describe('badgeChoice', () => {
  it('shows only when the address asks with ?badge=1', () => {
    expect(badgeChoice('?badge=1')).toBe(true)
    expect(badgeChoice('?gfx=poster&badge=1')).toBe(true)
    expect(badgeChoice('')).toBe(false)
    expect(badgeChoice('?badge=0')).toBe(false)
    expect(badgeChoice('?gfx=poster')).toBe(false)
  })
})

describe('heroView', () => {
  it('names what the hero shows', () => {
    expect(heroView({ onScreen: true, live3d: true, videoPlaying: false })).toBe('3D')
    expect(heroView({ onScreen: true, live3d: false, videoPlaying: true })).toBe('Video')
    expect(heroView({ onScreen: true, live3d: false, videoPlaying: false })).toBe('Still')
    expect(heroView({ onScreen: false, live3d: true, videoPlaying: false })).toBe('Off screen')
    expect(heroView({ onScreen: true, live3d: false, videoPlaying: false, chaos: true })).toBe('2D chaos')
    expect(heroView({ onScreen: true, live3d: false, videoPlaying: true, videoLight: true })).toBe('Video H.264')
  })
})

describe('shortRenderer', () => {
  it('keeps just the GPU name', () => {
    expect(shortRenderer('ANGLE (Apple, ANGLE Metal Renderer: Apple M4, Unspecified Version)')).toBe('Apple M4')
    expect(shortRenderer('ANGLE (Intel, Intel(R) UHD Graphics 620 Direct3D11 vs_5_0 ps_5_0, D3D11)')).toBe(
      'Intel(R) UHD Graphics 620',
    )
    expect(shortRenderer('Mali-G78')).toBe('Mali-G78')
    expect(shortRenderer('')).toBe('unknown')
  })
})
