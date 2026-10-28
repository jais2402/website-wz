#!/usr/bin/env node
// A seamless looping video of the live hero loom, for machines that show the poster instead of the live scene.
//
//   npm run dev                 (in another terminal; same as npm run posters)
//   npm run posters:video       [--url http://localhost:5173] [--seconds 10] [--speed 1] [--threads 1]
//                               [--dpr budget] [--glow 1] [--cam 0.6] [--desktop 1280] [--mobile 584] [--crf 30]
//                               [--only desktop|mobile] [--out captures/studio]
//
// Or from the studio (npm run dev, then /studio.html): the same options with sliders and a live preview.
// --threads, --speed, --dpr, --glow and --cam go to the scene as ?studio= (src/lib/studio.ts), so the recording is
// exactly the preview. --desktop / --mobile are the video widths. With --out the videos go to that folder and the
// site's files (public/posters, posters.json) are left alone: the studio always records that way.
//
// Frame-exact: Playwright takes over the page clock and pauses it, so the real scene is stepped exactly 1/30 s at a
// time and each step is screenshotted (nothing in the scenes changes, and a slow machine can't drop frames). The threads never repeat
// (unrelated wave speeds, random rider speeds), so it renders a few extra frames and blends them into the first: the
// last frame runs straight on into the first. Encodes AV1 WebM + H.264 MP4 with ffmpeg and adds them to
// src/generated/posters.json (run npm run posters first). Needs ffmpeg on the PATH and the system Chrome.

import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'
import sharp from 'sharp'

const args = process.argv.slice(2)
const opt = (name, def) => {
  const i = args.indexOf(name)
  return i >= 0 ? args[i + 1] : def
}
const BASE = opt('--url', 'http://localhost:5173')
const FPS = 30
const LOOP = Math.round(Number(opt('--seconds', '10')) * FPS)
// The seam: the end crossfades into the start over this many frames. Keep it short: during the crossfade two
// thread states overlap and the motion visibly slows (a full second read as the video stalling on every loop).
const BLEND = Number(opt('--blend', '10'))
const SPEED = Number(opt('--speed', '1'))
const THREADS = Number(opt('--threads', '1'))
const DPR = opt('--dpr', 'budget')
const CAM = opt('--cam', '')
const OUT_DIR = opt('--out', '')
const CRF = Number(opt('--crf', '30'))
const ONLY = opt('--only', '')
const STUDIO = [
  `threads:${THREADS}`,
  `speed:${SPEED}`,
  `glow:${Number(opt('--glow', '1'))}`,
  ...(DPR === 'budget' ? [] : [`dpr:${DPR}`]),
  ...(CAM === '' ? [] : [`cam:${Number(CAM)}`]),
].join(',')
const CHROME =
  process.env.PERF_CHROME ||
  ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium'].find(
    (p) => existsSync(p),
  )

const root = (p) => fileURLToPath(new URL(`../${p}`, import.meta.url))
const OUT = OUT_DIR ? root(OUT_DIR) : root('public/posters')
const MANIFEST = root('src/generated/posters.json')

// Same viewports as the posters. `size` is the video's frame (even numbers), `av1` / `h264` the CRF of each file.
// The threads are a pixel or two wide and many-coloured: encoders drop fine colour first, and much above CRF 30 the
// tangle turns grey (tested from CRF 38 up on AV1). Fewer threads (--threads) is what makes the files smaller.
const even = (n) => Math.round(n / 2) * 2
const dw = Number(opt('--desktop', '1280'))
const mw = Number(opt('--mobile', '584'))
const VIEWPORTS = {
  desktop: {
    opts: { viewport: { width: 1920, height: 1080 }, deviceScaleFactor: dw > 1920 ? 2 : 1 },
    size: [even(dw), even((dw * 1080) / 1920)],
    av1: CRF,
    h264: CRF - 8,
  },
  mobile: {
    opts: {
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: mw > 780 ? 3 : 2,
      isMobile: true,
      hasTouch: true,
    },
    size: [even(mw), even((mw * 844) / 390)],
    av1: CRF,
    h264: CRF - 8,
  },
}

