// Vite plugin: per-page <head> (title, description, canonical, robots, Open Graph, Twitter, JSON-LD) from
// src/content/seo.ts, plus sitemap.xml and llms.txt in the build output (served from memory in dev).
import { existsSync } from 'node:fs'
import { relative, resolve } from 'node:path'
import type { Plugin } from 'vite'
import { pages, seoData, site } from '../src/content/seo.ts'
import { applyHead, headTags, llmsTxt, pageForFile, sitemapXml } from '../src/lib/seo.ts'

export function seo(): Plugin {
  let root = process.cwd()
  let publicDir = resolve(root, 'public')
  const hasAppleIcon = () => existsSync(resolve(publicDir, site.appleTouchIcon.replace(/^\//, '')))
  const files = () => ({
    'sitemap.xml': sitemapXml(pages, site, new Date().toISOString().slice(0, 10)),
    'llms.txt': llmsTxt(pages, site, seoData),
  })

  return {
    name: 'wezigns-seo',
    configResolved(config) {
      root = config.root
      publicDir = config.publicDir || resolve(root, 'public')
    },
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        const file = relative(root, ctx.filename)
        const page = pageForFile(pages, file)
        if (!page) {
          console.warn(`[wezigns-seo] no page in src/content/seo.ts for ${file}; head left as is`)
          return html
        }
        return applyHead(html, headTags(page, site, seoData, { appleTouchIcon: hasAppleIcon() }))
      },
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const name = req.url?.split('?')[0].replace(/^\//, '') as keyof ReturnType<typeof files>
        const body = name ? files()[name] : undefined
        if (body === undefined) return next()
        res.setHeader('Content-Type', name.endsWith('.xml') ? 'application/xml' : 'text/plain; charset=utf-8')
        res.end(body)
      })
    },
    generateBundle() {
      for (const [fileName, source] of Object.entries(files())) this.emitFile({ type: 'asset', fileName, source })
    },
  }
}
