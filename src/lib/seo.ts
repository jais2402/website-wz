// Pure builders for head tags, JSON-LD, sitemap.xml and llms.txt. Data lives in content/seo.ts; the Vite plugin
// (scripts/vite-seo.ts) only wires these into the build. No DOM, no Node APIs: runs in Vitest, Vite and plain Node.
import type { SeoData, SeoPage, SeoSite } from '../content/seo.ts'

type Json = Record<string, unknown>

/** Escapes text for HTML content and double-quoted attributes. */
export function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

/** Escapes text for XML content. */
export function escapeXml(s: string) {
  return escapeHtml(s).replace(/'/g, '&apos;')
}

/** Absolute URL on the canonical origin: '/' keeps its slash, every other path loses a trailing one. */
export function absoluteUrl(origin: string, path: string) {
  if (/^https?:\/\//.test(path)) return path
  const base = origin.replace(/\/+$/, '')
  const clean = `/${path.replace(/^\/+/, '')}`.replace(/(.)\/+$/, '$1')
  return `${base}${clean}`
}

/**
 * JSON for an inline <script>: `<`, `>` and `&` become \u escapes (so `</script>` or `<!--` in copy cannot end the
 * block), as do U+2028/2029. The result still parses to the same value.
 */
export function safeJson(value: unknown) {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
}

export function jsonLdScript(value: unknown) {
  return `<script type="application/ld+json">${safeJson(value)}</script>`
}

/** Finds the page for an HTML entry ('index.html', 'systems/people.html', with or without a leading slash). */
export function pageForFile(pages: SeoPage[], file: string) {
  const f = file.replace(/\\/g, '/').replace(/^\/+/, '')
  return pages.find((p) => p.file === f)
}

export const ogImagePath = (page: SeoPage) => `/og/${page.id}.png`

const ids = (site: SeoSite) => ({
  org: `${absoluteUrl(site.origin, '/')}#org`,
  website: `${absoluteUrl(site.origin, '/')}#website`,
})

/** Head tags for one page (title, description, canonical, robots, Open Graph, Twitter, icons, JSON-LD). */
export function headTags(page: SeoPage, site: SeoSite, data: SeoData, opts: { appleTouchIcon?: boolean } = {}) {
  const url = absoluteUrl(site.origin, page.path)
  const image = absoluteUrl(site.origin, ogImagePath(page))
  const ogTitle = page.ogTitle ?? page.title
  const ogDescription = page.ogDescription ?? page.description
  const imageAlt = `${page.card.title} | ${site.name}`
  const a = escapeHtml
  const tags = [
    `<title>${a(page.title)}</title>`,
    `<meta name="description" content="${a(page.description)}" />`,
    `<meta name="robots" content="${page.indexable ? 'index, follow, max-image-preview:large' : 'noindex, follow'}" />`,
    // A noindex page has no canonical: it should not point search engines anywhere.
    page.indexable ? `<link rel="canonical" href="${a(url)}" />` : '',
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${a(site.name)}" />`,
    `<meta property="og:locale" content="${a(site.locale)}" />`,
    `<meta property="og:title" content="${a(ogTitle)}" />`,
    `<meta property="og:description" content="${a(ogDescription)}" />`,
    `<meta property="og:url" content="${a(url)}" />`,
    `<meta property="og:image" content="${a(image)}" />`,
    `<meta property="og:image:type" content="image/png" />`,
    `<meta property="og:image:width" content="${site.ogImage.width}" />`,
    `<meta property="og:image:height" content="${site.ogImage.height}" />`,
    `<meta property="og:image:alt" content="${a(imageAlt)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${a(ogTitle)}" />`,
    `<meta name="twitter:description" content="${a(ogDescription)}" />`,
    `<meta name="twitter:image" content="${a(image)}" />`,
    `<meta name="twitter:image:alt" content="${a(imageAlt)}" />`,
    opts.appleTouchIcon ? `<link rel="apple-touch-icon" href="${a(site.appleTouchIcon)}" />` : '',
    page.indexable ? jsonLdScript(jsonLd(page, site, data)) : '',
  ]
  return tags.filter(Boolean)
}

// Tags headTags() owns. Removed from the source HTML first so nothing is duplicated.
const OWNED = [
  /[ \t]*<title>[\s\S]*?<\/title>[ \t]*\r?\n?/gi,
  /[ \t]*<meta\s+(?:name|property)="(?:description|robots|og:[^"]*|twitter:[^"]*)"[^>]*>[ \t]*\r?\n?/gi,
  /[ \t]*<link\s+rel="(?:canonical|apple-touch-icon)"[^>]*>[ \t]*\r?\n?/gi,
  /[ \t]*<script\s+type="application\/ld\+json">[\s\S]*?<\/script>[ \t]*\r?\n?/gi,
]

export function stripOwnedTags(html: string) {
  return OWNED.reduce((h, re) => h.replace(re, ''), html)
}

/** Replaces the owned head tags in an HTML document with the generated ones (inserted before </head>). */
export function applyHead(html: string, tags: string[]) {
  const stripped = stripOwnedTags(html)
  let i = stripped.search(/<\/head>/i)
  if (i < 0) throw new Error('seo: no </head> in HTML')
  // Insert at the start of the </head> line, so the block keeps its own indentation.
  const lineStart = stripped.lastIndexOf('\n', i) + 1
  if (!stripped.slice(lineStart, i).trim()) i = lineStart
  const block = tags.map((t) => `    ${t}\n`).join('')
  return `${stripped.slice(0, i)}${block}${stripped.slice(i)}`
}

/** The page's JSON-LD @graph: the company on every page, plus page, breadcrumb, FAQ and Service nodes. */
export function jsonLd(page: SeoPage, site: SeoSite, data: SeoData): Json {
  const id = ids(site)
  const url = absoluteUrl(site.origin, page.path)
  const org = { '@id': id.org }
  const areaServed = site.areaServed.map((name) => ({ '@type': 'Country', name }))
  const graph: Json[] = []

  graph.push({
    '@type': ['Organization', 'ProfessionalService'],
    '@id': id.org,
    name: site.name,
    legalName: site.legalName,
    url: absoluteUrl(site.origin, '/'),
    logo: {
      '@type': 'ImageObject',
      url: absoluteUrl(site.origin, site.logo.path),
      width: site.logo.width,
      height: site.logo.height,
    },
    image: absoluteUrl(site.origin, '/og/home.png'),
    description: site.summary,
    foundingDate: site.foundingDate,
    email: site.email,
    telephone: site.telephone,
    address: { '@type': 'PostalAddress', ...site.address },
    areaServed,
    knowsAbout: site.knowsAbout,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'sales',
      telephone: site.telephone,
      email: site.email,
      availableLanguage: ['English'],
      areaServed,
    },
    ...(site.sameAs.length ? { sameAs: site.sameAs } : {}),
  })

  if (page.id === 'home') {
    graph.push({
      '@type': 'WebSite',
      '@id': id.website,
      url: absoluteUrl(site.origin, '/'),
      name: site.name,
      description: page.description,
      inLanguage: site.language,
      publisher: org,
    })
  }

  const services = serviceNodes(page, site, data)
  const pageType = page.schema === 'Service' ? 'WebPage' : page.schema
  const webPage: Json = {
    '@type': pageType,
    '@id': `${url}#webpage`,
    url,
    name: page.title,
    description: page.description,
    inLanguage: site.language,
    isPartOf: { '@id': id.website },
    publisher: org,
    primaryImageOfPage: { '@type': 'ImageObject', url: absoluteUrl(site.origin, ogImagePath(page)) },
  }
  if (page.breadcrumb.length) webPage.breadcrumb = { '@id': `${url}#breadcrumb` }
  if (page.schema === 'AboutPage' || page.schema === 'ContactPage') webPage.mainEntity = org
  if (page.id === 'home') webPage.about = org
  if (services.length === 1) webPage.mainEntity = { '@id': services[0]['@id'] }
  if (services.length > 1) webPage.mainEntity = services.map((s) => ({ '@id': s['@id'] }))
  if (page.id === 'services') webPage.mainEntity = { '@id': `${url}#systems` }
  graph.push(webPage)

  if (page.breadcrumb.length) {
    graph.push({
      '@type': 'BreadcrumbList',
      '@id': `${url}#breadcrumb`,
      itemListElement: page.breadcrumb.map((c, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: c.name,
        item: absoluteUrl(site.origin, c.path),
      })),
    })
  }

  if (page.id === 'home' && data.faq.length) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${url}#faq`,
      isPartOf: { '@id': `${url}#webpage` },
      mainEntity: data.faq.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    })
  }

  if (page.id === 'services') {
    graph.push({
      '@type': 'ItemList',
      '@id': `${url}#systems`,
      name: 'The systems we build',
      numberOfItems: data.systems.length,
      itemListElement: data.systems.map((s, i) => {
        const sUrl = absoluteUrl(site.origin, `/systems/${s.slug}`)
        return {
          '@type': 'ListItem',
          position: i + 1,
          url: sUrl,
          item: {
            '@type': 'Service',
            '@id': `${sUrl}#service`,
            name: s.title,
            description: s.intro,
            url: sUrl,
            provider: org,
          },
        }
      }),
    })
  }

  graph.push(...services)
  return { '@context': 'https://schema.org', '@graph': graph }
}

