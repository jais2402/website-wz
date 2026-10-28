import { medianMs } from '@/lib/gfx'

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
