import { relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { type Plugin, type ViteDevServer, runnerImport } from 'vite'

// Puts a semantic HTML snapshot of each page's real copy (src/lib/snapshot.ts) inside <div id="root">, so crawlers
// that do not run JavaScript read the page. React's createRoot replaces it on load.
//
// For JS users the snapshot is visually hidden from the first paint: an inline head script adds `js` to <html> and an
// inline style clips `.js .snapshot`. No-JS visitors and crawlers get it in plain view; it is removed (not hidden)
// once React renders, so screen readers never meet it twice. If the app has not replaced it after a few seconds
// (a failed chunk, a script error), the script drops the class so the copy shows instead of a blank page.

type SnapshotModule = typeof import('../src/lib/snapshot.ts')

const SNAPSHOT = fileURLToPath(new URL('../src/lib/snapshot.ts', import.meta.url))
const ROOT_DIV = /<div id="root">\s*<\/div>/

// vercel.json allows this script by its sha256 in the Content-Security-Policy (api/_vercel.test.ts checks it).
export const HEAD_SCRIPT =
  "document.documentElement.classList.add('js');setTimeout(function(){if(document.querySelector('#root>.snapshot'))document.documentElement.classList.remove('js')},6000)"

// Minimal reading styles for no-JS visitors (the site CSS still applies), and the visually-hidden rule for JS users.
// The boot preloader (home only) is for JS users: no-JS visitors, and the fallback above, get the snapshot instead.
const HEAD_STYLE =
  'html:not(.js) #root>.preloader{display:none}' +
  '.snapshot{max-width:72rem;margin:0 auto;padding:2rem 1.25rem;line-height:1.6}' +
  '.snapshot a{color:inherit}' +
  '.js .snapshot{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;' +
  'clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap;border:0}'

export function snapshotPlugin(): Plugin {
  let root = process.cwd()
  let server: ViteDevServer | undefined
  let built: Promise<SnapshotModule> | undefined

  // Dev: through the dev server, so copy edits show on the next reload without restarting Vite (and the content files
  // never become config dependencies). Build: Vite's module runner, loaded once without the project config.
  const load = (): Promise<SnapshotModule> => {
    if (server) return server.ssrLoadModule(SNAPSHOT) as Promise<SnapshotModule>
    built ??= runnerImport<SnapshotModule>(SNAPSHOT, { configFile: false, root, logLevel: 'error' }).then(
      (r) => r.module,
    )
    return built
  }

  return {
    name: 'html-snapshot',
    configResolved(config) {
      root = config.root
    },
    configureServer(s) {
      server = s
    },
    transformIndexHtml: {
      order: 'pre',
      async handler(html, ctx) {
        if (!ROOT_DIV.test(html)) return html
        const mod = await load()
        const id = mod.pageForFile(relative(root, ctx.filename))
        const body = id && mod.snapshot(id)
        if (!body) return html
        // The home preloader goes first, so it paints from the HTML before any script has run.
        const boot = (id && mod.bootPreloader(id)) || ''
        return {
          html: html.replace(ROOT_DIV, () => `<div id="root">${boot}${body}</div>`),
          tags: [
            { tag: 'script', children: HEAD_SCRIPT, injectTo: 'head' },
            { tag: 'style', children: HEAD_STYLE, injectTo: 'head' },
          ],
        }
      },
    },
  }
}
