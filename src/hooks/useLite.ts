import { createContext, useContext, useEffect } from 'react'
import { averageFps } from '@/lib/lite'

export type LiteState = { lite: boolean; reason: string; fallBack: (reason: string) => void }

export const LiteContext = createContext<LiteState>({ lite: false, reason: '', fallBack: () => {} })

export const useLite = () => useContext(LiteContext)

/**
 * Samples the frame rate for a few seconds once the 3D is on screen. If it averages under `minFps`, falls back to
 * lite mode. Runs once; skipped when already lite, when forced with ?lite=0, or while the tab is hidden.
 */
export function useFpsWatchdog(enabled: boolean, minFps = 28, sampleMs = 4000, delayMs = 1500) {
  const { lite, fallBack } = useLite()
  useEffect(() => {
    if (!enabled || lite || new URLSearchParams(location.search).get('lite') === '0') return
    let raf = 0
    let start = 0
    const stamps: number[] = []
    const tick = (t: number) => {
      if (document.hidden) {
        stamps.length = 0
        start = 0
      } else {
        if (!start) start = t
        stamps.push(t)
        if (t - start >= sampleMs) {
          const fps = averageFps(stamps)
          if (fps > 0 && fps < minFps) fallBack(`low frame rate (${Math.round(fps)} fps)`)
          return
        }
      }
      raf = requestAnimationFrame(tick)
    }
    const timer = setTimeout(() => (raf = requestAnimationFrame(tick)), delayMs)
    return () => {
      clearTimeout(timer)
      cancelAnimationFrame(raf)
    }
  }, [enabled, lite, fallBack, minFps, sampleMs, delayMs])
}
