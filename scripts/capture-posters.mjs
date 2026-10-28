#!/usr/bin/env node
// Poster stills of the 3D scenes, captured from the real scenes so the page can show them before (or instead of)
// WebGL. For now: the home hero loom, desktop and mobile.
//
//   npm run dev            (in another terminal; the capture needs the dev server's source modules)
//   npm run posters        [--url http://localhost:5173] [--threads 1] [--dpr budget] [--glow 1] [--cam 0.6] [--out captures/studio]
//
// --threads / --dpr / --glow / --cam: the studio's scene settings (src/lib/studio.ts), so the still matches a studio
// video. With --out the stills go to that folder and the site's files are left alone.
//
// Renders at deviceScaleFactor 2 with the GPU, hides every element but the canvas, waits for the camera to settle,
// and screenshots the viewport (the hero's sticky stage fills it), so the still frames exactly what the canvas shows. The render budget is lifted for
// the capture only (useBudgetDpr is served as a constant 2); nothing in the scenes changes.
// Writes public/posters/<scene>-<viewport>.{avif,webp} and src/generated/posters.json (sizes + a blurred
// 24px placeholder). Uses the system Chrome (or PERF_CHROME=/path/to/chrome).

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'
import sharp from 'sharp'

const args = process.argv.slice(2)
const opt = (name, def) => {
  const i = args.indexOf(name)
  return i >= 0 ? args[i + 1] : def
}
const BASE = opt('--url', 'http://localhost:5173')
const OUT_DIR = opt('--out', '')
const DPR = opt('--dpr', 'budget')
const STUDIO = [
  `threads:${Number(opt('--threads', '1'))}`,
  `glow:${Number(opt('--glow', '1'))}`,
  ...(DPR === 'budget' ? [] : [`dpr:${DPR}`]),
  ...(opt('--cam', '') === '' ? [] : [`cam:${Number(opt('--cam', '0'))}`]),
].join(',')
const CHROME =
  process.env.PERF_CHROME ||
  ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium'].find(
    (p) => existsSync(p),
  )

const root = (p) => fileURLToPath(new URL(`../${p}`, import.meta.url))
const OUT = OUT_DIR ? root(OUT_DIR) : root('public/posters')
const MANIFEST = root('src/generated/posters.json')

const VIEWPORTS = {
  desktop: { viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 2 },
  mobile: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
}
const MAX_WIDTH = { desktop: 1920, mobile: 780 }
const SCENES = [
  { id: 'hero', url: '/', canvas: '.loom-canvas canvas', ready: '.loom-canvas.is-ready', store: '/src/loom/store.ts' },
]

async function capture(browser, scene, opts) {
  const ctx = await browser.newContext(opts)
  const page = await ctx.newPage()
  // Force the live scene even if this machine was once marked slow.
  await page.goto(`${BASE}${scene.url}?gfx=live&studio=${STUDIO}`, { waitUntil: 'load' })
  await page.waitForFunction(() => !document.querySelector('.preloader'), null, { timeout: 45000 }).catch(() => {})
  await page.addStyleTag({
    content: 'body *{visibility:hidden!important} canvas{visibility:visible!important} *{transition:none!important}',
  })
  // The moment the live scene starts fading in over its poster (camera settled), so the two frames match.
  await page.waitForSelector(scene.ready, { state: 'attached', timeout: 30000 })
  await page.waitForTimeout(50)
  const png = await page.screenshot()
  const width = await page.evaluate((sel) => document.querySelector(sel).width, scene.canvas)
  // Where the loom mouth is in the still (0..1 of its width and height), published by the live scene each frame:
  // the poster's thread flow (src/gfx/ThreadFlow.tsx) converges on it.
  const mouth = await page.evaluate(async (store) => {
    const { loomStore } = await import(store)
    return { x: +loomStore.mouth.x.toFixed(4), y: +loomStore.mouth.y.toFixed(4) }
  }, scene.store)
  await ctx.close()
  return { png, width, mouth }
}

async function main() {
  if (!CHROME) throw new Error('No Chrome found: set PERF_CHROME=/path/to/chrome')
  mkdirSync(OUT, { recursive: true })
  mkdirSync(root('src/generated'), { recursive: true })
  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--enable-gpu', '--ignore-gpu-blocklist'],
  })
  // Keep what capture-hero-video.mjs added (each still's `video`).
  const before = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : {}
  const manifest = {}
  for (const scene of SCENES) {
    manifest[scene.id] = {}
    for (const [vp, opts] of Object.entries(VIEWPORTS)) {
      const { png, width: w, mouth } = await capture(browser, scene, opts)
      // Never wider than the videos (a sharper --dpr renders a bigger canvas than the still needs).
      const img = sharp(png).resize(Math.min(w, MAX_WIDTH[vp]))
      const { info } = await img.clone().raw().toBuffer({ resolveWithObject: true })
      const { width, height } = info
      const name = `${scene.id}-${vp}`
      const avif = await img.clone().avif({ quality: 55, effort: 6 }).toBuffer()
      const webp = await img.clone().webp({ quality: 72 }).toBuffer()
      const blur = await img.clone().resize(24, null).blur(1.2).webp({ quality: 40 }).toBuffer()
      writeFileSync(`${OUT}/${name}.avif`, avif)
      writeFileSync(`${OUT}/${name}.webp`, webp)
      manifest[scene.id][vp] = {
        avif: `/posters/${name}.avif`,
        webp: `/posters/${name}.webp`,
        width,
        height,
        placeholder: `data:image/webp;base64,${blur.toString('base64')}`,
        mouth,
        ...(before[scene.id]?.[vp]?.video && { video: before[scene.id][vp].video }),
      }
      console.log(
        `${name}: ${width}x${height}  avif ${Math.round(avif.length / 1024)} KB  webp ${Math.round(webp.length / 1024)} KB`,
      )
    }
  }
  await browser.close()
  if (!OUT_DIR) writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
