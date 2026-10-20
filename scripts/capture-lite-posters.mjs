#!/usr/bin/env node
// Captures stills of the real WebGL scenes for the lite tier (machines without GPU acceleration), so lite shows
// the actual 3D instead of hand-drawn stand-ins. Re-run whenever a scene changes:
//
//   npm run build && node scripts/capture-lite-posters.mjs
//
// Uses the system Chrome with the GPU (PERF_CHROME=/path/to/chrome to override), hides every DOM element except
// the canvas being captured, and writes WebP files to public/lite/ (via Python Pillow, which the repo's other
// asset scripts already use).

import { execFileSync, spawn } from 'node:child_process'
import { existsSync, mkdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from 'playwright-core'

const PORT = 4803
const BASE = `http://localhost:${PORT}`
const OUT = 'public/lite'
const TMP = join('node_modules', '.cache', 'lite-posters')
const CHROME =
  process.env.PERF_CHROME ||
  ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome'].find((p) => existsSync(p))

/** Show only `sel` (and its contents): everything else keeps its layout but is invisible. */
const only = (sel) =>
  `body *{visibility:hidden!important;transition:none!important} ${sel},${sel} *{visibility:visible!important}`

// name, page, canvas selector, how to get there, element shot (true) or full viewport (false)
const SHOTS = [
  { name: 'loom-hero', path: '/', sel: '.loom-canvas', at: { top: 0 }, element: false },
  { name: 'story-simplify', path: '/', sel: '.canvas-root', at: { pin: '.story', p: 0.22 }, element: false },
  { name: 'story-scale', path: '/', sel: '.canvas-root', at: { pin: '.story', p: 0.54 }, element: false },
  { name: 'story-secure', path: '/', sel: '.canvas-root', at: { pin: '.story', p: 0.9 }, element: false },
  { name: 'globe', path: '/', sel: '.canvas-root', at: { section: '#countries', p: 0.5 }, element: false },
  { name: 'loom-contact', path: '/contact-us', sel: '.cp-loom', at: { top: 0 }, element: true },
  { name: 'loom-spindle', path: '/about-us', sel: '.hero-loom', at: { top: 0 }, element: true },
  { name: 'loom-frayed', path: '/404.html', sel: '.hero-loom', at: { top: 0 }, element: true },
]

async function preview() {
  const child = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' })
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(BASE)).ok) return child
    } catch {
      // starting
    }
    await new Promise((r) => setTimeout(r, 250))
  }
  child.kill()
  throw new Error('vite preview did not start')
}

const server = await preview()
mkdirSync(OUT, { recursive: true })
mkdirSync(TMP, { recursive: true })
const browser = await chromium.launch({
  headless: true,
  executablePath: CHROME,
  args: ['--enable-gpu', '--ignore-gpu-blocklist'],
})
try {
  for (const s of SHOTS) {
    const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 })
    const page = await ctx.newPage()
    await page.goto(`${BASE}${s.path}?perf=full`, { waitUntil: 'load' })
    await page.waitForFunction(() => !document.querySelector('.preloader'), null, { timeout: 45000 }).catch(() => {})
    await page.evaluate((at) => {
      let y = 0
      if (at.pin || at.section) {
        const el = document.querySelector(at.pin || at.section)
        const box = el.closest('.pin-spacer') || el
        const top = box.getBoundingClientRect().top + scrollY
        y = top + Math.max(0, box.offsetHeight - innerHeight) * at.p
      }
      window.scrollTo(0, y)
    }, s.at)
    // Let the scroll-driven stage and the damped camera settle.
    await page.waitForTimeout(6000)
    await page.addStyleTag({ content: only(s.sel) })
    await page.waitForTimeout(400)
    const png = join(TMP, `${s.name}.png`)
    if (s.element) await page.locator(s.sel).first().screenshot({ path: png })
    else await page.screenshot({ path: png })
    await ctx.close()
    console.log('captured', s.name)
  }
} finally {
  await browser.close()
  server.kill()
}

// PNG -> WebP: full-viewport stills at 1280 px (soft, glowing threads hide the scale-up), element stills at
// their own size; dark scenes compress well.
execFileSync(
  'python3',
  [
    '-c',
    `
import sys, os
from PIL import Image
tmp, out = sys.argv[1], sys.argv[2]
for f in sorted(os.listdir(tmp)):
    if not f.endswith('.png'): continue
    im = Image.open(os.path.join(tmp, f)).convert('RGB')
    if im.size[0] > 1280:
        im = im.resize((1280, round(im.size[1] * 1280 / im.size[0])), Image.LANCZOS)
    dst = os.path.join(out, f[:-4] + '.webp')
    for q in (70, 62, 55, 48):
        im.save(dst, 'WEBP', quality=q, method=6)
        if os.path.getsize(dst) <= 70_000: break
    print(f'{dst}  {im.size[0]}x{im.size[1]}  {os.path.getsize(dst)//1024} KB  q{q}')
`,
    TMP,
    OUT,
  ],
  { stdio: 'inherit' },
)
rmSync(TMP, { recursive: true, force: true })
