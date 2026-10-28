import { afterEach, describe, expect, it, vi } from 'vitest'
import { watchFrames } from './frameTest'

// Drives requestAnimationFrame by hand: each step() runs the pending callback at `t + dt`.
function fakeFrames() {
  let cb: FrameRequestCallback | null = null
  let t = 0
  vi.stubGlobal('requestAnimationFrame', (f: FrameRequestCallback) => ((cb = f), 1))
  vi.stubGlobal('cancelAnimationFrame', () => (cb = null))
  return (dt: number, n: number) => {
    for (let i = 0; i < n && cb; i++) {
      t += dt
      const f = cb
      cb = null
      f(t)
    }
  }
}

afterEach(() => vi.unstubAllGlobals())

describe('watchFrames', () => {
  it('reports a scene that stays under ~25 fps, once', () => {
    const step = fakeFrames()
    const slow = vi.fn()
    watchFrames(slow)
    step(80, 100)
    expect(slow).toHaveBeenCalledTimes(1)
  })
  it('leaves a smooth scene alone, and stops when asked', () => {
    const step = fakeFrames()
    const slow = vi.fn()
    const stop = watchFrames(slow)
    step(16, 600)
    expect(slow).not.toHaveBeenCalled()
    stop()
    step(80, 100)
    expect(slow).not.toHaveBeenCalled()
  })
})
