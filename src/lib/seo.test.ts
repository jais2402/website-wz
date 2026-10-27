import { brand, countries, faq, pastWork, work } from '@/content/site'
import { pages, seoData, site } from '@/content/seo'
import {
  absoluteUrl,
  applyHead,
  escapeHtml,
  headTags,
  jsonLd,
  llmsTxt,
  pageForFile,
  safeJson,
  sitemapXml,
  stripOwnedTags,
} from './seo'

// The HTML entries, read as text (Vite's glob; no Node types in the app tsconfig).
const htmlFiles = import.meta.glob<string>(['../../*.html', '../../systems/*.html'], {
  query: '?raw',
  import: 'default',
  eager: true,
})

const page = (id: string) => pages.find((p) => p.id === id)!
const graphOf = (id: string) => jsonLd(page(id), site, seoData)['@graph'] as Record<string, unknown>[]
const typeIn = (n: Record<string, unknown>, t: string) => [n['@type']].flat().includes(t)

describe('escaping', () => {
  it('escapes HTML attribute characters', () => {
    expect(escapeHtml(`a & "b" <c>`)).toBe('a &amp; &quot;b&quot; &lt;c&gt;')
  })

  it('keeps JSON-LD from closing its script tag, and still parses back', () => {
    const value = { text: '</script><script>alert(1)</script> & <!-- \u2028' }
    const out = safeJson(value)
    expect(out).not.toMatch(/<|>|&|\u2028/)
    expect(JSON.parse(out)).toEqual(value)
  })
})

describe('absoluteUrl', () => {
  it('keeps the root slash and drops trailing slashes elsewhere', () => {
    expect(absoluteUrl('https://www.wezigns.com', '/')).toBe('https://www.wezigns.com/')
    expect(absoluteUrl('https://www.wezigns.com/', '/about-us/')).toBe('https://www.wezigns.com/about-us')
    expect(absoluteUrl('https://www.wezigns.com', 'systems/people')).toBe('https://www.wezigns.com/systems/people')
    expect(absoluteUrl('https://www.wezigns.com', 'https://x.test/a')).toBe('https://x.test/a')
  })
})

describe('page data', () => {
  const indexable = pages.filter((p) => p.indexable)

  it('uses the www origin from brand.url', () => {
    expect(site.origin).toBe('https://www.wezigns.com')
    expect(site.origin).toBe(brand.url)
  })

  it('has unique ids, files, paths, titles and descriptions', () => {
    for (const key of ['id', 'file', 'path', 'title', 'description'] as const) {
      expect(new Set(pages.map((p) => p[key])).size).toBe(pages.length)
    }
  })

  it('keeps titles ≤ 60 and descriptions 140–160 characters on indexable pages', () => {
    for (const p of indexable) {
      expect(p.title.length, p.id).toBeLessThanOrEqual(60)
      expect(p.description.length, p.id).toBeGreaterThanOrEqual(140)
      expect(p.description.length, p.id).toBeLessThanOrEqual(160)
    }
  })

  it('never mentions GST until the client confirms it', () => {
    expect(JSON.stringify(pages)).not.toMatch(/\bGST\b/)
  })

  it('noindexes only the 404 and the internal loom page', () => {
    expect(pages.filter((p) => !p.indexable).map((p) => p.id)).toEqual(['notFound', 'loom'])
  })

  it('has a breadcrumb that starts at Home and ends on the page itself for every inner indexable page', () => {
    for (const p of indexable.filter((p) => p.id !== 'home')) {
      expect(p.breadcrumb[0], p.id).toEqual({ name: 'Home', path: '/' })
      expect(p.breadcrumb.at(-1)?.path, p.id).toBe(p.path)
    }
  })

  it('matches the NAP in brand and the 11 countries', () => {
    const nap = brand.address.join(', ')
    expect(nap).toContain(site.address.postalCode)
    for (const part of site.address.streetAddress.split(', ')) expect(nap).toContain(part)
    expect(site.areaServed).toHaveLength(countries.length)
    expect(site.areaServed).toContain('United Arab Emirates')
  })

  it('keeps each HTML entry title and description in sync with seo.ts (fallback when the plugin is off)', () => {
    for (const p of pages) {
      const html = htmlFiles[`../../${p.file}`] ?? ''
      expect(html, p.file).toContain(`<title>${escapeHtml(p.title)}</title>`)
      expect(html, p.file).toContain(`<meta name="description" content="${escapeHtml(p.description)}" />`)
    }
  })
})

