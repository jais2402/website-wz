// Dev server only: answers POST /api/enquiry with the real Vercel function (api/enquiry.ts), using the settings in
// .env / .env.local (RESEND_API_KEY, GOOGLE_SHEETS_*), so the forms can be tested end to end with `npm run dev`.
// Without those settings the function answers 503 and the forms fall back to mailto, as they do in production.

import type { IncomingMessage } from 'node:http'
import { loadEnv, type Plugin } from 'vite'

const readBody = (req: IncomingMessage) =>
  new Promise<string>((resolve, reject) => {
    let data = ''
    req.on('data', (chunk) => (data += chunk))
    req.on('end', () => resolve(data))
    req.on('error', reject)
  })

export function enquiryDevApi(): Plugin {
  return {
    name: 'wezigns-enquiry-dev-api',
    apply: 'serve',
    configureServer(server) {
      // '' prefix: load every variable, not only VITE_ ones. They stay on the server; nothing reaches the browser.
      const env = loadEnv(server.config.mode, server.config.root, '')
      server.middlewares.use('/api/enquiry', async (req, res) => {
        try {
          const { handleEnquiry } = (await server.ssrLoadModule('/api/enquiry.ts')) as typeof import('../api/enquiry.ts')
          const headers = new Headers()
          for (const [k, v] of Object.entries(req.headers)) if (typeof v === 'string') headers.set(k, v)
          const body = req.method === 'POST' ? await readBody(req) : undefined
          const request = new Request(`http://${req.headers.host}/api/enquiry`, { method: req.method, headers, body })
          const response = await handleEnquiry(request, env)
          res.statusCode = response.status
          response.headers.forEach((v, k) => res.setHeader(k, v))
          res.end(await response.text())
        } catch (err) {
          server.config.logger.error(`enquiry dev api: ${err instanceof Error ? err.message : err}`)
          res.statusCode = 500
          res.end(JSON.stringify({ ok: false, error: 'dev-error' }))
        }
      })
    },
  }
}
