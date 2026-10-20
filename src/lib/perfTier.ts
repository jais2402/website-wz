// Rendering tiers. One class on <html> (perf-full | perf-lite | perf-static) switches the expensive work off in CSS:
//   full   : everything (WebGL, frosted glass, ambient animation, Lenis)
//   lite   : no WebGL, no backdrop blur (solid surfaces), short one-shot animations, native scroll
//   static : lite plus no animation or transition at all
// Decided once before first paint from a GPU probe (a software rasteriser such as Windows' "Microsoft Basic Render
// Driver" or SwiftShader means lite), and demoted during the session by a frame-rate watchdog. Never promoted back.

export type PerfTier = 'full' | 'lite' | 'static'
export type TierDecision = { tier: PerfTier; reason: string }

const RANK: Record<PerfTier, number> = { full: 0, lite: 1, static: 2 }

/** The cheaper of two tiers (demotion only). */
export const worseTier = (a: PerfTier, b: PerfTier): PerfTier => (RANK[a] >= RANK[b] ? a : b)

/** Renderer strings of CPU rasterisers: every blur and composite would run on the CPU. */
export const SOFTWARE_RENDERER =
  /swiftshader|basic render|llvmpipe|software|mesa offscreen|microsoft basic|generic render|softpipe|warp/i

export type GpuProbe = {
  /** A WebGL context could be created. */
  context: boolean
  /** UNMASKED_RENDERER_WEBGL, when WEBGL_debug_renderer_info is available. */
  renderer?: string
  /** WEBGL_debug_renderer_info was available. */
  debugInfo: boolean
}

export type DeviceSignals = { deviceMemoryGb?: number; cores?: number; desktop: boolean }

/** Tier from the GPU probe (highest priority) and device hints (which can only demote, never promote). */
export function decideTier(gpu: GpuProbe, device: DeviceSignals): TierDecision {
  if (!gpu.context) return { tier: 'static', reason: 'no WebGL context' }
  if (gpu.renderer && SOFTWARE_RENDERER.test(gpu.renderer))
    return { tier: 'lite', reason: `software renderer: ${gpu.renderer}` }
  if (!gpu.debugInfo && device.desktop) return { tier: 'lite', reason: 'GPU not identifiable' }
  if (device.deviceMemoryGb !== undefined && device.deviceMemoryGb <= 2)
    return { tier: 'lite', reason: `low memory (${device.deviceMemoryGb} GB)` }
  if (device.cores !== undefined && device.cores <= 2)
    return { tier: 'lite', reason: `low CPU (${device.cores} cores)` }
  return { tier: 'full', reason: gpu.renderer ? `GPU: ${gpu.renderer}` : 'GPU' }
}

/** ?perf=full|lite|static (also accepts the older ?lite=1 / ?lite=0). */
export function parseOverride(search: string): PerfTier | undefined {
  const q = new URLSearchParams(search)
  const p = q.get('perf')
  if (p === 'full' || p === 'lite' || p === 'static') return p
  const l = q.get('lite')
  if (l === '1') return 'lite'
  if (l === '0') return 'full'
  return undefined
}

// ---- Frame-rate watchdog -------------------------------------------------------------------------------------

export type WatchdogState = { tier: PerfTier; slow: number; windows: number; done: boolean }

export const watchdogStart = (tier: PerfTier): WatchdogState => ({ tier, slow: 0, windows: 0, done: tier === 'static' })

/**
 * Feeds one ~1 s window's median frame time. Two slow windows in a row (median over 22 ms) demote full to lite;
 * two more over 40 ms demote lite to static. Stops after ten calm windows on a tier, or on static.
 */
export function watchdogStep(s: WatchdogState, medianMs: number): WatchdogState {
  if (s.done) return s
  const limit = s.tier === 'full' ? 22 : 40
  const slow = medianMs > limit ? s.slow + 1 : 0
  if (slow >= 2) {
    const tier: PerfTier = s.tier === 'full' ? 'lite' : 'static'
    return { tier, slow: 0, windows: 0, done: tier === 'static' }
  }
  const windows = s.windows + 1
  return { tier: s.tier, slow, windows, done: windows >= 10 }
}

/** Median of a list of frame deltas (ms). */
export function median(values: number[]): number {
  if (!values.length) return 0
  const s = [...values].sort((a, b) => a - b)
  const m = s.length >> 1
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}
