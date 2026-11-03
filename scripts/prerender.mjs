// Renders the inner pages to static HTML at build time (run by scripts/vite-prerender.ts in a child process).
//
// Usage: node scripts/prerender.mjs <page id>... → prints {"<page id>": "<html>"} as JSON on stdout.
// Page ids are the <body data-page> values (about, system:people, legal:privacy…) plus `contact`.
//
// The components are written for the browser, so they run here inside a jsdom window (no layout, no WebGL): they
// render what a browser without WebGL renders on its first pass, which is what the client's first render shows
// too before any effect has run. A page that fails to render is left out (the build then ships it without a
// prerender, exactly as before) and the error goes to stderr.

import { JSDOM, VirtualConsole } from 'jsdom'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const root = fileURLToPath(new URL('..', import.meta.url))
const ids = process.argv.slice(2)

// jsdom's "not implemented" notices (canvas getContext and the like) are expected here.
const virtualConsole = new VirtualConsole()
const dom = new JSDOM('<!doctype html><html><head></head><body><div id="root"></div></body></html>', {
  url: 'https://www.wezigns.com/',
  pretendToBeVisual: true,
  virtualConsole,
})
const w = dom.window
// No media query matches: no reduced motion, no fine pointer, no particular width.
w.matchMedia = (media) => ({
  matches: false,
  media,
  onchange: null,
  addEventListener() {},
  removeEventListener() {},
  addListener() {},
  removeListener() {},
  dispatchEvent: () => false,
})
const globals = [
  'window',
  'document',
  'navigator',
  'location',
  'localStorage',
  'sessionStorage',
  'HTMLElement',
  'HTMLCanvasElement',
  'Element',
  'Node',
  'SVGElement',
  'getComputedStyle',
  'matchMedia',
  'requestAnimationFrame',
  'cancelAnimationFrame',
]
for (const key of globals) Object.defineProperty(globalThis, key, { value: w[key], configurable: true, writable: true })

// Only for module evaluation: the jsx transform comes from tsconfig, CSS imports resolve to nothing.
const server = await createServer({
  root,
  configFile: false,
  logLevel: 'error',
  appType: 'custom',
  server: { middlewareMode: true, hmr: false, watch: null },
  resolve: { alias: { '@': `${root}src` } },
  define: { 'import.meta.env.VITE_VERCEL_ENV': JSON.stringify(process.env.VERCEL_ENV ?? '') },
})

// Each page's own URL, so whatever reads window.location while rendering (the nav's current-page mark) matches.
const PATHS = {
  contact: '/contact-us',
  about: '/about-us',
  services: '/our-services',
  notfound: '/404',
  'legal:privacy': '/privacy-policy',
  'legal:terms': '/terms-and-conditions',
  'legal:cookies': '/cookie-policy',
}
const pathFor = (id) => PATHS[id] ?? (id.startsWith('system:') ? `/systems/${id.slice(7)}` : `/${id}`)

const out = {}
try {
  const { createElement, StrictMode } = await import('react')
  const { renderToString } = await import('react-dom/server')
  for (const id of ids) {
    try {
      // Fresh modules per page: some read the location once, when they are first evaluated.
      dom.reconfigure({ url: `https://www.wezigns.com${pathFor(id)}` })
      server.moduleGraph.invalidateAll()
      const { loadPage } = await server.ssrLoadModule('/src/pages/PageRouter.tsx')
      let page
      if (id === 'contact')
        page = createElement((await server.ssrLoadModule('/src/contact/ContactPage.tsx')).ContactPage)
      else page = await loadPage(id)
      if (!page) throw new Error('unknown page')
      out[id] = renderToString(createElement(StrictMode, null, page))
    } catch (err) {
      console.error(`[prerender] ${id}: ${err instanceof Error ? err.message : err}`)
    }
  }
} finally {
  await server.close()
}
// Exit once the output is flushed (a pipe is written asynchronously): timers started by the page modules would
// otherwise keep the process alive.
process.stdout.write(JSON.stringify(out), () => process.exit(0))