describe('legal pages', () => {
  const ids = ['privacy', 'terms', 'cookies']

  it('are indexable, with the agreed URLs, a two-step breadcrumb and a page type', () => {
    expect(ids.map((id) => page(id).path)).toEqual(['/privacy-policy', '/terms-and-conditions', '/cookie-policy'])
    for (const id of ids) {
      const p = page(id)
      expect(p.indexable, id).toBe(true)
      expect(p.breadcrumb, id).toHaveLength(2)
      expect(p.llms?.section, id).toBe('Legal')
    }
    expect(graphOf('privacy').some((n) => typeIn(n, 'WebPage'))).toBe(true)
  })

  it('name their page in data-page, preload the self-hosted fonts and load no Google Fonts', () => {
    const dataPage = { privacy: 'legal:privacy', terms: 'legal:terms', cookies: 'legal:cookies' }
    for (const [id, value] of Object.entries(dataPage)) {
      const html = htmlFiles[`../../${page(id).file}`] ?? ''
      expect(html, id).toContain(`<body data-page="${value}">`)
      expect(html, id).toMatch(/<link rel="preload" href="\/fonts\/[^"]+\.woff2" as="font"/)
    }
    for (const [file, html] of Object.entries(htmlFiles)) expect(html, file).not.toContain('fonts.googleapis.com')
  })

  it('there is no HTML sitemap page: the sitemap is XML only', () => {
    expect(pages.some((p) => p.path === '/sitemap' || p.file === 'sitemap.html')).toBe(false)
    expect(htmlFiles['../../sitemap.html']).toBeUndefined()
  })
})

describe('pageForFile', () => {
  it('finds pages by entry file', () => {
    expect(pageForFile(pages, '/systems/people.html')?.id).toBe('people')
    expect(pageForFile(pages, 'index.html')?.id).toBe('home')
    expect(pageForFile(pages, 'systems\\finance.html')?.id).toBe('finance')
    expect(pageForFile(pages, 'privacy-policy.html')?.id).toBe('privacy')
    expect(pageForFile(pages, 'sitemap.html')).toBeUndefined()
    expect(pageForFile(pages, 'portfolio.html')?.id).toBe('portfolio')
    expect(pageForFile(pages, 'pricing.html')?.id).toBe('pricing')
    expect(pageForFile(pages, 'nope.html')).toBeUndefined()
  })
})

