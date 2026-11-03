import { fileURLToPath } from 'node:url'
import type { Plugin } from 'vite'

// The inner pages share one entry (src/pages/main.tsx) that imports the page's own chunk at run time
// (src/pages/PageRouter.tsx), so the browser only learns about that chunk once the entry has downloaded and run: a
// second round trip before anything can render. At build time this plugin adds <link rel="modulepreload"> (JS) and
// <link rel="preload" as="style"> (CSS) for the page named in <body data-page>, so it downloads alongside the entry.
// Keep PAGE_MODULES in step with PageRouter.tsx; an unknown page or module only skips the hints (with a warning).

const src = (path: string) => fileURLToPath(new URL(`../src/${path}`, import.meta.url))

const PAGE_MODULES: Record<string, string[]> = {
  about: ['pages/about/AboutPage.tsx'],
  ai: ['pages/ai/AiPage.tsx'],
  technology: ['pages/technology/TechnologyPage.tsx'],
  portfolio: ['pages/portfolio/PortfolioPage.tsx'],
  pricing: ['pages/pricing/PricingPage.tsx'],
  website: ['pages/website/WebsitePage.tsx'],
  services: ['pages/services/ServicesPage.tsx'],
  notfound: ['pages/notfound/NotFoundPage.tsx'],
  legal: ['pages/legal/LegalPage.tsx', 'content/sitemap.ts'],
  system: ['pages/systems/SystemPage.tsx'],
}

// Each entry (src/main.tsx, src/pages/main.tsx, src/contact/main.tsx) only waits for the first paint and then imports
// its app (boot.tsx), so the app's chunks are hinted here too: they download with the HTML's stylesheets and run once
// the page has painted.
const BOOT = { inner: 'pages/boot.tsx', home: 'boot.tsx', contact: 'contact/boot.tsx' }

type Chunk = {
  type: 'chunk'
  fileName: string
  facadeModuleId: string | null
  imports: string[]
  viteMetadata?: { importedCss: Set<string> }
}

export function pagePreloadPlugin(): Plugin {
  return {
    name: 'page-preload',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        if (!ctx.bundle) return html
        const page = html.match(/<body[^>]*\sdata-page="([^"]+)"/)?.[1]
        let modules: string[]
        // The home page paints its preloader from the HTML, so its scripts can yield to the stylesheets and fonts
        // (the prerendered pages get the same in scripts/vite-prerender.ts).
        const home = !page && /(^|\/)index\.html$/.test(ctx.filename)
        if (page) modules = [BOOT.inner, ...(PAGE_MODULES[page.split(':')[0]] ?? [])]
        else if (home) modules = [BOOT.home]
        else if (/contact-us\.html$/.test(ctx.filename)) modules = [BOOT.contact]
        else return html
        const chunks = Object.values(ctx.bundle).filter((c) => c.type === 'chunk') as unknown as Chunk[]
        const byName = new Map(chunks.map((c) => [c.fileName, c]))
        const js = new Set<string>()
        const css = new Set<string>()
        const walk = (c: Chunk) => {
          if (js.has(c.fileName)) return
          js.add(c.fileName)
          c.viteMetadata?.importedCss.forEach((f) => css.add(f))
          c.imports.forEach((f) => {
            const dep = byName.get(f)
            if (dep) walk(dep)
          })
        }
        for (const m of modules) {
          const chunk = chunks.find((c) => c.facadeModuleId === src(m))
          if (chunk) walk(chunk)
          else console.warn(`[page-preload] no chunk for ${m} (${ctx.filename})`)
        }
        // Skip what the entry already links (its own static imports and stylesheets).
        const fresh = (f: string) => !html.includes(`/${f}"`)
        return [
          ...[...js].filter(fresh).map((f) => ({
            tag: 'link',
            // data-app marks the app's chunks (as opposed to the entry's own imports) for scripts/vite-prerender.ts.
            attrs: {
              rel: 'modulepreload',
              crossorigin: true,
              href: `/${f}`,
              'data-app': true,
              ...(home && { fetchpriority: 'low' }),
            },
            injectTo: 'head' as const,
          })),
          ...[...css].filter(fresh).map((f) => ({
            tag: 'link',
            attrs: { rel: 'preload', as: 'style', crossorigin: true, href: `/${f}` },
            injectTo: 'head' as const,
          })),
        ]
      },
    },
  }
}
