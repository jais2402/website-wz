// Rendering tiers. One class on <html> (perf-full | perf-lite | perf-static) switches the expensive work off in CSS:
//   full   : everything (WebGL, frosted glass, ambient animation, Lenis)
//   lite   : no WebGL, no backdrop blur (solid surfaces), short one-shot animations, native scroll
//   static : lite plus no animation or transition at all
// Decided once before first paint from WebGL alone (client decision): no WebGL context means static; a software
// rasteriser (Windows' "Microsoft Basic Render Driver", SwiftShader, llvmpipe) or an unidentifiable desktop GPU means
// lite. A WebGL context lost mid-session also demotes. Device hints and frame rate are not used. Never promoted back.

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

export type DeviceSignals = { desktop: boolean }

/** Tier from WebGL only: whether a context exists and which renderer it reports. */
export function decideTier(gpu: GpuProbe, device: DeviceSignals): TierDecision {
  if (!gpu.context) return { tier: 'static', reason: 'no WebGL context' }
  if (gpu.renderer && SOFTWARE_RENDERER.test(gpu.renderer))
    return { tier: 'lite', reason: `software renderer: ${gpu.renderer}` }
  if (!gpu.debugInfo && device.desktop) return { tier: 'lite', reason: 'GPU not identifiable' }
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
