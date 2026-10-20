// Decides whether to serve the "lite" site (same content, no WebGL): only when WebGL is missing or ?lite=1. Pure so it can be unit-tested; the browser
// signals are gathered by readLiteSignals() below.

export type LiteSignals = {
  /** WebGL context could be created. */
  webgl: boolean
  /** Network Information API (Chromium only; undefined elsewhere). */
  saveData?: boolean
  effectiveType?: string
  downlinkMbps?: number
  /** navigator.deviceMemory in GB (Chromium only). */
  deviceMemoryGb?: number
  /** navigator.hardwareConcurrency. */
  cores?: number
  /** ?lite=1 forces lite, ?lite=0 forces full. */
  override?: 'lite' | 'full'
}

export type LiteDecision = { lite: boolean; reason: string }

export function decideLite(s: LiteSignals): LiteDecision {
  if (s.override === 'lite') return { lite: true, reason: 'forced by ?lite=1' }
  if (s.override === 'full') return { lite: false, reason: 'forced by ?lite=0' }
  // Lite only when 3D cannot run at all. Network, memory and CPU hints no longer downgrade the site (client
  // decision, 2026-10-20): Chrome's downlink estimate read ~1.35 Mbps on fast connections and served line art.
  if (!s.webgl) return { lite: true, reason: 'WebGL unavailable' }
  return { lite: false, reason: 'full experience' }
}

type NetworkInformation = { saveData?: boolean; effectiveType?: string; downlink?: number }

/** Reads the real browser signals. Safe to call during render on the client. */
export function readLiteSignals(): LiteSignals {
  const nav = navigator as Navigator & { connection?: NetworkInformation; deviceMemory?: number }
  const q = new URLSearchParams(location.search).get('lite')
  let webgl = false
  try {
    const c = document.createElement('canvas')
    webgl = !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    webgl = false
  }
  return {
    webgl,
    saveData: nav.connection?.saveData,
    effectiveType: nav.connection?.effectiveType,
    downlinkMbps: nav.connection?.downlink,
    deviceMemoryGb: nav.deviceMemory,
    cores: nav.hardwareConcurrency,
    override: q === '1' ? 'lite' : q === '0' ? 'full' : undefined,
  }
}
