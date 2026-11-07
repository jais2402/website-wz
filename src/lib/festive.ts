// Festive home loader (Diwali): switched on by the VITE_FESTIVE env var and off again by its end date, without a
// redeploy. The build writes the window onto the inline head script (scripts/vite-snapshot.ts), which adds
// `festive-<name>` to <html> while it is open; the boot preloader's CSS and the React preloader both follow that class.
// Pure: no React, no DOM types beyond a class list, no imports (snapshot.ts loads this outside the app's alias).

export const festivals = ['diwali'] as const
export type Festive = (typeof festivals)[number]

export const isFestive = (v: string | undefined | null): v is Festive => festivals.includes(v as Festive)

/** An open window: on from `from` (ms, null = straight away) until `until` (ms, exclusive). */
export type FestiveWindow = { festive: Festive; from: number | null; until: number }

const time = (v: string | undefined) => {
  const ms = v?.trim() ? Date.parse(v.trim()) : NaN
  return Number.isNaN(ms) ? null : ms
}

/**
 * The window from the env (VITE_FESTIVE, VITE_FESTIVE_FROM, VITE_FESTIVE_UNTIL), falling back to the festival's
 * default end date. Null when switched off, unknown, or already over at `now` (so a later build ships no festive
 * markup at all).
 */
export function festiveWindow(
  env: { theme?: string; from?: string; until?: string },
  defaults: Record<Festive, { until: string }>,
  now: number,
): FestiveWindow | null {
  const festive = env.theme?.trim().toLowerCase()
  if (!isFestive(festive)) return null
  const until = time(env.until) ?? time(defaults[festive].until)
  if (until === null || until <= now) return null
  return { festive, from: time(env.from), until }
}

/** What the inline head script does with the window, kept here so it is tested: open from `from`, shut at `until`. */
export const festiveOpen = (w: Pick<FestiveWindow, 'from' | 'until'>, now: number) =>
  now >= (w.from ?? 0) && now < w.until

/** The data attributes the build puts on the inline head script. */
export const festiveAttrs = (w: FestiveWindow): Record<string, string> => ({
  'data-festive': w.festive,
  ...(w.from === null ? {} : { 'data-from': String(w.from) }),
  'data-until': String(w.until),
})

/**
 * The festival the React preloader shows: what the head script decided (the class on <html>), unless the address
 * forces it with `?festive=diwali` (to preview it) or `?festive=off`.
 */
export function activeFestive(classes: { contains(name: string): boolean }, search: string): Festive | null {
  const forced = new URLSearchParams(search).get('festive')
  if (forced === 'off') return null
  if (isFestive(forced)) return forced
  return festivals.find((f) => classes.contains(`festive-${f}`)) ?? null
}

/**
 * A kolam: one continuous thread looping round a ring of dots (pulli), drawn as an epitrochoid with `loops` lobes.
 * Centred on 0,0; radius `ring` to the middle of the loops, `swing` for their size.
 */
export function kolamPath(loops = 8, ring = 62, swing = 24, steps = 320): string {
  const k = loops - 1
  let d = ''
  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * Math.PI * 2
    const x = ring * Math.cos(t) + swing * Math.cos(k * t)
    const y = ring * Math.sin(t) - swing * Math.sin(k * t)
    d += `${i ? 'L' : 'M'}${round(x)} ${round(y)}`
  }
  return `${d}Z`
}

/** The kolam's dots: one inside each loop, one between each pair of loops. */
export function kolamDots(loops = 8, ring = 62, swing = 24): { x: number; y: number; r: number }[] {
  return Array.from({ length: loops }, (_, j) => {
    const a = (j / loops) * Math.PI * 2
    const b = ((j + 0.5) / loops) * Math.PI * 2
    return [
      { x: round((ring + swing * 0.55) * Math.cos(a)), y: round((ring + swing * 0.55) * Math.sin(a)), r: 2.6 },
      { x: round((ring + swing * 0.75) * Math.cos(b)), y: round((ring + swing * 0.75) * Math.sin(b)), r: 1.9 },
    ]
  }).flat()
}

