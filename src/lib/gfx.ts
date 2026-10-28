// Graphics mode decisions (pure): which way a 3D area is shown, the live scene after its poster or the poster alone.
// The browser probe and storage live in src/gfx/gfxMode.ts.

export type GfxMode = 'auto' | 'live' | 'poster'
export type GfxTier = 'none' | 'software' | 'low' | 'high'

const SOFTWARE = /swiftshader|llvmpipe|softpipe|software|basic render|warp/i
const INTEGRATED = /intel|uhd|iris|mali|adreno|powervr|apple gpu|apple m\d/i

export function parseMode(value: string | null | undefined): GfxMode | null {
  return value === 'live' || value === 'poster' || value === 'auto' ? value : null
}

/** Tier from what the probe found: whether a context exists, whether it passed the performance-caveat check. */
export function classifyTier(
  probe: { context: boolean; caveat: boolean; renderer: string },
  slow?: string | null,
): GfxTier {
  if (!probe.context) return 'none'
  if (!probe.caveat || SOFTWARE.test(probe.renderer)) return 'software'
  if (slow && slow === probe.renderer) return 'software'
  return INTEGRATED.test(probe.renderer) ? 'low' : 'high'
}

/** Whether the live scene may load. `live` still needs a WebGL context; `poster` never loads three.js. */
export function allowsLive(mode: GfxMode, tier: GfxTier): boolean {
  if (tier === 'none') return false
  if (mode === 'live') return true
  if (mode === 'poster') return false
  return tier === 'low' || tier === 'high'
}

/** Frames the live scene must keep up with before it replaces its poster: median frame time at or under this. */
export const FRAME_BUDGET_MS = 30

/** Median of the frame times (ms); 0 for no samples. */
export function medianMs(samples: readonly number[]): number {
  if (!samples.length) return 0
  const s = [...samples].sort((a, b) => a - b)
  const mid = s.length >> 1
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2
}

export type Pt = { x: number; y: number }

/**
 * A point on a rider's path into the loom mouth (poster thread flow): a quadratic curve that keeps the start's
 * height for most of the way and then funnels into the mouth, like the threads in the still. `t` 0..1, eased in
 * so riders speed up as they are drawn into the loom.
 */
export function flowPoint(start: Pt, mouth: Pt, t: number): Pt {
  const k = Math.min(1, Math.max(0, t))
  const e = k * k * (1.6 - 0.6 * k)
  const c = { x: start.x + (mouth.x - start.x) * 0.7, y: start.y }
  const u = 1 - e
  return {
    x: u * u * start.x + 2 * u * e * c.x + e * e * mouth.x,
    y: u * u * start.y + 2 * u * e * c.y + e * e * mouth.y,
  }
}

/**
 * How much the hero still is magnified at scroll progress `p` (0..1) to match the live camera's fly-in: the loom
 * sits at z = 0 and the camera moves from z 14 to 7.5 (portrait 24 to 13), so things at the loom grow by z0 / z.
 * Mirrors CameraRig in loom/LoomScene.tsx; keep in sync.
 */
export function flyScale(p: number, portrait: boolean): number {
  const k = Math.min(1, Math.max(0, p))
  const z0 = portrait ? 24 : 14
  return z0 / (z0 - k * (portrait ? 11 : 6.5))
}

/** Where point `pt` (0..1 of an image) lands in a box the image fills like object-fit: cover, centred (px). */
export function coverPoint(
  pt: Pt,
  image: { width: number; height: number },
  box: { width: number; height: number },
): Pt {
  const scale = Math.max(box.width / image.width, box.height / image.height)
  return {
    x: (box.width - image.width * scale) / 2 + pt.x * image.width * scale,
    y: (box.height - image.height * scale) / 2 + pt.y * image.height * scale,
  }
}

/**
 * The part of an image (in its own pixels) to show so that, filling a box like object-fit: cover, it looks the
 * same as the full image covering the box and zoomed `scale` times around screen point `origin` (px in the box).
 * As CSS object-view-box inset() values: zooming this way keeps the element itself the size of the box.
 */
export function zoomInset(
  origin: Pt,
  scale: number,
  box: { width: number; height: number },
  image: { width: number; height: number },
): { top: number; right: number; bottom: number; left: number } {
  const c = Math.max(box.width / image.width, box.height / image.height)
  const ox = (box.width - image.width * c) / 2
  const oy = (box.height - image.height * c) / 2
  const s = Math.max(1, scale)
  const x0 = (origin.x - origin.x / s - ox) / c
  const x1 = (origin.x + (box.width - origin.x) / s - ox) / c
  const y0 = (origin.y - origin.y / s - oy) / c
  const y1 = (origin.y + (box.height - origin.y) / s - oy) / c
  return { top: y0, right: image.width - x1, bottom: image.height - y1, left: x0 }
}
