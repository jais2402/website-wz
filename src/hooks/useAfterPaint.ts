import { startTransition, useEffect, useState } from 'react'

/**
 * False on the first render, true once the page has painted (and, with `idle`, once the main thread is idle or
 * `timeoutMs` has passed).
 *
 * Inner pages use it (idle) to start the three.js download only after the headline is on screen, so the 260 kB WebGL
 * chunk never competes with the first paint for bandwidth or main-thread time; the loom fades in when ready either
 * way. The home page uses it without idle to build what sits under the preloader in a second pass, right after the
 * hero's first paint.
 */
export function useAfterPaint({ idle = true, timeoutMs = 1200 }: { idle?: boolean; timeoutMs?: number } = {}): boolean {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    let handle = 0
    let timer = 0
    // rAF fires just before the next paint; the timeout queued from it runs after that paint.
    const raf = requestAnimationFrame(() => {
      timer = window.setTimeout(() => {
        // A transition, so React builds whatever this unlocks in small slices instead of one long task.
        const go = () => startTransition(() => setReady(true))
        if (idle && 'requestIdleCallback' in window) handle = window.requestIdleCallback(go, { timeout: timeoutMs })
        else go()
      }, 0)
    })
    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(timer)
      if (handle) window.cancelIdleCallback(handle)
    }
  }, [idle, timeoutMs])
  return ready
}
