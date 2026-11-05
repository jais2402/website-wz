// The testing badge (components/TestBadge.tsx): which way this device draws the 3D areas. Pure: no React, no DOM.

/** Whether to show the badge: only when the address asks for it with ?badge=1, on any build (dev, preview, production). */
export function badgeChoice(search: string): boolean {
  return new URLSearchParams(search).get('badge') === '1'
}

export type HeroView = '3D' | '2D chaos' | 'Video' | 'Video H.264' | 'Still' | 'Off screen'

/** What the hero is showing right now, from what is on the page. `videoLight`: the H.264 file, for software drawing. */
export function heroView(s: {
  onScreen: boolean
  live3d: boolean
  videoPlaying: boolean
  videoLight?: boolean
  chaos?: boolean
}): HeroView {
  if (!s.onScreen) return 'Off screen'
  if (s.live3d) return '3D'
  if (s.chaos) return '2D chaos'
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
