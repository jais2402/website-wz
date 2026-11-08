// Renders the social cards (1200×630 PNG per page) and the logo/touch icon (plus public/favicon.ico) into public/og/ from code-drawn SVG.
// Each card shows its page's hero: the hero label and headline, with the last line in the serif accent as on the page
// (src/content/heroes.ts reads the same content files the pages render). Pages without a hero fall back to `card` in seo.ts.
// Run `npm run og` after changing a hero or card, then commit the PNGs. The page itself stays raster-free; these files are only for link previews and JSON-LD.
import { Resvg } from '@resvg/resvg-js'
import UPNG from 'upng-js'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { heroFor } from '../src/content/heroes.ts'
import { pages, site } from '../src/content/seo.ts'
import { LOGO_VIEWBOX, logoPaths } from '../src/content/logo.ts'

const root = fileURLToPath(new URL('..', import.meta.url))
const out = `${root}public/og/`
mkdirSync(out, { recursive: true })

const W = 1200
const H = 630
// Satoshi, the site's typeface (TTF copy for rendering only; the site serves the woff2 in public/fonts).
const FONT = 'Satoshi, Helvetica Neue, Helvetica, Arial, sans-serif'
const MONO = 'JetBrains Mono, SF Mono, Menlo, monospace'
const SERIF = 'Instrument Serif, Georgia, serif'

