#!/usr/bin/env node
// Rendering performance audit for the home page, against the production build in dist/.
//
//   npm run build && node scripts/perf-audit.mjs [--gpu-only | --cpu-only] [--shots <dir>] [--url <base>]
//
// Runs headless Chrome twice: with the GPU, and with --disable-gpu --use-gl=swiftshader, which reproduces a
// machine without GPU acceleration (Windows' "Microsoft Basic Render Driver"). Prints the renderer,
// idle and scrolling frame rates, frame-time percentiles and the checks from the performance spec.
// Uses the system Chrome (or PERF_CHROME=/path/to/chrome). No browser download needed.

import { spawn } from 'node:child_process'
import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from 'playwright-core'

const args = process.argv.slice(2)
const flag = (name) => args.includes(name)
const opt = (name, def) => {
  const i = args.indexOf(name)
  return i >= 0 ? args[i + 1] : def
}

const PORT = 4799
const BASE = opt('--url', `http://localhost:${PORT}`)
const SHOTS = opt('--shots', '')
const CHROME =
  process.env.PERF_CHROME ||
  ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium'].find(
    (p) => existsSync(p),
  )

// Frosted-glass surfaces: their text must stay readable against their own background.
const GLASS = [
  '.hero-glass',
  '.loom-intro',
  '.loom-phase',
  '.story-copy',
  '.glass-card',
  '.nav-inner',
  '.nav-sheet',
  '.sticky-call',
  '.cookie-banner',
]

async function startPreview() {
  if (opt('--url', '')) return null
  const child = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' })
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(BASE)
      if (r.ok) return child
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 250))
  }
  child.kill()
  throw new Error('vite preview did not start')
}

/** Runs in the page: frame stats for `ms` milliseconds, optionally while scrolling with real wheel steps. */
const measureInPage = () => {
  window.__frames = (ms) =>
    new Promise((res) => {
      const d = []
      let last = performance.now()
      const t0 = last
      const f = (t) => {
        d.push(t - last)
        last = t
        if (t - t0 < ms) requestAnimationFrame(f)
        else {
          const s = d.slice(1).sort((a, b) => a - b)
          const pct = (p) => Math.round(s[Math.min(s.length - 1, Math.floor(s.length * p))] || 0)
          res({
            fps: Math.round((s.length * 1000) / (t - t0)),
            p50: pct(0.5),
            p95: pct(0.95),
            max: Math.round(s[s.length - 1] || 0),
          })
        }
      }
      requestAnimationFrame(f)
    })
}

