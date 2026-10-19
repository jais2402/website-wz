// Renders the social cards (1200×630 PNG per page) and the logo/touch icon into public/og/ from code-drawn SVG.
// Copy comes from src/content/seo.ts (Node strips its types). Run `npm run og` after changing a card title, then
// commit the PNGs. The page itself stays raster-free; these files are only for link previews and JSON-LD.
import { Resvg } from '@resvg/resvg-js'
import UPNG from 'upng-js'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { pages, site } from '../src/content/seo.ts'

const root = fileURLToPath(new URL('..', import.meta.url))
const out = `${root}public/og/`
mkdirSync(out, { recursive: true })

const W = 1200
const H = 630
// Satoshi, the site's typeface (TTF copy for rendering only; the site serves the woff2 in public/fonts).
const FONT = 'Satoshi, Helvetica Neue, Helvetica, Arial, sans-serif'
const MONO = 'JetBrains Mono, SF Mono, Menlo, monospace'

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
  const title = page.card.title
  const size = title.length > 44 ? 64 : 76
  const lines = wrap(title, size === 64 ? 24 : 21).slice(0, 4)
  const lineH = Math.round(size * 1.08)
  const top = 430 - (lines.length - 1) * lineH
  const text = lines.map((l, n) => `<tspan x="80" y="${top + n * lineH}">${esc(l)}</tspan>`).join('')
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
  <g transform="translate(80 72) scale(1.5)">
    <rect width="32" height="32" rx="8" fill="#12121b" stroke="#2a2a3a"/>
    <path d="M5 9l5.5 14L16 12l5.5 11L27 9" stroke="#ededf3" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="16" cy="12" r="3" fill="#4d9fff"/>
  </g>
  <text x="146" y="108" font-family="${FONT}" font-size="34" font-weight="700" letter-spacing="-0.5" fill="#f2efe6">${esc(site.name)}</text>
  <text x="80" y="${top - lineH - 6}" font-family="${MONO}" font-size="22" letter-spacing="3" fill="#8cc4ff">${esc(page.card.kicker.toUpperCase())}</text>
  <text font-family="${FONT}" font-size="${size}" font-weight="700" letter-spacing="-2" fill="#f2efe6">${text}</text>
  <text x="80" y="560" font-family="${MONO}" font-size="20" letter-spacing="2" fill="#9a9aae">WEZIGNS.COM · CHENNAI · SINCE ${site.foundingDate}</text>
</svg>`
}

// Rasterise, then quantise to a 256-colour palette (UPNG) so each card stays well under 150 kB.
function render(svg, width, name) {
  const img = new Resvg(svg, {
    fitTo: { mode: 'width', value: width },
    font: { fontFiles: [new URL('./fonts/Satoshi-Variable.ttf', import.meta.url).pathname], loadSystemFonts: true, defaultFontFamily: 'Satoshi' },
  }).render()
  const rgba = Uint8Array.from(img.pixels)
  const png = Buffer.from(UPNG.encode([rgba.buffer], img.width, img.height, 256))
  writeFileSync(`${out}${name}`, png)
  console.log(`og: ${name} ${(png.length / 1024).toFixed(0)} kB`)
}

pages.forEach((page, i) => render(card(page, i), W, `${page.id}.png`))

// Logo (JSON-LD) and touch icon, from the favicon.
const favicon = readFileSync(`${root}public/favicon.svg`, 'utf8')
render(favicon, site.logo.width, 'logo.png')
render(favicon.replace('rx="8"', 'rx="0"'), 180, 'apple-touch-icon.png')
