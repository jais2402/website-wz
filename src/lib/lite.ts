// Decides whether to serve the "lite" site: same content, no WebGL. Pure so it can be unit-tested; the browser
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
  if (!s.webgl) return { lite: true, reason: 'WebGL unavailable' }
  if (s.saveData) return { lite: true, reason: 'data saver is on' }
  // effectiveType is Chrome's estimate and reads '3g' on ordinary Wi-Fi now and then, so only 2G counts on its own.
  if (s.effectiveType && /(^|-)2g$/.test(s.effectiveType)) return { lite: true, reason: `slow network (${s.effectiveType})` }
  if (s.downlinkMbps !== undefined && s.downlinkMbps > 0 && s.downlinkMbps < 1.5) {
    return { lite: true, reason: `slow network (${s.downlinkMbps} Mbps)` }
  }
  if (s.deviceMemoryGb !== undefined && s.deviceMemoryGb <= 2) return { lite: true, reason: `low memory (${s.deviceMemoryGb} GB)` }
  if (s.cores !== undefined && s.cores <= 2) return { lite: true, reason: `low CPU (${s.cores} cores)` }
  return { lite: false, reason: 'full experience' }
}

/** Average frames per second from a list of frame timestamps (ms). */
export function averageFps(timestamps: number[]): number {
  if (timestamps.length < 2) return 0
  const span = timestamps[timestamps.length - 1] - timestamps[0]
  return span > 0 ? ((timestamps.length - 1) * 1000) / span : 0
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
