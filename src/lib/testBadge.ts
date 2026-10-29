// The testing badge (components/TestBadge.tsx): which way this device draws the 3D areas. Pure: no React, no DOM.

/**
 * Whether to show the badge. On by default in dev and on Vercel preview builds (the testing branch), never on
 * production unless the URL asks: ?badge=1 turns it on for the tab, ?badge=0 turns it off again. Returns the value
 * to remember for the tab (null leaves the stored choice as it is).
 */
export function badgeChoice(
  build: { dev: boolean; vercelEnv: string },
  search: string,
  stored: string | null,
): { show: boolean; store: '1' | '0' | null } {
  const asked = new URLSearchParams(search).get('badge')
  if (asked === '1' || asked === '0') return { show: asked === '1', store: asked }
  if (stored === '1' || stored === '0') return { show: stored === '1', store: null }
  return { show: build.dev || build.vercelEnv === 'preview', store: null }
}

export type HeroView = '3D' | 'Video' | 'Video H.264' | 'Still' | 'Off screen'

/** What the hero is showing right now, from what is on the page. `videoLight`: the H.264 file, for software drawing. */
export function heroView(s: {
  onScreen: boolean
  live3d: boolean
  videoPlaying: boolean
  videoLight?: boolean
}): HeroView {
  if (!s.onScreen) return 'Off screen'
  if (s.live3d) return '3D'
  if (!s.videoPlaying) return 'Still'
  return s.videoLight ? 'Video H.264' : 'Video'
}

/** A GPU name short enough for the badge: "ANGLE (Apple, ANGLE Metal Renderer: Apple M4, …)" → "Apple M4". */
export function shortRenderer(renderer: string): string {
  const inner = /ANGLE \((.*)\)/.exec(renderer)?.[1]
  const parts = (inner ?? renderer).split(',').map((p) => p.trim())
  const name = parts.length > 1 ? parts[1] : parts[0]
  return (name.split(':').pop() ?? '').replace(/\s*Direct3D.*$/i, '').trim() || 'unknown'
}
