// The video studio's back end (studio.html, dev server only): runs the capture scripts with the settings picked in
// the studio and reports their progress. Not part of the build or the preview server. Recordings go to
// captures/studio/ (scratch the site never reads); the site's own files in public/posters are never touched.
//
//   POST /__studio/record  { threads, speed, dpr, glow, cam, seconds, crf, desktop, mobile, only, poster }
//   POST /__studio/stop
//   GET  /__studio/status  → { running, log, error, files }
//   GET  /__studio/file/<name>  → a recorded file

import { type ChildProcess, spawn } from 'node:child_process'
import { createReadStream, existsSync, statSync } from 'node:fs'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { join } from 'node:path'
import type { Plugin, ViteDevServer } from 'vite'

const OUT = 'captures/studio'
const TYPES: Record<string, string> = { mp4: 'video/mp4', webm: 'video/webm', avif: 'image/avif', webp: 'image/webp' }

type Job = { running: boolean; log: string[]; error: string | null; child: ChildProcess | null }

const FILES = [
  'hero-desktop.mp4',
  'hero-desktop.webm',
  'hero-mobile.mp4',
  'hero-mobile.webm',
  'hero-desktop.avif',
  'hero-mobile.avif',
]

// Every value goes to the scripts as a separate argument (no shell), clamped to a sane range.
function num(v: unknown, lo: number, hi: number, def: number) {
  const n = Number(v)
  return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : def
}

function body(req: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve) => {
    let raw = ''
    req.on('data', (c) => (raw += c))
    req.on('end', () => {
      try {
        resolve(JSON.parse(raw || '{}'))
      } catch {
        resolve({})
      }
    })
  })
}

function json(res: ServerResponse, status: number, data: unknown) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(data))
}

export function studioPlugin(): Plugin {
  const job: Job = { running: false, log: [], error: null, child: null }
  const push = (text: string) => {
    for (const line of text.split('\n')) {
      // ffmpeg's encoder banner is noise in the studio log.
      if (line.trim() && !line.startsWith('Svt[')) job.log.push(line)
    }
    if (job.log.length > 400) job.log.splice(0, job.log.length - 400)
  }

  const run = (root: string, script: string, args: string[]) =>
    new Promise<void>((resolve, reject) => {
      push(`$ node ${script} ${args.join(' ')}`)
      const child = spawn(process.execPath, [join(root, script), ...args], { cwd: root })
      job.child = child
      child.stdout.on('data', (d) => push(String(d)))
      child.stderr.on('data', (d) => push(String(d)))
      child.on('close', (code, signal) => {
        job.child = null
        if (code === 0) resolve()
        else reject(new Error(signal ? `stopped (${signal})` : `${script} exited with code ${code}`))
      })
    })

  return {
    name: 'video-studio',
    apply: 'serve',
    configureServer(server: ViteDevServer) {
      const root = server.config.root
      const base = () => (server.resolvedUrls?.local[0] ?? 'http://localhost:5173/').replace(/\/$/, '')

      server.middlewares.use('/__studio/status', (_req, res) => {
        const files = FILES.map((name) => {
          const path = join(root, OUT, name)
          if (!existsSync(path)) return { name, kb: 0, mtime: 0 }
          const s = statSync(path)
          return { name, kb: Math.round(s.size / 1024), mtime: s.mtimeMs }
        })
        json(res, 200, { running: job.running, log: job.log, error: job.error, files })
      })

      server.middlewares.use('/__studio/file/', (req, res) => {
        // Only the known file names: nothing else in the folder (or outside it) can be read.
        const name = decodeURIComponent((req.url ?? '').replace(/^\//, '').split('?')[0])
        const path = join(root, OUT, name)
        if (!FILES.includes(name) || !existsSync(path)) return json(res, 404, { error: 'Not found' })
        const size = statSync(path).size
        const type = TYPES[name.split('.').pop() ?? ''] ?? 'application/octet-stream'
        // Videos need byte ranges to seek and loop.
        const range = /bytes=(\d*)-(\d*)/.exec(req.headers.range ?? '')
        if (range) {
          const start = range[1] ? Number(range[1]) : 0
          const end = range[2] ? Math.min(Number(range[2]), size - 1) : size - 1
          res.writeHead(206, {
            'Content-Type': type,
            'Content-Range': `bytes ${start}-${end}/${size}`,
            'Content-Length': end - start + 1,
            'Accept-Ranges': 'bytes',
          })
          createReadStream(path, { start, end }).pipe(res)
          return
        }
        res.writeHead(200, { 'Content-Type': type, 'Content-Length': size, 'Accept-Ranges': 'bytes' })
        createReadStream(path).pipe(res)
      })

      server.middlewares.use('/__studio/stop', (req, res) => {
        if (req.method !== 'POST') return json(res, 405, { error: 'POST only' })
        job.child?.kill('SIGTERM')
        json(res, 200, { ok: true })
      })

      server.middlewares.use('/__studio/record', async (req, res) => {
        if (req.method !== 'POST') return json(res, 405, { error: 'POST only' })
        if (job.running) return json(res, 409, { error: 'A recording is already running' })
        const b = await body(req)
        const threads = num(b.threads, 0.1, 1, 1)
        const dpr = num(b.dpr, 0.5, 3, 2)
        const glow = String(num(b.glow, 0.25, 4, 1))
        const cam = String(num(b.cam, 0, 1, 0))
        const only = b.only === 'desktop' || b.only === 'mobile' ? b.only : ''
        const video = [
          '--url',
          base(),
          '--threads',
          String(threads),
          '--speed',
          String(num(b.speed, 0.1, 2, 1)),
          '--dpr',
          String(dpr),
          '--glow',
          glow,
          '--cam',
          cam,
          '--out',
          OUT,
          '--seconds',
          String(num(b.seconds, 2, 20, 10)),
          '--crf',
          String(Math.round(num(b.crf, 20, 45, 30))),
          '--desktop',
          String(Math.round(num(b.desktop, 640, 2560, 1920))),
          '--mobile',
          String(Math.round(num(b.mobile, 390, 1170, 780))),
          ...(only ? ['--only', only] : []),
        ]
        const poster = ['--url', base(), '--threads', String(threads), '--dpr', String(dpr), '--glow', glow]
        poster.push('--cam', cam, '--out', OUT)

        job.running = true
        job.error = null
        job.log = []
        json(res, 202, { ok: true })
        try {
          // The still first: it is what shows before the video plays, so it should be the same scene.
          if (b.poster !== false) await run(root, 'scripts/capture-posters.mjs', poster)
          await run(root, 'scripts/capture-hero-video.mjs', video)
          push('Done.')
        } catch (e) {
          job.error = e instanceof Error ? e.message : String(e)
          push(`Failed: ${job.error}`)
        } finally {
          job.running = false
        }
      })
    },
  }
}