async function frames(browser, opts, dir) {
  const ctx = await browser.newContext(opts)
  const page = await ctx.newPage()
  await page.clock.install()
  await page.goto(`${BASE}/?gfx=live&studio=${STUDIO}`, { waitUntil: 'load' })
  // Run the page's clock until the live loom has faded in (preloader, warm-up, frame test, camera settle).
  for (let i = 0; i < 600; i++) {
    await page.clock.runFor(100)
    if (await page.evaluate(() => !!document.querySelector('.loom-canvas.is-ready'))) break
  }
  await page.addStyleTag({
    content: 'body *{visibility:hidden!important} canvas{visibility:visible!important} *{transition:none!important}',
  })
  // install() keeps the fake clock running in real time underneath, so without a pause every screenshot's own
  // time (hundreds of ms) would be added to the frame and the video would play much faster than the scene.
  await page.clock.pauseAt((await page.evaluate(() => Date.now())) + 1000)
  const total = LOOP + BLEND
  for (let i = 0; i < total; i++) {
    await page.clock.runFor(1000 / FPS)
    await page.screenshot({ path: join(dir, `f${String(i).padStart(4, '0')}.png`) })
    if (i % 30 === 0) console.log(`  frame ${i}/${total}`)
  }
  await ctx.close()
}

/** Frame i of the loop: the first frames are the extra frames fading into the start, so the end runs into it. */
async function loopFrames(dir, size) {
  const read = (i) =>
    sharp(join(dir, `f${String(i).padStart(4, '0')}.png`))
      .resize(size[0], size[1], { fit: 'cover' })
      .removeAlpha()
      .raw()
      .toBuffer()
  const outDir = join(dir, 'loop')
  mkdirSync(outDir, { recursive: true })
  for (let i = 0; i < LOOP; i++) {
    let px = await read(i)
    if (i < BLEND) {
      const tail = await read(LOOP + i)
      const w = (i + 0.5) / BLEND
      const mixed = Buffer.alloc(px.length)
      for (let k = 0; k < px.length; k++) mixed[k] = Math.round(tail[k] * (1 - w) + px[k] * w)
      px = mixed
    }
    await sharp(px, { raw: { width: size[0], height: size[1], channels: 3 } })
      .png()
      .toFile(join(outDir, `l${String(i).padStart(4, '0')}.png`))
  }
  return join(outDir, 'l%04d.png')
}

function encode(pattern, name, av1, h264) {
  const common = ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', pattern, '-an', '-pix_fmt', 'yuv420p']
  const webm = `${OUT}/${name}.webm`
  const mp4 = `${OUT}/${name}.mp4`
  execFileSync('ffmpeg', [
    ...common,
    '-svtav1-params',
    'enable-variance-boost=1',
    '-c:v',
    'libsvtav1',
    '-preset',
    '6',
    '-crf',
    String(av1),
    '-g',
    String(LOOP),
    webm,
  ])
  execFileSync('ffmpeg', [
    ...common,
    '-c:v',
    'libx264',
    '-preset',
    'slow',
    '-crf',
    String(h264),
    '-movflags',
    '+faststart',
    mp4,
  ])
  return { webm, mp4 }
}

async function main() {
  if (!CHROME) throw new Error('No Chrome found: set PERF_CHROME=/path/to/chrome')
  execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' })
  mkdirSync(OUT, { recursive: true })
  const manifest = OUT_DIR ? null : JSON.parse(readFileSync(MANIFEST, 'utf8'))
  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--enable-gpu', '--ignore-gpu-blocklist'],
  })
  console.log(`studio ${STUDIO}`)
  for (const [vp, { opts, size, av1, h264 }] of Object.entries(VIEWPORTS)) {
    if (ONLY && ONLY !== vp) continue
    // A folder of its own, so a studio recording and npm run posters:video can run side by side.
    const dir = mkdtempSync(join(tmpdir(), `hero-video-${vp}-`))
    console.log(`hero-${vp}: capturing ${LOOP + BLEND} frames`)
    await frames(browser, opts, dir)
    const pattern = await loopFrames(dir, size)
    const { webm, mp4 } = encode(pattern, `hero-${vp}`, av1, h264)
    if (manifest)
      manifest.hero[vp].video = {
        webm: `/posters/hero-${vp}.webm`,
        mp4: `/posters/hero-${vp}.mp4`,
        width: size[0],
        height: size[1],
      }
    const kb = (f) => Math.round(statSync(f).size / 1024)
    console.log(
      `hero-${vp}: ${size.join('x')}, ${LOOP / FPS} s loop, ${STUDIO}  webm ${kb(webm)} KB  mp4 ${kb(mp4)} KB`,
    )
    rmSync(dir, { recursive: true, force: true })
  }
  await browser.close()
  if (manifest) writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n')
  else
    writeFileSync(join(OUT, 'settings.json'), JSON.stringify({ studio: STUDIO, seconds: LOOP / FPS, crf: CRF }) + '\n')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
