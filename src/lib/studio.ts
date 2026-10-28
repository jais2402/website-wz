// Video studio settings for the hero loom (studio.html, dev only): how many threads, how fast they move and how
// sharply the scene renders, read from the URL as ?studio=threads:0.5,speed:0.6,dpr:2 so the preview and the
// recording (scripts/capture-hero-video.mjs) show exactly the same scene.

export type StudioParams = {
  /** Share of the threads and riders drawn, 0.1..1. */
  threads: number
  /** Scene time per real second, 0.1..2 (1 = the live site). */
  speed: number
  /** Canvas pixel ratio, 0.5..3, in place of the render budget (null keeps the budget). */
  dpr: number | null
  /** Thread brightness, 0.25..4, on top of the automatic make-up for a sharper dpr (see threadGain). */
  glow: number
  /** Hold the hero camera at this scroll progress, 0..1 (null follows the page scroll). */
  cam: number | null
}

export const STUDIO_DEFAULTS: StudioParams = { threads: 1, speed: 1, dpr: null, glow: 1, cam: null }

const LIMITS = { threads: [0.1, 1], speed: [0.1, 2], dpr: [0.5, 3], glow: [0.25, 4], cam: [0, 1] } as const

/** The studio settings in a ?studio= value, or null when there is none. Unknown keys and bad numbers are ignored. */
export function parseStudio(value: string | null): StudioParams | null {
  if (!value) return null
  const out: StudioParams = { ...STUDIO_DEFAULTS }
  for (const pair of value.split(',')) {
    const [key, raw] = pair.split(':')
    const n = Number(raw)
    if (!(key in LIMITS) || raw === undefined || raw.trim() === '' || !Number.isFinite(n)) continue
    const [lo, hi] = LIMITS[key as keyof typeof LIMITS]
    out[key as keyof StudioParams] = Math.min(hi, Math.max(lo, n))
  }
  return out
}

/** The ?studio= value for these settings (the inverse of parseStudio). */
export function formatStudio(p: StudioParams): string {
  const parts = [`threads:${p.threads}`, `speed:${p.speed}`]
  if (p.dpr !== null) parts.push(`dpr:${p.dpr}`)
  if (p.glow !== 1) parts.push(`glow:${p.glow}`)
  if (p.cam !== null) parts.push(`cam:${p.cam}`)
  return parts.join(',')
}

/**
 * Brightness multiplier for the threads. WebGL draws lines one device pixel wide whatever the pixel ratio, so a
 * canvas rendered sharper than the budget (`budgetDpr`) draws thinner, dimmer threads and the bloom barely catches
 * them; this makes that light back up, times the studio's own glow. 1 without the studio.
 */
export function threadGain(p: StudioParams | null, budgetDpr: number): number {
  if (!p) return 1
  const sharper = p.dpr !== null && budgetDpr > 0 ? Math.max(1, p.dpr / budgetDpr) : 1
  return sharper * p.glow
}

/** A count scaled by the threads share, never below one. */
export function scaleCount(count: number, share: number): number {
  return Math.max(1, Math.round(count * share))
}
