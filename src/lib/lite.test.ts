import { averageFps, decideLite } from './lite'

const fast = { webgl: true, effectiveType: '4g', downlinkMbps: 10, deviceMemoryGb: 8, cores: 8 }

describe('decideLite', () => {
  it('serves the full site on a capable device and network', () => {
    expect(decideLite(fast).lite).toBe(false)
  })

  it('falls back when WebGL is unavailable', () => {
    expect(decideLite({ ...fast, webgl: false })).toEqual({ lite: true, reason: 'WebGL unavailable' })
  })

  it('falls back on slow or data-saving connections', () => {
    expect(decideLite({ ...fast, saveData: true }).lite).toBe(true)
    expect(decideLite({ ...fast, effectiveType: 'slow-2g' }).lite).toBe(true)
    expect(decideLite({ ...fast, downlinkMbps: 0.8 }).lite).toBe(true)
  })

  it('does not downgrade on a 3G estimate alone, only with a measured slow downlink', () => {
    expect(decideLite({ ...fast, effectiveType: '3g' }).lite).toBe(false)
    expect(decideLite({ ...fast, effectiveType: '3g', downlinkMbps: 1.2 }).lite).toBe(true)
  })

  it('falls back on low-end hardware', () => {
    expect(decideLite({ ...fast, deviceMemoryGb: 2 }).lite).toBe(true)
    expect(decideLite({ ...fast, cores: 2 }).lite).toBe(true)
  })

  it('ignores signals the browser does not provide', () => {
    expect(decideLite({ webgl: true }).lite).toBe(false)
  })

  it('honours the ?lite override in both directions', () => {
    expect(decideLite({ ...fast, override: 'lite' }).lite).toBe(true)
    expect(decideLite({ ...fast, webgl: false, override: 'full' }).lite).toBe(false)
  })
})

describe('averageFps', () => {
  it('computes frames per second from timestamps', () => {
    const ts = Array.from({ length: 61 }, (_, i) => i * (1000 / 60))
    expect(averageFps(ts)).toBeCloseTo(60)
  })

  it('returns 0 for too few frames', () => {
    expect(averageFps([0])).toBe(0)
  })
})