describe('headTags / applyHead', () => {
  const source = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="description" content="old" />
    <meta property="og:title" content="old" />
    <meta name="twitter:card" content="summary" />
    <meta name="robots" content="noindex" />
    <meta name="theme-color" content="#07070c" />
    <title>Old</title>
  </head>
  <body><div id="root"></div></body>
</html>`

  it('replaces the owned tags once and leaves the rest alone', () => {
    const out = applyHead(source, headTags(page('people'), site, seoData))
    expect(out.match(/<title>/g)).toHaveLength(1)
    expect(out.match(/name="description"/g)).toHaveLength(1)
    expect(out.match(/name="robots"/g)).toHaveLength(1)
    expect(out).not.toContain('content="old"')
    expect(out).toContain('<meta charset="UTF-8" />')
    expect(out).toContain('name="theme-color"')
    expect(out).toContain('<body><div id="root"></div></body>')
    expect(out).toContain('<link rel="canonical" href="https://www.wezigns.com/systems/people" />')
    expect(out).toContain('<meta property="og:image" content="https://www.wezigns.com/og/people.png" />')
    expect(out).toContain('<meta name="twitter:card" content="summary_large_image" />')
    expect(out).toContain('content="index, follow, max-image-preview:large"')
    expect(out).toContain('<script type="application/ld+json">')
    // running twice is stable
    expect(applyHead(out, headTags(page('people'), site, seoData))).toBe(out)
  })

  it('noindexes the 404 page with no canonical and no JSON-LD', () => {
    const tags = headTags(page('notFound'), site, seoData).join('\n')
    expect(tags).toContain('content="noindex, follow"')
    expect(tags).not.toContain('rel="canonical"')
    expect(tags).not.toContain('ld+json')
  })

  it('adds the apple-touch-icon only when asked', () => {
    expect(headTags(page('home'), site, seoData).join('')).not.toContain('apple-touch-icon')
    expect(headTags(page('home'), site, seoData, { appleTouchIcon: true }).join('')).toContain(
      '<link rel="apple-touch-icon" href="/og/apple-touch-icon.png" />',
    )
  })

  it('stripOwnedTags removes JSON-LD and canonicals', () => {
    const html = '<head>\n<link rel="canonical" href="x" />\n<script type="application/ld+json">{}</script>\n</head>'
    expect(stripOwnedTags(html)).toBe('<head>\n</head>')
  })
})

describe('jsonLd', () => {
  it('puts one linked Organization + ProfessionalService on every indexable page', () => {
    for (const p of pages.filter((p) => p.indexable)) {
      const org = graphOf(p.id).find((n) => typeIn(n, 'Organization'))!
      expect(org['@id']).toBe('https://www.wezigns.com/#org')
      expect(typeIn(org, 'ProfessionalService')).toBe(true)
      expect(org).toMatchObject({
        legalName: 'Wezigns',
        foundingDate: '2012',
        telephone: brand.phone,
        email: brand.email,
        address: { '@type': 'PostalAddress', postalCode: '600092', addressLocality: 'Chennai', addressCountry: 'IN' },
      })
      expect(org.areaServed).toHaveLength(11)
      expect(org.sameAs).toEqual(site.sameAs)
    }
  })

  it('home has WebSite and a FAQPage with every visible question', () => {
    const g = graphOf('home')
    expect(g.some((n) => typeIn(n, 'WebSite'))).toBe(true)
    const faqNode = g.find((n) => typeIn(n, 'FAQPage'))!
    expect((faqNode.mainEntity as unknown[]).length).toBe(faq.length)
  })

  it('system pages have a Service with their modules and a three-step breadcrumb', () => {
    const g = graphOf('people')
    const service = g.find((n) => typeIn(n, 'Service'))!
    expect(service.name).toBe('Custom HR and payroll software')
    expect(service.provider).toEqual({ '@id': 'https://www.wezigns.com/#org' })
    const catalog = service.hasOfferCatalog as { itemListElement: unknown[] }
    expect(catalog.itemListElement.length).toBe(Object.keys(seoData.systems[0].modules).length)
    const crumbs = g.find((n) => typeIn(n, 'BreadcrumbList'))!.itemListElement as { item: string }[]
    expect(crumbs.map((c) => c.item)).toEqual([
      'https://www.wezigns.com/',
      'https://www.wezigns.com/our-services',
      'https://www.wezigns.com/systems/people',
    ])
  })

  it('uses AboutPage, ContactPage, CollectionPage + ItemList and two AI services', () => {
    expect(graphOf('about').some((n) => typeIn(n, 'AboutPage'))).toBe(true)
    expect(graphOf('contact').some((n) => typeIn(n, 'ContactPage'))).toBe(true)
    const services = graphOf('services')
    expect(services.some((n) => typeIn(n, 'CollectionPage'))).toBe(true)
    expect(services.find((n) => typeIn(n, 'ItemList'))!.numberOfItems).toBe(6)
    expect(graphOf('ai').filter((n) => typeIn(n, 'Service'))).toHaveLength(2)
  })
})

describe('portfolio', () => {
  const url = 'https://www.wezigns.com/portfolio'

  it('is an indexable CollectionPage at /portfolio with a Home › Our work breadcrumb', () => {
    const p = page('portfolio')
    expect(p).toMatchObject({ file: 'portfolio.html', path: '/portfolio', schema: 'CollectionPage', indexable: true })
    expect(p.breadcrumb.map((c) => c.name)).toEqual(['Home', 'Our work'])
    const crumbs = graphOf('portfolio').find((n) => typeIn(n, 'BreadcrumbList'))!.itemListElement as { item: string }[]
    expect(crumbs.map((c) => c.item)).toEqual(['https://www.wezigns.com/', url])
    const html = htmlFiles['../../portfolio.html'] ?? ''
    expect(html).toContain('<body data-page="portfolio">')
    expect(html).toMatch(/<link rel="preload" href="\/fonts\/[^"]+\.woff2" as="font"/)
  })

  it('lists every case in an ItemList that the page names as its main entity', () => {
    const g = graphOf('portfolio')
    const webPage = g.find((n) => typeIn(n, 'CollectionPage'))!
    expect(webPage.mainEntity).toEqual({ '@id': `${url}#cases` })
    const list = g.find((n) => typeIn(n, 'ItemList'))!
    const cases = [...work, ...pastWork]
    expect(list['@id']).toBe(`${url}#cases`)
    expect(list.numberOfItems).toBe(cases.length)
    const items = list.itemListElement as { position: number; url: string; item: { name: string; '@type': string } }[]
    expect(items.map((i) => i.url)).toEqual(cases.map((c) => `${url}#${c.id}`))
    expect(items.map((i) => i.item.name)).toEqual(cases.map((c) => c.title))
    expect(items.map((i) => i.position)).toEqual(cases.map((_, i) => i + 1))
    expect(items.every((i) => i.item['@type'] === 'CreativeWork')).toBe(true)
  })

  it('is in llms.txt', () => {
    expect(llmsTxt(pages, site, seoData)).toContain(`](${url}):`)
  })
})

