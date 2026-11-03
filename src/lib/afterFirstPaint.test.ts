import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { afterFirstPaint, preloadListedModules } from './afterFirstPaint'

describe('afterFirstPaint', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  it('starts once the first largest-contentful-paint entry is reported, once', async () => {
    let report: () => void = () => {}
    const disconnect = vi.fn()
    class FakeObserver {
      static supportedEntryTypes = ['largest-contentful-paint']
      constructor(cb: () => void) {
        report = cb
      }
      observe() {}
      disconnect = disconnect
    }
    vi.stubGlobal('PerformanceObserver', FakeObserver)
    const start = vi.fn()
    afterFirstPaint(start)
    await vi.advanceTimersByTimeAsync(50)
    expect(start).not.toHaveBeenCalled()
    report()
    expect(disconnect).toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(0)
    expect(start).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(5000)
    expect(start).toHaveBeenCalledTimes(1)
  })

  it('waits two frames where the entry type is not supported', async () => {
    vi.stubGlobal('PerformanceObserver', undefined)
    let frames: FrameRequestCallback[] = []
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => frames.push(cb))
    const frame = async () => {
      const pending = frames
      frames = []
      pending.forEach((cb) => cb(0))
      await vi.advanceTimersByTimeAsync(0)
    }
    const start = vi.fn()
    afterFirstPaint(start)
    await frame()
    expect(start).not.toHaveBeenCalled()
    await frame()
    expect(start).toHaveBeenCalledTimes(1)
  })

  it('starts after the fallback when nothing is reported (background tab)', async () => {
    vi.stubGlobal('PerformanceObserver', undefined)
    vi.stubGlobal('requestAnimationFrame', () => 1)
    const start = vi.fn()
    afterFirstPaint(start, 100)
    await vi.advanceTimersByTimeAsync(99)
    expect(start).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(1)
    expect(start).toHaveBeenCalledTimes(1)
  })

  it('preloads the modules listed on <body>', () => {
    document.body.dataset.modulepreload = '/assets/a.js /assets/b.js'
    preloadListedModules()
    const links = [...document.head.querySelectorAll<HTMLLinkElement>('link[rel="modulepreload"]')]
    expect(links.map((l) => l.getAttribute('href'))).toEqual(['/assets/a.js', '/assets/b.js'])
    links.forEach((l) => l.remove())
    delete document.body.dataset.modulepreload
  })
})