function offerCatalog(name: string, items: { name: string; description: string }[]): Json {
  return {
    '@type': 'OfferCatalog',
    name,
    itemListElement: items.map((it) => ({
      '@type': 'Offer',
      itemOffered: { '@type': 'Service', name: it.name, description: it.description },
    })),
  }
}

/** Service nodes: one per system page, two on /ai (AI in your systems, custom AI solutions). */
function serviceNodes(page: SeoPage, site: SeoSite, data: SeoData): Json[] {
  if (page.schema !== 'Service') return []
  const url = absoluteUrl(site.origin, page.path)
  const id = ids(site)
  const base = {
    '@type': 'Service',
    provider: { '@id': id.org },
    areaServed: site.areaServed.map((name) => ({ '@type': 'Country', name })),
    url,
  }
  if (page.system) {
    const sys = data.systems.find((s) => s.slug === page.system)
    if (!sys) return []
    const modules = Object.entries(sys.modules).map(([name, description]) => ({ name, description }))
    return [
      {
        ...base,
        '@id': `${url}#service`,
        name: page.serviceName ?? sys.title,
        serviceType: `${sys.title} systems`,
        description: sys.intro,
        hasOfferCatalog: offerCatalog(`${sys.title} modules`, modules),
      },
    ]
  }
  return data.ai.ways.map((w) => ({
    ...base,
    '@id': `${url}#${w.key}`,
    name: w.title,
    serviceType: 'AI automation',
    description: w.text,
    ...(data.ai.offers[w.key]?.length ? { hasOfferCatalog: offerCatalog(w.title, data.ai.offers[w.key]) } : {}),
  }))
}

