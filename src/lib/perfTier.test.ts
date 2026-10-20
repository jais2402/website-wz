import { decideTier, median, parseOverride, watchdogStart, watchdogStep, worseTier } from './perfTier'

const desktop = { desktop: true, cores: 16, deviceMemoryGb: 8 }

describe('decideTier', () => {
  it('serves the full site on a real GPU', () => {
    expect(
      decideTier({ context: true, debugInfo: true, renderer: 'ANGLE (Apple, ANGLE Metal Renderer: Apple M4)' }, desktop)
        .tier,
    ).toBe('full')
    expect(
      decideTier(
        { context: true, debugInfo: true, renderer: 'ANGLE (Intel, Intel(R) UHD Graphics 620 Direct3D11)' },
        desktop,
      ).tier,
    ).toBe('full')
  })

  it.each([
    'ANGLE (Microsoft, Microsoft Basic Render Driver (0x0000008C) Direct3D11 vs_5_0 ps_5_0, D3D11)',
    'ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (LLVM 10.0.0)), SwiftShader driver)',
    'llvmpipe (LLVM 15.0.7, 256 bits)',
    'Mesa OffScreen',
    'Google SwiftShader',
  ])('serves lite on a software renderer: %s', (renderer) => {
    expect(decideTier({ context: true, debugInfo: true, renderer }, desktop).tier).toBe('lite')
  })

  it('is static without WebGL and lite when a desktop GPU cannot be identified', () => {
    expect(decideTier({ context: false, debugInfo: false }, desktop).tier).toBe('static')
    expect(decideTier({ context: true, debugInfo: false }, desktop).tier).toBe('lite')
    expect(decideTier({ context: true, debugInfo: false }, { desktop: false }).tier).toBe('full')
  })

  it('lets low memory or CPU demote, but a high core count never promotes a software renderer', () => {
    expect(
      decideTier({ context: true, debugInfo: true, renderer: 'Apple GPU' }, { ...desktop, deviceMemoryGb: 2 }).tier,
    ).toBe('lite')
    expect(decideTier({ context: true, debugInfo: true, renderer: 'Apple GPU' }, { ...desktop, cores: 2 }).tier).toBe(
      'lite',
    )
    expect(
      decideTier(
        { context: true, debugInfo: true, renderer: 'Microsoft Basic Render Driver' },
        { desktop: true, cores: 64, deviceMemoryGb: 64 },
      ).tier,
    ).toBe('lite')
  })
})

describe('overrides and ordering', () => {
  it('reads ?perf= and the older ?lite=', () => {
    expect(parseOverride('?perf=static')).toBe('static')
    expect(parseOverride('?perf=full')).toBe('full')
    expect(parseOverride('?lite=1')).toBe('lite')
    expect(parseOverride('?lite=0')).toBe('full')
    expect(parseOverride('?perf=fast')).toBeUndefined()
  })

  it('only ever picks the cheaper tier', () => {
    expect(worseTier('full', 'lite')).toBe('lite')
    expect(worseTier('static', 'lite')).toBe('static')
    expect(worseTier('full', 'full')).toBe('full')
  })
})

describe('frame-rate watchdog', () => {
  const feed = (tier: 'full' | 'lite', ms: number[]) => ms.reduce(watchdogStep, watchdogStart(tier))

  it('demotes full to lite after two slow windows in a row, not one', () => {
    expect(feed('full', [30, 16, 30]).tier).toBe('full')
    expect(feed('full', [30, 30]).tier).toBe('lite')
  })

  it('demotes lite to static only when it stays over 40 ms', () => {
    expect(feed('full', [30, 30, 30, 30]).tier).toBe('lite')
    expect(feed('full', [30, 30, 45, 45]).tier).toBe('static')
    expect(feed('full', [30, 30, 45, 45]).done).toBe(true)
  })

  it('stops after ten calm windows and never promotes', () => {
    const calm = feed('full', Array(10).fill(16))
    expect(calm.done).toBe(true)
    expect(watchdogStep(calm, 200).tier).toBe('full')
  })

  it('takes the median of frame deltas', () => {
    expect(median([16, 17, 100])).toBe(17)
    expect(median([10, 20])).toBe(15)
    expect(median([])).toBe(0)
  })
})
