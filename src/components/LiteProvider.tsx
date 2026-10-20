import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { LiteContext } from '@/hooks/useLite'
import { applyTier, bootTier, rememberDemotion } from '@/lib/perfBoot'
import { type PerfTier, worseTier } from '@/lib/perfTier'

/**
 * Rendering tier for the whole page (see lib/perfTier.ts), decided by WebGL alone: the probe made before first
 * paint (lib/perfBoot.ts), and a demotion if the GPU drops the WebGL context mid-session (never back up).
 * `lite` is true for both cheaper tiers, so every component that swaps WebGL for its still keeps working;
 * `fallBack` demotes to lite.
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