describe('pricing', () => {
  const url = 'https://www.wezigns.com/pricing'

  it('is an indexable WebPage at /pricing with a Home › How pricing works breadcrumb and a canonical', () => {
    const p = page('pricing')
    expect(p).toMatchObject({ file: 'pricing.html', path: '/pricing', schema: 'WebPage', indexable: true })
    expect(p.breadcrumb.map((c) => c.name)).toEqual(['Home', 'How pricing works'])
    const crumbs = graphOf('pricing').find((n) => typeIn(n, 'BreadcrumbList'))!.itemListElement as { item: string }[]
    expect(crumbs.map((c) => c.item)).toEqual(['https://www.wezigns.com/', url])
    expect(headTags(p, site, seoData)).toContain(`<link rel="canonical" href="${url}" />`)
    const html = htmlFiles['../../pricing.html'] ?? ''
    expect(html).toContain('<body data-page="pricing">')
    expect(html).toMatch(/<link rel="preload" href="\/fonts\/[^"]+\.woff2" as="font"/)
  })

  it('is the last page, so the social cards before it keep their seeds', () => {
    expect(pages.at(-1)!.id).toBe('pricing')
  })

  it('is in llms.txt', () => {
    expect(llmsTxt(pages, site, seoData)).toContain(`](${url}):`)
  })
})

describe('sitemapXml', () => {
  it('lists only indexable pages with absolute www URLs, and lastmod only where a page has a date', () => {
    const xml = sitemapXml(pages, site, (p) => (p.id === 'privacy' ? '2026-10-19' : undefined))
    expect(xml.match(/<url>/g)).toHaveLength(17)
    expect(xml).toContain('<loc>https://www.wezigns.com/portfolio</loc>')
    expect(xml).toContain('<loc>https://www.wezigns.com/pricing</loc>')
    for (const path of ['/privacy-policy', '/terms-and-conditions', '/cookie-policy'])
      expect(xml).toContain(`<loc>https://www.wezigns.com${path}</loc>`)
    expect(xml).toContain('<loc>https://www.wezigns.com/</loc>')
    expect(xml).toContain('<loc>https://www.wezigns.com/systems/industry</loc>')
    expect(xml).not.toContain('/sitemap<')
    expect(xml).not.toContain('/404')
    expect(xml).not.toContain('/loom')
    expect(xml.match(/<lastmod>/g)).toHaveLength(1)
    expect(xml).toContain('<loc>https://www.wezigns.com/privacy-policy</loc>\n    <lastmod>2026-10-19</lastmod>')
    expect(sitemapXml(pages, site)).not.toContain('<lastmod>')
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true)
  })
})

describe('llmsTxt', () => {
  it('follows the llms.txt shape and links every indexable page', () => {
    const txt = llmsTxt(pages, site, seoData)
    expect(txt.startsWith('# Wezigns\n\n> ')).toBe(true)
    expect(txt).toContain('## Systems')
    expect(txt).toContain('## Contact')
    expect(txt).toContain('## Legal')
    expect(txt).toContain('[Privacy policy](https://www.wezigns.com/privacy-policy)')
    for (const p of pages.filter((p) => p.indexable)) {
      expect(txt).toContain(`](${absoluteUrl(site.origin, p.path)})`)
    }
    expect(txt).not.toContain('/404')
    expect(txt).toContain('+91 44 2364 3252')
  })
})

describe('social profiles', () => {
  const orgOf = (s: typeof site) =>
    (jsonLd(page('home'), s, seoData)['@graph'] as Record<string, unknown>[]).find((n) => typeIn(n, 'Organization'))!

  it('lists the company profiles as sameAs and leaves twitter:site out without a handle', () => {
    expect(orgOf(site).sameAs).toEqual([
      'https://www.linkedin.com/company/wezigns/',
      'https://www.instagram.com/wezigns',
      'https://www.facebook.com/wezigns',
    ])
    expect(headTags(page('home'), site, seoData).join('\n')).not.toContain('twitter:site')
  })

  it('leaves sameAs out when no profile is set', () => {
    const empty = {
      ...site,
      social: Object.fromEntries(Object.keys(site.social).map((k) => [k, ''])) as typeof site.social,
      get sameAs(): string[] {
        return Object.values(this.social).filter(Boolean)
      },
    }
    expect(orgOf(empty).sameAs).toBeUndefined()
  })

  it('emits the filled profiles as sameAs and the handle as twitter:site', () => {
    const filled = {
      ...site,
      social: { ...site.social, instagram: '', facebook: '', linkedin: 'https://www.linkedin.com/company/wezigns' },
      twitterHandle: 'wezigns',
      get sameAs(): string[] {
        return Object.values(this.social).filter(Boolean)
      },
    }
    expect(orgOf(filled).sameAs).toEqual(['https://www.linkedin.com/company/wezigns'])
    expect(headTags(page('home'), filled, seoData).join('\n')).toContain('<meta name="twitter:site" content="@wezigns" />')
  })
})
