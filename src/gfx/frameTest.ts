import { medianMs, sustainedSlow } from '@/lib/gfx'

/**
 * Median frame time (ms) over `frames` animation frames, after skipping the first `skip` (they still carry the
 * shader warm-up). Measured on the page's own frame loop, so it is the frame rate the visitor would get.
 */
export function measureFrames(frames = 30, skip = 5): Promise<number> {
  return new Promise((resolve) => {
    const samples: number[] = []
    let last = 0
    let seen = 0
    const tick = (t: number) => {
      if (last) {
        seen += 1
        if (seen > skip) samples.push(t - last)
      }
      last = t
      if (samples.length >= frames) resolve(medianMs(samples))
      else requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  })
}

/**
 * Watches the page's frame rate while a live scene is showing and calls `onSlow` once if it stays too slow
 * (sustainedSlow over one-second windows). The first `skipMs` are ignored (the scene's own warm-up). Returns a stop
 * function. A hidden tab pauses animation frames, so the gap when it comes back is dropped rather than counted.
 */
export function watchFrames(onSlow: () => void, { windowMs = 1000, skipMs = 1500 } = {}): () => void {
  let raf = 0
  let last = 0
  let start = 0
  let windowStart = 0
  let samples: number[] = []
  const medians: number[] = []
  const tick = (t: number) => {
    if (!start) start = windowStart = t
    const dt = last ? t - last : 0
    last = t
    if (t - start >= skipMs && dt > 0 && dt < 1000) samples.push(dt)
    if (t - windowStart >= windowMs) {
      if (samples.length) medians.push(medianMs(samples))
      samples = []
      windowStart = t
      if (sustainedSlow(medians)) {
        onSlow()
        return
      }
    }
    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)
  return () => cancelAnimationFrame(raf)
}
