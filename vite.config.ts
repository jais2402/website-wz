/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { existsSync } from 'node:fs'
import { defineConfig } from 'vite'
import { seo } from './scripts/vite-seo.ts'
import { snapshotPlugin } from './scripts/vite-snapshot.ts'
import { pagePreloadPlugin } from './scripts/vite-page-preload.ts'
import { studioPlugin } from './scripts/vite-studio.ts'

const root = fileURLToPath(new URL('.', import.meta.url))
const page = (path: string) => fileURLToPath(new URL(`./${path}`, import.meta.url))

// Every shipped page. loom.html (concept B) and studio.html (the hero video studio) are internal only: served by
// `npm run dev`, not built.
const SYSTEMS = ['people', 'revenue', 'operations', 'ecommerce', 'finance', 'industry']
const INPUTS = {
  main: page('index.html'),
  contact: page('contact-us.html'),
  about: page('about-us.html'),
  services: page('our-services.html'),
  ai: page('ai.html'),
  technology: page('technology.html'),
  portfolio: page('portfolio.html'),
  pricing: page('pricing.html'),
  notFound: page('404.html'),
  privacy: page('privacy-policy.html'),
  terms: page('terms-and-conditions.html'),
  cookies: page('cookie-policy.html'),
  ...Object.fromEntries(SYSTEMS.map((s) => [`systems/${s}`, page(`systems/${s}.html`)])),
}

function cleanUrl(req: { url?: string }, _res: unknown, next: () => void) {
  const m = req.url?.match(/^(\/[a-z0-9/-]*[a-z0-9])\/?(\?.*)?$/)
  if (m && existsSync(`${root}${m[1].slice(1)}.html`)) req.url = `${m[1]}.html${m[2] ?? ''}`
  next()
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Head tags + JSON-LD + sitemap.xml/llms.txt (seo), and each page's copy as crawlable HTML in #root (snapshot).
    seo(),
    snapshotPlugin(),
    // Inner pages: preload the page's own chunk with the shared entry instead of after it.
    pagePreloadPlugin(),
    // /studio.html records the hero poster video (dev server only).
    studioPlugin(),
    {
      // Clean URLs in dev and preview, matching Vercel's cleanUrls: /contact-us → /contact-us.html,
      // /systems/people → /systems/people.html. Only rewrites when that .html page exists.
      name: 'clean-urls',
      configureServer(server) {
        server.middlewares.use(cleanUrl)
      },
      configurePreviewServer(server) {
        server.middlewares.use(cleanUrl)
      },
    },
  ],
  // three.js lives in its own lazy chunk (~245 kB gzip); that size is expected.
  build: {
    chunkSizeWarningLimit: 1000,
    rolldownOptions: {
      input: INPUTS,
      // GSAP, ScrollTrigger and Lenis get their own cacheable 'motion' chunk instead of riding in whichever
      // shared chunk imports them first (they were bundled as "EnquiryForm").
      output: {
        codeSplitting: {
          groups: [{ name: 'motion', test: /node_modules[\\/](gsap|@gsap|lenis)[\\/]/ }],
        },
      },
    },
  },
  // Vercel's build environment (production / preview), for the testing badge: shown on preview builds only.
  define: { 'import.meta.env.VITE_VERCEL_ENV': JSON.stringify(process.env.VERCEL_ENV ?? '') },
  // Honour PORT so this can run beside other local dev servers.
  server: { port: Number(process.env.PORT) || 5173 },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [fileURLToPath(new URL('./src/test/setup.ts', import.meta.url))],
  },
})
