// Runs once, synchronously, when an entry script is imported, before React renders: probes the GPU, picks the
// tier and puts perf-<tier> on <html> so CSS switches the expensive work off from the very first paint.
import { decideTier, type GpuProbe, parseOverride, type PerfTier, type TierDecision, worseTier } from './perfTier'

const KEY = 'wz-perf'

function store(): Storage | null {
  try {
    return window.sessionStorage
  } catch {
    return null
  }
}

/** Creates a throwaway WebGL context, reads the renderer string and releases the context again. */
export function probeGpu(): GpuProbe {
  try {
    const canvas = document.createElement('canvas')
    const gl = (canvas.getContext('webgl2') || canvas.getContext('webgl')) as WebGLRenderingContext | null
    if (!gl) return { context: false, debugInfo: false }
    const info = gl.getExtension('WEBGL_debug_renderer_info')
    const renderer = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : undefined
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    return { context: true, debugInfo: !!info, renderer }
  } catch {
    return { context: false, debugInfo: false }
  }
}

export function applyTier(tier: PerfTier) {
  const html = document.documentElement
  html.classList.remove('perf-full', 'perf-lite', 'perf-static')
  html.classList.add(`perf-${tier}`)
  // Older CSS and components key off .is-lite (no WebGL).
  html.classList.toggle('is-lite', tier !== 'full')
}

function boot(): TierDecision & { renderer: string } {
  const s = store()
  const gpu = probeGpu()
  const renderer = gpu.renderer ?? (gpu.context ? '(hidden)' : '(no WebGL)')
  // A ?perf= override wins and lasts for the session (QA without breaking a GPU).
  const forced = parseOverride(location.search)
  if (forced) s?.setItem(KEY, `forced:${forced}`)
  const saved = s?.getItem(KEY) ?? ''
  if (saved.startsWith('forced:')) {
    const tier = saved.slice(7) as PerfTier
    return { tier, reason: `forced by ?perf=${tier}`, renderer }
  }
  const nav = navigator as Navigator & { deviceMemory?: number }
  const decided = decideTier(gpu, {
    deviceMemoryGb: nav.deviceMemory,
    cores: nav.hardwareConcurrency,
    desktop: window.matchMedia('(pointer: fine)').matches,
  })
  // A demotion earlier in this session sticks (the watchdog never promotes back).
  const demoted = saved.startsWith('demoted:') ? (saved.slice(8) as PerfTier) : undefined
  if (demoted && worseTier(demoted, decided.tier) === demoted && demoted !== decided.tier)
    return { tier: demoted, reason: 'slow frame rate earlier this session', renderer }
  return { ...decided, renderer }
}

export const bootTier =
  typeof window === 'undefined' ? { tier: 'full' as PerfTier, reason: 'server', renderer: '' } : boot()
if (typeof window !== 'undefined') applyTier(bootTier.tier)

/** True when the tier was forced with ?perf= (the watchdog then leaves it alone). */
export const tierForced = bootTier.reason.startsWith('forced')

/** Records a demotion so later pages in the same session start at that tier. */
export function rememberDemotion(tier: PerfTier) {
  if (!tierForced) store()?.setItem(KEY, `demoted:${tier}`)
}
