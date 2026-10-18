/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // three.js lives in its own lazy chunk (~245 kB gzip); that size is expected.
  build: {
    chunkSizeWarningLimit: 1000,
    // Multi-page: the main site and the loom concept page.
    rolldownOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        loom: fileURLToPath(new URL('./loom.html', import.meta.url)),
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
