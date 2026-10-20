import { decideTier, parseOverride, worseTier } from './perfTier'

const desktop = { desktop: true }

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
