import { decideLite } from './lite'

const fast = { webgl: true, effectiveType: '4g', downlinkMbps: 10, deviceMemoryGb: 8, cores: 8 }

describe('decideLite', () => {
  it('serves the full site on a capable device and network', () => {
    expect(decideLite(fast).lite).toBe(false)
  })

  it('falls back only when WebGL is unavailable', () => {
    expect(decideLite({ ...fast, webgl: false })).toEqual({ lite: true, reason: 'WebGL unavailable' })
  })

  it('keeps the full site on slow-network, data-saver and low-end hints', () => {
    for (const s of [
      { ...fast, saveData: true },
      { ...fast, effectiveType: 'slow-2g' },
      { ...fast, downlinkMbps: 0.8 },
      { ...fast, effectiveType: '3g', downlinkMbps: 1.35 },
      { ...fast, deviceMemoryGb: 2 },
      { ...fast, cores: 2 },
      { webgl: true },
    ])
      expect(decideLite(s).lite).toBe(false)
  })

  it('honours the ?lite override in both directions', () => {
    expect(decideLite({ ...fast, override: 'lite' }).lite).toBe(true)
    expect(decideLite({ ...fast, webgl: false, override: 'full' }).lite).toBe(false)
  })
})