// The largest size at which the headline fits in four lines of the left column (chars per line from the width).
function layoutTitle(lines) {
  for (const [size, max] of [[78, 19], [68, 22], [58, 26], [50, 30]]) {
    const wrapped = lines.map((l, i) => ({ text: wrap(l, i === lines.length - 1 && lines.length > 1 ? Math.round(max * 1.3) : max), accent: i === lines.length - 1 && lines.length > 1 }))
    const flat = wrapped.flatMap((w) => w.text.map((text) => ({ text, accent: w.accent })))
    if (flat.length <= 4 || size === 50) return { size, rows: flat.slice(0, 5) }
  }
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// Greedy wrap by character budget (SVG has no text wrapping).
function wrap(text, max) {
  const lines = []
  let line = ''
  for (const word of text.split(/\s+/)) {
    if (line && (line + ' ' + word).length > max) {
      lines.push(line)
      line = word
    } else line = line ? `${line} ${word}` : word
  }
  if (line) lines.push(line)
  return lines
}

// Small seeded random, so every build draws the same threads.
function rng(seed) {
  let s = seed >>> 0
  return () => (s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32
}

// Glowing threads sweeping in from the right edge and gathering at a knot, like the loom hero.
function threads(seed) {
  const r = rng(seed)
  const knot = { x: 900 + r() * 60, y: 300 + r() * 60 }
  const colours = ['#4d9fff', '#8cc4ff', '#8b7bff', '#4d9fff', '#8b7bff', '#ff7a59']
  let d = ''
  for (let i = 0; i < 14; i++) {
    const y0 = -40 + r() * (H + 80)
    const y1 = -40 + r() * (H + 80)
    const c = colours[i % colours.length]
    const w = (0.8 + r() * 1.8).toFixed(2)
    const o = (0.35 + r() * 0.5).toFixed(2)
    d += `<path d="M${W + 20} ${y0.toFixed(0)} C ${1040 + r() * 80} ${(y0 * 0.6 + knot.y * 0.4).toFixed(0)}, ${(knot.x + 120).toFixed(0)} ${(knot.y + (r() - 0.5) * 140).toFixed(0)}, ${knot.x.toFixed(0)} ${knot.y.toFixed(0)} S ${(knot.x - 260 - r() * 160).toFixed(0)} ${(y1 * 0.5 + knot.y * 0.5).toFixed(0)}, ${(600 + r() * 120).toFixed(0)} ${y1.toFixed(0)}" stroke="${c}" stroke-width="${w}" stroke-opacity="${o}" fill="none" stroke-linecap="round"/>`
  }
  return { d, knot }
}

function card(page, i) {
  const { d, knot } = threads(7 + i * 31)
  const hero = heroFor(page.id) ?? { kicker: page.card.kicker, lines: [page.card.title] }
  const { size, rows } = layoutTitle(hero.lines)
  const lineH = Math.round(size * 1.06)
  const top = 470 - (rows.length - 1) * lineH
  const text = rows
    .map((r, n) =>
      r.accent
        ? `<text x="80" y="${top + n * lineH}" font-family="${SERIF}" font-style="italic" font-size="${Math.round(size * 1.08)}" fill="#8cc4ff">${esc(r.text)}</text>`
        : `<text x="80" y="${top + n * lineH}" font-family="${FONT}" font-size="${size}" font-weight="700" letter-spacing="-2" fill="#f2efe6">${esc(r.text)}</text>`,
    )
    .join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="halo" cx="${knot.x}" cy="${knot.y}" r="420" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#4d9fff" stop-opacity="0.32"/>
      <stop offset="0.45" stop-color="#8b7bff" stop-opacity="0.12"/>
      <stop offset="1" stop-color="#07070c" stop-opacity="0"/>
    </radialGradient>
    <filter id="glow" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="6"/></filter>
    <linearGradient id="fade" x1="0" x2="1">
      <stop offset="0" stop-color="#07070c" stop-opacity="0.95"/>
      <stop offset="0.55" stop-color="#07070c" stop-opacity="0.6"/>
      <stop offset="1" stop-color="#07070c" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="#07070c"/>
  <rect width="${W}" height="${H}" fill="url(#halo)"/>
  <g filter="url(#glow)" opacity="0.9">${d}</g>
  <g>${d}</g>
  <circle cx="${knot.x}" cy="${knot.y}" r="9" fill="#ffffff"/>
  <circle cx="${knot.x}" cy="${knot.y}" r="26" fill="#8cc4ff" opacity="0.35" filter="url(#glow)"/>
  <rect width="760" height="${H}" fill="url(#fade)"/>
  <g transform="translate(80 64) scale(${48 / LOGO_VIEWBOX.h})">${logoPaths('word', '#f2efe6')}</g>
  <text x="80" y="${top - lineH - 4}" font-family="${MONO}" font-size="22" letter-spacing="3" fill="#8cc4ff">${esc(hero.kicker.toUpperCase())}</text>
  ${text}
  <text x="80" y="582" font-family="${MONO}" font-size="20" letter-spacing="2" fill="#9a9aae">WEZIGNS.COM, CHENNAI, SINCE ${site.foundingDate}</text>
</svg>`
}

// Rasterise, then quantise to a 256-colour palette (UPNG) so each card stays well under 150 kB.
function toPng(svg, width) {
  const img = new Resvg(svg, {
    fitTo: { mode: 'width', value: width },
    font: { // fileURLToPath, not .pathname: the project path has spaces, which .pathname leaves as %20.
    fontFiles: ['./fonts/Satoshi-Variable.ttf', './fonts/InstrumentSerif-Italic.ttf'].map((f) => fileURLToPath(new URL(f, import.meta.url))), loadSystemFonts: true, defaultFontFamily: 'Satoshi' },
  }).render()
  const rgba = Uint8Array.from(img.pixels)
  return Buffer.from(UPNG.encode([rgba.buffer], img.width, img.height, 256))
}

function render(svg, width, name) {
  const png = toPng(svg, width)
  writeFileSync(`${out}${name}`, png)
  console.log(`og: ${name} ${(png.length / 1024).toFixed(0)} kB`)
}

// favicon.ico for browsers, readers and crawlers that ask for /favicon.ico: 16, 32 and 48 px PNGs in one ICO.
function writeIco(svg, sizes, file) {
  const images = sizes.map((size) => toPng(svg, size))
  const header = Buffer.alloc(6 + 16 * images.length)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(images.length, 4)
  let offset = header.length
  images.forEach((png, i) => {
    const e = 6 + 16 * i
    header.writeUInt8(sizes[i] % 256, e)
    header.writeUInt8(sizes[i] % 256, e + 1)
    header.writeUInt16LE(1, e + 4)
    header.writeUInt16LE(32, e + 6)
    header.writeUInt32LE(png.length, e + 8)
    header.writeUInt32LE(offset, e + 12)
    offset += png.length
  })
  const ico = Buffer.concat([header, ...images])
  writeFileSync(file, ico)
  console.log(`og: ${file.split('/').pop()} ${(ico.length / 1024).toFixed(1)} kB`)
}

// The internal loom page is never built, so its card is not shipped. The index stays the page's own, so every
// other card keeps its seed.
pages.forEach((page, i) => {
  if (page.id !== 'loom') render(card(page, i), W, `${page.id}.png`)
})

// The icons are the client's files (docs/brand): the favicon (the white W on a dark rounded square) is copied to
// public/ for browsers that take SVG icons and rendered into favicon.ico; the app icon (more padding, for home-screen
// masks) becomes the touch icon and the JSON-LD logo.
const brand = (f) => readFileSync(`${root}docs/brand/${f}`, 'utf8')
const favicon = brand('wezigns-favicon.svg')
const appIcon = brand('wezigns-app-icon.svg')
writeFileSync(`${root}public/favicon.svg`, favicon)
render(appIcon, site.logo.width, 'logo.png')
// iOS rounds the corners itself: a full square, so no light corners show under its mask.
render(appIcon.replace('rx="112"', 'rx="0"'), 180, 'apple-touch-icon.png')
writeIco(favicon, [16, 32, 48], `${root}public/favicon.ico`)