async function run(mode) {
  const gpu = mode === 'gpu'
  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: gpu
      ? ['--enable-gpu', '--ignore-gpu-blocklist']
      : ['--disable-gpu', '--use-gl=swiftshader', '--use-angle=swiftshader'],
  })
  const ctx = await browser.newContext({ viewport: { width: 1227, height: 705 }, deviceScaleFactor: 1.25 })
  const page = await ctx.newPage()
  await page.addInitScript(measureInPage)
  await page.goto(BASE + '/', { waitUntil: 'load' })
  await page.waitForFunction(() => !document.querySelector('.preloader'), null, { timeout: 45000 }).catch(() => {})
  await page.waitForTimeout(2500)

  const facts = await page.evaluate(() => {
    const gl =
      document.createElement('canvas').getContext('webgl2') || document.createElement('canvas').getContext('webgl')
    const ext = gl && gl.getExtension('WEBGL_debug_renderer_info')
    return {
      renderer: ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : gl ? '(hidden)' : '(no WebGL)',
    }
  })
  const idle = await page.evaluate(() => window.__frames(4000))

  // Scrolling: real wheel steps down the page while frames are measured.
  const scrollP = page.evaluate(() => window.__frames(5000))
  for (let i = 0; i < 40; i++) {
    await page.mouse.wheel(0, 260)
    await page.waitForTimeout(110)
  }
  const scrolling = await scrollP

  // Static checks, and the canvas count sampled down the whole page.
  const checks = await page.evaluate(async (GLASS) => {
    const all = [...document.querySelectorAll('*')]
    const backdrop = all.filter((e) => {
      const s = getComputedStyle(e)
      return (
        (s.backdropFilter && s.backdropFilter !== 'none') ||
        (s.webkitBackdropFilter && s.webkitBackdropFilter !== 'none')
      )
    }).length
    const willChange = all.filter((e) => getComputedStyle(e).willChange !== 'auto').length
    // Counted once the page has settled after the wheel scroll (transitions mid-flight are not ambient work).
    await new Promise((r) => setTimeout(r, 1500))
    const running = document.getAnimations().filter((a) => a.playState === 'running').length
    let maxCanvas = 0
    const H = document.documentElement.scrollHeight
    for (let y = 0; y < H; y += Math.round(innerHeight * 0.75)) {
      window.scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 120))
      maxCanvas = Math.max(maxCanvas, document.querySelectorAll('canvas').length)
    }
    window.scrollTo(0, 0)

    // Contrast of each glass surface's own text against its own (now solid) background.
    const lum = (c) => {
      const [r, g, b] = c
        .match(/[\d.]+/g)
        .map(Number)
        .slice(0, 3)
        .map((v) => {
          v /= 255
          return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
        })
      return 0.2126 * r + 0.7152 * g + 0.0722 * b
    }
    const alpha = (c) => (c.startsWith('rgba') ? Number(c.match(/[\d.]+/g)[3]) : c === 'transparent' ? 0 : 1)
    const bgOf = (el) => {
      for (let e = el; e; e = e.parentElement) {
        const c = getComputedStyle(e).backgroundColor
        if (alpha(c) >= 0.85) return c
      }
      return 'rgb(7, 7, 12)'
    }
    const contrast = []
    for (const sel of GLASS) {
      for (const surface of document.querySelectorAll(sel)) {
        const texts = [...surface.querySelectorAll('p, h1, h2, h3, li, a, span, button, label')].filter(
          (t) => t.childNodes.length && [...t.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()),
        )
        for (const t of texts.slice(0, 6)) {
          const fg = getComputedStyle(t).color
          if (alpha(fg) < 0.5) continue
          const a = lum(fg)
          const b = lum(bgOf(t))
          const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
          contrast.push({ sel, text: t.textContent.trim().slice(0, 24), ratio: Math.round(ratio * 10) / 10 })
        }
      }
    }
    const worst = contrast.sort((a, b) => a.ratio - b.ratio).slice(0, 3)
    return {
      backdrop,
      willChange,
      running,
      canvasNow: document.querySelectorAll('canvas').length,
      maxCanvas,
      lenis: document.documentElement.classList.contains('lenis'),
      worstContrast: worst,
    }
  }, GLASS)

  if (SHOTS && gpu) {
    mkdirSync(SHOTS, { recursive: true })
    const H = await page.evaluate(() => document.documentElement.scrollHeight)
    for (const [i, f] of [0, 0.15, 0.35, 0.6, 0.9].entries()) {
      await page.evaluate((y) => window.scrollTo(0, y), Math.round(H * f))
      await page.waitForTimeout(1500)
      await page.screenshot({ path: join(SHOTS, `shot-${i}.png`) })
    }
  }

  await browser.close()
  return { mode, ...facts, idle, scrolling, ...checks }
}

const preview = await startPreview()
try {
  const modes = flag('--gpu-only') ? ['gpu'] : flag('--cpu-only') ? ['cpu'] : ['gpu', 'cpu']
  for (const m of modes) {
    const r = await run(m)
    const label = m === 'gpu' ? 'GPU' : 'no GPU (SwiftShader)'
    console.log(`\n== ${label} ==`)
    console.log(`renderer        ${r.renderer}`)
    console.log(
      `idle            ${r.idle.fps} fps   p50 ${r.idle.p50} ms   p95 ${r.idle.p95} ms   max ${r.idle.max} ms`,
    )
    console.log(
      `scrolling       ${r.scrolling.fps} fps   p50 ${r.scrolling.p50} ms   p95 ${r.scrolling.p95} ms   max ${r.scrolling.max} ms`,
    )
    console.log(`backdrop-filter ${r.backdrop} elements`)
    console.log(`will-change     ${r.willChange} elements`)
    console.log(`animations      ${r.running} running once settled`)
    console.log(`canvases        ${r.canvasNow} at top, max ${r.maxCanvas} down the page`)
    console.log(`lenis           ${r.lenis ? 'on' : 'off'}`)
    console.log(
      `worst contrast  ${r.worstContrast.map((c) => `${c.ratio}:1 ${c.sel} "${c.text}"`).join(' | ') || 'n/a'}`,
    )
  }
} finally {
  preview?.kill()
}
