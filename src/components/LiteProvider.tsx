import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { LiteContext } from '@/hooks/useLite'
import { applyTier, bootTier, rememberDemotion, tierForced } from '@/lib/perfBoot'
import { median, type PerfTier, watchdogStart, watchdogStep, worseTier } from '@/lib/perfTier'

/**
 * Rendering tier for the whole page (see lib/perfTier.ts). Starts from the GPU probe made before first paint
 * (lib/perfBoot.ts), then a frame-rate watchdog can demote it mid-session: full → lite → static, never back up.
 * `lite` stays true for both cheaper tiers, so every component that already swaps WebGL for static art keeps
 * working; `fallBack` demotes to lite (e.g. when the GPU drops the WebGL context).
 */
export function LiteProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ tier: PerfTier; reason: string }>(() => ({
    tier: bootTier.tier,
    reason: bootTier.reason,
  }))

  const demote = useCallback((tier: PerfTier, reason: string) => {
    setState((s) => (worseTier(s.tier, tier) === s.tier ? s : { tier, reason }))
  }, [])
  const fallBack = useCallback((reason: string) => demote('lite', reason), [demote])

  useEffect(() => {
    applyTier(state.tier)
    if (state.tier !== bootTier.tier) rememberDemotion(state.tier)
    if (state.tier !== 'full') console.info(`[wezigns] ${state.tier} rendering: ${state.reason}`)
    window.dispatchEvent(new CustomEvent('wz:perf', { detail: state.tier }))
  }, [state])

  useFrameWatchdog(state.tier, demote)

  const value = useMemo(
    () => ({ lite: state.tier !== 'full', reason: state.reason, tier: state.tier, fallBack, demote }),
    [state, fallBack, demote],
  )
  return (
    <LiteContext.Provider value={value}>
      {children}
      {import.meta.env.DEV && <PerfHud tier={state.tier} />}
    </LiteContext.Provider>
  )
}

/**
 * Samples frame deltas in ~1 s windows once the page has loaded (the first second of a cold load says nothing).
 * Pauses while the tab is hidden; stops on static, or after ten calm windows on a tier. Skipped when forced.
 */
function useFrameWatchdog(tier: PerfTier, demote: (tier: PerfTier, reason: string) => void) {
  const state = useRef(watchdogStart(tier))
  useEffect(() => {
    if (tierForced) return
    state.current = watchdogStart(tier)
    if (state.current.done) return
    let raf = 0
    let last = 0
    let windowStart = 0
    let deltas: number[] = []
    const tick = (t: number) => {
      if (document.hidden) {
        last = 0
        deltas = []
      } else {
        if (last) deltas.push(t - last)
        last = t
        if (!windowStart) windowStart = t
        if (t - windowStart >= 1000) {
          const m = median(deltas)
          const next = watchdogStep(state.current, m)
          if (next.tier !== state.current.tier) demote(next.tier, `slow frame rate (median ${Math.round(m)} ms)`)
          state.current = next
          windowStart = t
          deltas = []
          if (next.done || next.tier !== tier) return
        }
      }
      raf = requestAnimationFrame(tick)
    }
    const begin = () => (raf = requestAnimationFrame(tick))
    const timer = window.setTimeout(() => {
      if (document.readyState === 'complete') begin()
      else window.addEventListener('load', begin, { once: true })
    }, 1500)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('load', begin)
      cancelAnimationFrame(raf)
    }
  }, [tier, demote])
}

/** Dev builds only: active tier, live fps and the detected renderer, bottom-left. */
function PerfHud({ tier }: { tier: PerfTier }) {
  const [fps, setFps] = useState(0)
  useEffect(() => {
    let raf = 0
    let n = 0
    let t0 = performance.now()
    const f = (t: number) => {
      n++
      if (t - t0 >= 500) {
        setFps(Math.round((n * 1000) / (t - t0)))
        n = 0
        t0 = t
      }
      raf = requestAnimationFrame(f)
    }
    raf = requestAnimationFrame(f)
    return () => cancelAnimationFrame(raf)
  }, [])
  return (
    <div
      style={{
        position: 'fixed',
        left: 8,
        bottom: 8,
        zIndex: 9999,
        padding: '6px 8px',
        font: '11px/1.4 ui-monospace, monospace',
        color: '#fff',
        background: 'rgba(0,0,0,0.8)',
        borderRadius: 6,
        pointerEvents: 'none',
        maxWidth: 320,
      }}
    >
      perf-{tier} · {fps} fps
      <br />
      {bootTier.renderer.slice(0, 60)}
    </div>
  )
}
