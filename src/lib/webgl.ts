// Whether this browser can create a WebGL context at all. Checked once, before first render. Without it the 3D
// scenes are simply not mounted (their areas stay empty) and the page does not wait for them.

function probe(): boolean {
  try {
    const canvas = document.createElement('canvas')
    const gl = (canvas.getContext('webgl2') || canvas.getContext('webgl')) as WebGLRenderingContext | null
    if (!gl) return false
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    return true
  } catch {
    return false
  }
}

export const webgl = typeof document !== 'undefined' && probe()