const round = (n: number) => {
  const v = Math.round(n * 10) / 10
  return Object.is(v, -0) ? 0 : v
}

/** Where the fireworks go off: position on screen (%), start delay (s) and colour. */
export const bursts = [
  { x: 16, y: 24, delay: 0, color: '#ffc46b' },
  { x: 82, y: 18, delay: 0.35, color: '#ff7a59' },
  { x: 72, y: 72, delay: 0.75, color: '#8cc4ff' },
  { x: 26, y: 78, delay: 1.1, color: '#ff47c7' },
  { x: 50, y: 12, delay: 1.5, color: '#ffd27a' },
  { x: 90, y: 46, delay: 1.9, color: '#8b7bff' },
  { x: 8, y: 52, delay: 2.3, color: '#ffc46b' },
]

/**
 * Fireworks behind the Diwali loader: each burst is a rocket trail rising to its point, then twelve rays opening out
 * (CSS, index.css). Markup as the browser serialises it, like diwaliArt().
 */
export function diwaliSky(): string {
  const rays = Array.from({ length: 12 }, (_, i) => `<b style="--a:${i * 30}deg"></b>`).join('')
  return bursts
    .map(
      (b) =>
        `<i class="dw-burst" style="--x:${b.x}%;--y:${b.y}%;--d:${b.delay}s;--c:${b.color}">${rays}</i>`,
    )
    .join('')
}

/**
 * The Diwali loader's picture as SVG markup: the kolam (`.dw-kolam`, drawn in by the loading progress), its dots,
 * a lit diya in the middle and sparks rising from the flame. Written the way the browser serialises it (explicit
 * closing tags), so the HTML copy and React's copy are the same string (Preloader.test.tsx).
 */
export function diwaliArt(): string {
  const dots = kolamDots()
    .map((p) => `<circle cx="${p.x}" cy="${p.y}" r="${p.r}"></circle>`)
    .join('')
  const sparks = [-6, 4, -2, 7, -8, 2]
    .map((x, i) => `<circle cx="${x}" cy="-26" r="${i % 2 ? 1.1 : 1.5}"></circle>`)
    .join('')
  return (
    '<svg class="dw-svg" viewBox="-100 -100 200 200" aria-hidden="true">' +
    '<defs>' +
    '<radialGradient id="dw-glow"><stop offset="0" stop-color="#ffb347" stop-opacity="0.5"></stop>' +
    '<stop offset="1" stop-color="#ffb347" stop-opacity="0"></stop></radialGradient>' +
    '<radialGradient id="dw-fire" cx="0.5" cy="0.75" r="0.75"><stop offset="0" stop-color="#fffaf0"></stop>' +
    '<stop offset="0.4" stop-color="#ffd27a"></stop><stop offset="1" stop-color="#ff7a59"></stop></radialGradient>' +
    '<linearGradient id="dw-clay" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff8f5e"></stop>' +
    '<stop offset="1" stop-color="#9c3b24"></stop></linearGradient>' +
    '</defs>' +
    '<circle class="dw-halo" cy="-8" r="52" fill="url(#dw-glow)"></circle>' +
    `<g class="dw-dots">${dots}</g>` +
    `<path class="dw-kolam" pathLength="1" d="${kolamPath()}"></path>` +
    '<g class="dw-diya">' +
    '<path d="M-26 4C-24 18-10 24 2 24C14 24 24 16 30 2C18 6-12 6-26 4Z" fill="url(#dw-clay)"></path>' +
    '<ellipse cx="2" cy="4" rx="28" ry="4.5" fill="#ffb07a"></ellipse>' +
    '<ellipse cx="2" cy="4" rx="22" ry="2.6" fill="#5a2414"></ellipse>' +
    '<path class="dw-flame" d="M2-28C10-16 9-4 2 1C-5-4-6-16 2-28Z" fill="url(#dw-fire)"></path>' +
    '</g>' +
    `<g class="dw-sparks">${sparks}</g>` +
    '</svg>'
  )
}
