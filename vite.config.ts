/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { existsSync } from 'node:fs'
import { defineConfig } from 'vite'

const root = fileURLToPath(new URL('.', import.meta.url))
const page = (path: string) => fileURLToPath(new URL(`./${path}`, import.meta.url))

// Every shipped page. loom.html (concept B) is internal only: served by `npm run dev`, not built.
const SYSTEMS = ['people', 'revenue', 'operations', 'ecommerce', 'finance', 'industry']
const INPUTS = {
  main: page('index.html'),
  contact: page('contact.html'),
  about: page('about.html'),
  ai: page('ai.html'),
  technology: page('technology.html'),
  notFound: page('404.html'),
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
    {
      // Clean URLs in dev and preview, matching Vercel's cleanUrls: /contact → /contact.html,
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
    rolldownOptions: { input: INPUTS },
  },
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
