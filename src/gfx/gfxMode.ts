// Which way a 3D area is shown: the live WebGL scene (after its poster), or the poster still alone.
//
// Override order: URL ?gfx=live|poster|auto, then sessionStorage 'gfx-override', then auto. In auto the GPU decides:
// no WebGL, or a software renderer (SwiftShader, llvmpipe, Microsoft Basic Render Driver…), gets the poster only;
// a real GPU gets the poster first and then the live scene. A GPU that fails the frame test (loom/hero.tsx) gets the
// poster for the rest of the tab's session. Both live in sessionStorage, not localStorage: a test switch, or one slow
// moment (another app busy on the GPU), must not follow a visitor into every later visit.

import { allowsLive, classifyTier, type GfxMode, type GfxTier, parseMode } from '@/lib/gfx'

const OVERRIDE_KEY = 'gfx-override'
const SLOW_KEY = 'gfx-slow'

function read(key: string): string | null {
  try {
    return window.sessionStorage.getItem(key)
  } catch {
    return null
  }
}

function write(key: string, value: string | null) {
  try {
    if (value === null) window.sessionStorage.removeItem(key)
    else window.sessionStorage.setItem(key, value)
  } catch {
    // Storage blocked (private mode, disabled site data): the choice just isn't remembered.
  }
}

function probe() {
  const result = { context: false, caveat: false, renderer: '' }
  try {
    const canvas = document.createElement('canvas')
    const strict = { failIfMajorPerformanceCaveat: true, powerPreference: 'high-performance' } as const
    let gl = (canvas.getContext('webgl2', strict) || canvas.getContext('webgl', strict)) as WebGLRenderingContext | null
    result.caveat = !!gl
    if (!gl) {
      const other = document.createElement('canvas')
      gl = (other.getContext('webgl2') || other.getContext('webgl')) as WebGLRenderingContext | null
    }
    if (!gl) return result
    result.context = true
    const info = gl.getExtension('WEBGL_debug_renderer_info')
    result.renderer = String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER) ?? '')
    gl.getExtension('WEBGL_lose_context')?.loseContext()
  } catch {
    // Treated as no WebGL.
  }
  return result
}

function resolve() {
  if (typeof document === 'undefined') return { mode: 'auto' as GfxMode, tier: 'none' as GfxTier, renderer: '' }
  // Earlier builds kept both in localStorage; drop what they left behind.
  try {
    window.localStorage.removeItem(OVERRIDE_KEY)
    window.localStorage.removeItem(SLOW_KEY)
  } catch {
    // Storage blocked: nothing was kept either.
  }
  const fromUrl = parseMode(new URLSearchParams(window.location.search).get('gfx'))
  // A URL choice sticks for this tab's later pages; ?gfx=auto clears it.
  if (fromUrl) write(OVERRIDE_KEY, fromUrl === 'auto' ? null : fromUrl)
  const mode = fromUrl ?? parseMode(read(OVERRIDE_KEY)) ?? 'auto'
  const p = probe()
  const tier = classifyTier(p, read(SLOW_KEY))
  document.documentElement.dataset.gfx = tier
  return { mode, tier, renderer: p.renderer }
}

const resolved = resolve()

export const gfx = {
  mode: resolved.mode,
  tier: resolved.tier,
  renderer: resolved.renderer,
  /** Whether the live scenes may load on this visit. */
  live: allowsLive(resolved.mode, resolved.tier),
  /** The frame test failed: remember this GPU so the tab's later pages show the poster straight away. */
  markSlow() {
    if (resolved.renderer) write(SLOW_KEY, resolved.renderer)
    document.documentElement.dataset.gfx = 'software'
  },
}
