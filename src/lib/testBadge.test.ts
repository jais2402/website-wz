import { describe, expect, it } from 'vitest'
import { badgeChoice, heroView, shortRenderer } from './testBadge'

const prod = { dev: false, vercelEnv: 'production' }

describe('badgeChoice', () => {
  it('shows in dev and on preview builds, not on production', () => {
    expect(badgeChoice({ dev: true, vercelEnv: '' }, '', null).show).toBe(true)
    expect(badgeChoice({ dev: false, vercelEnv: 'preview' }, '', null).show).toBe(true)
    expect(badgeChoice(prod, '', null).show).toBe(false)
    expect(badgeChoice({ dev: false, vercelEnv: '' }, '', null).show).toBe(false)
  })
  it('lets the URL turn it on or off for the tab', () => {
    expect(badgeChoice(prod, '?badge=1', null)).toEqual({ show: true, store: '1' })
    expect(badgeChoice(prod, '', '1')).toEqual({ show: true, store: null })
    expect(badgeChoice({ dev: true, vercelEnv: '' }, '?badge=0', null)).toEqual({ show: false, store: '0' })
  })
})

describe('heroView', () => {
  it('names what the hero shows', () => {
    expect(heroView({ onScreen: true, live3d: true, videoPlaying: false })).toBe('3D')
    expect(heroView({ onScreen: true, live3d: false, videoPlaying: true })).toBe('Video')
    expect(heroView({ onScreen: true, live3d: false, videoPlaying: false })).toBe('Still')
    expect(heroView({ onScreen: false, live3d: true, videoPlaying: false })).toBe('Off screen')
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
