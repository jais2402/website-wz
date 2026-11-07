import { execFile } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import type { Plugin } from 'vite'

// Build only: the inner pages and the contact page ship their first screen as real, styled HTML, so a phone paints
// the headline as soon as the HTML and CSS arrive instead of after ~170 kB of JavaScript has downloaded and run.
//
// scripts/prerender.mjs renders each page's React tree to a string (in a child process, inside jsdom, so the
// browser-only globals it needs never leak into the Vite build). The markup goes first in <div id="root">, in a
// `display: contents` wrapper, in place of the crawlable snapshot (scripts/vite-snapshot.ts): with both, crawlers
// that do not run JavaScript read every page twice (two h1s, duplicate ids). It carries the same copy, so no-JS
// visitors and crawlers read the prerender. The client still mounts with createRoot, which replaces it on its first
// commit with the same markup (no hydration, so no mismatch to reconcile): the page looks the same, it just appears
// sooner. A page that fails to prerender keeps its snapshot. The home page is not prerendered: its preloader already
// paints from the HTML.
//
// Elements that the page animates in on scroll start in the same hidden state as on the client (data-reveal and
// SplitReveal words), so nothing shows and then hides again when React takes over.

const SCRIPT = fileURLToPath(new URL('./prerender.mjs', import.meta.url))
const ROOT_OPEN = '<div id="root">'
// The crawlable snapshot (scripts/vite-snapshot.ts), replaced by the prerender.
const SNAPSHOT = /<!--snapshot-->[\s\S]*?<!--\/snapshot-->/

// Scroll-in elements start hidden only for JS users (the app reveals them); no-JS visitors see everything.
const STYLE =
  '.prerender{display:contents}' +
  '@media (prefers-reduced-motion:no-preference){' +
  '.js .prerender [data-reveal]{opacity:0;transform:translateY(36px)}' +
  '.js .prerender .w>span{transform:translateY(110%) rotate(4deg)}}'

/** The page id for an HTML file: its <body data-page>, or `contact` for the contact page. */
function pageId(html: string, filename: string): string | null {
  const page = html.match(/<body[^>]*\sdata-page="([^"]+)"/)?.[1]
  if (page) return page
  return /contact-us\.html$/.test(filename) ? 'contact' : null
}

function render(ids: string[]): Promise<Record<string, string>> {
  return new Promise((resolve) => {
    execFile(process.execPath, [SCRIPT, ...ids], { maxBuffer: 64 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (stderr.trim()) console.warn(stderr.trim())
      if (err) {
        console.warn(`[prerender] skipped: ${err.message}`)
        resolve({})
        return
      }
      try {
        resolve(JSON.parse(stdout) as Record<string, string>)
      } catch {
        console.warn('[prerender] skipped: unreadable output')
        resolve({})
      }
    })
  })
}

export function prerenderPlugin(pages: string[]): Plugin {
  let rendered: Promise<Record<string, string>> | undefined
  return {
    name: 'prerender',
    apply: 'build',
    buildStart() {
      // Runs alongside the bundling.
      rendered = render(pages)
    },
    transformIndexHtml: {
      order: 'post',
      async handler(html, ctx) {
        const id = pageId(html, ctx.filename)
        if (!id || !html.includes(ROOT_OPEN)) return html
        const markup = (await (rendered ??= render(pages)))[id]
        if (!markup) return html
        const modules: string[] = []
        return {
          // The page's own stylesheets (hinted with rel=preload by scripts/vite-page-preload.ts, and otherwise
          // applied only once its chunk has loaded) must apply from the first paint for the markup to look right.
          html: html
            // The app's chunks are not needed for this first paint: instead of competing with the stylesheets and
            // fonts, they are listed on <body> and the entry preloads them once the page has painted
            // (src/lib/afterFirstPaint.ts).
            .replace(/\s*<link rel="modulepreload"[^>]*href="([^"]+)"[^>]*data-app[^>]*>/g, (_, href: string) => {
              modules.push(href)
              return ''
            })
            .replace(/<body([^>]*)>/, (_, attrs: string) => `<body${attrs} data-modulepreload="${modules.join(' ')}">`)
            .replace(
              /<link rel="preload" as="style"( crossorigin)? href="([^"]+\.css)">/g,
              '<link rel="stylesheet"$1 href="$2">',
            )
            .replace(ROOT_OPEN, () => `${ROOT_OPEN}<div class="prerender">${markup}</div>`)
            .replace(SNAPSHOT, ''),
          tags: [{ tag: 'style', children: STYLE, injectTo: 'head' }],
        }
      },
    },
  }
}
