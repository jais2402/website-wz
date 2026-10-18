/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      // Clean URLs in dev and preview, matching Vercel's cleanUrls: /contact → /contact.html
      name: 'clean-urls',
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          if (req.url && /^\/contact\/?(\?.*)?$/.test(req.url)) req.url = req.url.replace(/^\/contact\/?/, '/contact.html')
          next()
        })
      },
      configurePreviewServer(server) {
        server.middlewares.use((req, _res, next) => {
          if (req.url && /^\/contact\/?(\?.*)?$/.test(req.url)) req.url = req.url.replace(/^\/contact\/?/, '/contact.html')
          next()
        })
      },
    },
  ],
  // three.js lives in its own lazy chunk (~245 kB gzip); that size is expected.
  build: {
    chunkSizeWarningLimit: 1000,
    rolldownOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        contact: fileURLToPath(new URL('./contact.html', import.meta.url)),
        // loom.html (concept B) is internal only: served by `npm run dev`, not shipped in production builds.
      },
    },
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