/** sitemap.xml for every indexable page. `lastmod` is a YYYY-MM-DD date. */
export function sitemapXml(pages: SeoPage[], site: SeoSite, lastmod: string) {
  const urls = pages
    .filter((p) => p.indexable)
    .map(
      (p) =>
        `  <url>\n    <loc>${escapeXml(absoluteUrl(site.origin, p.path))}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`,
    )
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`
}

const LLMS_SECTIONS = ['Systems', 'AI', 'Company', 'Contact'] as const

/** llms.txt (llmstxt.org): H1 name, blockquote summary, key facts, then sections of links. */
export function llmsTxt(pages: SeoPage[], site: SeoSite, data: SeoData) {
  const address = [
    site.address.streetAddress,
    `${site.address.addressLocality}, ${site.address.addressRegion} ${site.address.postalCode}`,
    'India',
  ].join(', ')
  const lines = [
    `# ${site.name}`,
    '',
    `> ${site.summary}`,
    '',
    `- Legal name: ${site.legalName}`,
    `- Founded: ${site.foundingDate}, in Chennai, India`,
    `- Head office: ${address}`,
    `- Phone: ${site.telephone}`,
    `- Email: ${site.email}`,
    `- Countries served: ${site.areaServed.join(', ')}`,
    `- What we build: custom business systems (${data.systems.map((s) => s.title).join(', ')}), plus AI workflows and custom AI solutions`,
    `- How we price: ${site.pricing}`,
    `- Website: ${absoluteUrl(site.origin, '/')}`,
  ]
  for (const section of LLMS_SECTIONS) {
    const items = pages.filter((p) => p.indexable && p.llms?.section === section)
    if (!items.length) continue
    lines.push('', `## ${section}`, '')
    for (const p of items) lines.push(`- [${p.llms!.label}](${absoluteUrl(site.origin, p.path)}): ${p.description}`)
  }
  return `${lines.join('\n')}\n`
}
