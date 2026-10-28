import { describe, expect, it } from 'vitest'
import { allowsLive, classifyTier, coverPoint, flowPoint, flyScale, zoomInset, medianMs, parseMode, sustainedSlow } from './gfx'

const gpu = (renderer: string, caveat = true) => ({ context: true, caveat, renderer })

describe('parseMode', () => {
  it('accepts the three modes only', () => {
    expect(parseMode('live')).toBe('live')
    expect(parseMode('poster')).toBe('poster')
    expect(parseMode('auto')).toBe('auto')
    expect(parseMode('lite')).toBeNull()
    expect(parseMode(null)).toBeNull()
  })
})

describe('classifyTier', () => {
  it('is none without a context', () => {
    expect(classifyTier({ context: false, caveat: false, renderer: '' })).toBe('none')
  })
  it('treats software renderers as software', () => {
    expect(classifyTier(gpu('ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero)), SwiftShader driver)'))).toBe(
      'software',
    )
    expect(classifyTier(gpu('ANGLE (Microsoft, Microsoft Basic Render Driver Direct3D11 vs_5_0 ps_5_0)'))).toBe(
      'software',
    )
    expect(classifyTier(gpu('llvmpipe (LLVM 15.0.7, 256 bits)'))).toBe('software')
  })
  it('treats a failed performance-caveat check as software', () => {
    expect(classifyTier(gpu('ANGLE (NVIDIA, NVIDIA GeForce RTX 3060)', false))).toBe('software')
  })
  it('splits integrated and dedicated GPUs', () => {
    expect(classifyTier(gpu('ANGLE (Intel, Intel(R) UHD Graphics 620 Direct3D11)'))).toBe('low')
    expect(classifyTier(gpu('ANGLE (Apple, ANGLE Metal Renderer: Apple M2, Unspecified Version)'))).toBe('low')
    expect(classifyTier(gpu('ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Direct3D11)'))).toBe('high')
  })
  it('remembers a GPU that failed the frame test', () => {
    const r = 'ANGLE (Intel, Intel(R) UHD Graphics 620 Direct3D11)'
    expect(classifyTier(gpu(r), r)).toBe('software')
    expect(classifyTier(gpu(r), 'some other GPU')).toBe('low')
  })
})

describe('allowsLive', () => {
  it('auto: real GPUs only', () => {
    expect(allowsLive('auto', 'high')).toBe(true)
    expect(allowsLive('auto', 'low')).toBe(true)
    expect(allowsLive('auto', 'software')).toBe(false)
    expect(allowsLive('auto', 'none')).toBe(false)
  })
  it('live forces it whenever a context exists; poster never loads it', () => {
    expect(allowsLive('live', 'software')).toBe(true)
    expect(allowsLive('live', 'none')).toBe(false)
    expect(allowsLive('poster', 'high')).toBe(false)
  })
})

describe('medianMs', () => {
  it('takes the middle value, or the mean of the middle two', () => {
    expect(medianMs([])).toBe(0)
    expect(medianMs([40, 10, 20])).toBe(20)
    expect(medianMs([10, 20, 30, 100])).toBe(25)
  })
})

describe('sustainedSlow', () => {
  it('needs every one of the last windows to be slow', () => {
    expect(sustainedSlow([60])).toBe(false)
    expect(sustainedSlow([60, 70])).toBe(true)
    expect(sustainedSlow([60, 16, 70])).toBe(false)
    expect(sustainedSlow([16, 16, 45, 50])).toBe(true)
    expect(sustainedSlow([40, 40])).toBe(false)
  })
})

describe('flowPoint', () => {
  const start = { x: 0, y: 100 }
  const mouth = { x: 1000, y: 300 }
  it('runs from the start to the mouth', () => {
    expect(flowPoint(start, mouth, 0)).toEqual(start)
    expect(flowPoint(start, mouth, 1)).toEqual(mouth)
  })
  it('moves forward all the way and funnels late', () => {
    let x = -1
    for (let t = 0; t <= 1; t += 0.05) {
      const p = flowPoint(start, mouth, t)
      expect(p.x).toBeGreaterThan(x)
      x = p.x
    }
    // Halfway along in time, still much nearer the start's height than the mouth's.
    expect(flowPoint(start, mouth, 0.5).y).toBeLessThan(200)
  })
  it('clamps t', () => {
    expect(flowPoint(start, mouth, -1)).toEqual(start)
    expect(flowPoint(start, mouth, 2)).toEqual(mouth)
  })
})

describe('flyScale', () => {
  it('starts at 1 and ends at the camera distance ratio', () => {
    expect(flyScale(0, false)).toBe(1)
    expect(flyScale(1, false)).toBeCloseTo(14 / 7.5)
    expect(flyScale(1, true)).toBeCloseTo(24 / 13)
  })
  it('clamps progress and grows faster near the end', () => {
    expect(flyScale(2, false)).toBe(flyScale(1, false))
    expect(flyScale(-1, false)).toBe(1)
    expect(flyScale(1, false) - flyScale(0.5, false)).toBeGreaterThan(flyScale(0.5, false) - 1)
  })
})

describe('coverPoint', () => {
  it('maps image fractions through a centred cover fit', () => {
    // A 2:1 image covering a square box is drawn 400x200, centred: 100 px cut off each side.
    expect(coverPoint({ x: 0.5, y: 0.5 }, { width: 200, height: 100 }, { width: 200, height: 200 })).toEqual({
      x: 100,
      y: 100,
    })
    expect(coverPoint({ x: 0, y: 0 }, { width: 200, height: 100 }, { width: 200, height: 200 })).toEqual({
      x: -100,
      y: 0,
    })
  })
})

describe('zoomInset', () => {
  const box = { width: 200, height: 200 }
  const image = { width: 200, height: 100 }
  it('at scale 1 crops exactly what cover would', () => {
    expect(zoomInset({ x: 100, y: 100 }, 1, box, image)).toEqual({ top: 0, right: 50, bottom: 0, left: 50 })
  })
  it('zooms around the origin, keeping it in place', () => {
    // Twice the zoom around the box centre: the middle quarter of the cover crop (100x100 image px -> 50x50).
    expect(zoomInset({ x: 100, y: 100 }, 2, box, image)).toEqual({ top: 25, right: 75, bottom: 25, left: 75 })
    // Around the top-left corner: the crop shrinks towards that corner.
    expect(zoomInset({ x: 0, y: 0 }, 2, box, image)).toEqual({ top: 0, right: 100, bottom: 50, left: 50 })
  })
})
