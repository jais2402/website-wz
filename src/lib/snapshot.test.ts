import { legalMeta } from '@/content/legal'
import {
  aboutPage,
  aiPage,
  notFoundPage,
  portfolioPage,
  pricingPage,
  servicesPage,
  systemPages,
  systemsSection,
  websitePage,
} from '@/content/pages'
import { legalPages } from '@/content/sitemap'
import { brand, faq, loom, pastWork, portfolioArchive, pricing, process, proofSection, stats, work } from '@/content/site'
import { legalAnchor } from './legal'
import { escapeHtml, pageForFile, snapshot, snapshotPages } from './snapshot'

const html = (id: string) => {
  const out = snapshot(id)
  if (!out) throw new Error(`no snapshot for ${id}`)
  return out
}
const count = (s: string, re: RegExp) => (s.match(re) ?? []).length
const h1Text = (s: string) => s.match(/<h1>(.*?)<\/h1>/)?.[1]
const hrefs = (s: string) => [...s.matchAll(/href="([^"]*)"/g)].map((m) => m[1])

// Every page a crawler should be able to reach from any page.
const PAGES = [
  '/our-services',
  ...systemPages.map((s) => `/systems/${s.slug}`),
  '/ai',
  '/technology',
  '/portfolio',
  '/pricing',
  '/website-development',
  '/about-us',
  '/contact-us',
  '/privacy-policy',
  '/terms-and-conditions',
  '/cookie-policy',
]

describe('snapshot', () => {
  it.each(snapshotPages)('%s has one H1, a header nav, a main and a footer', (id) => {
    const s = html(id)
    expect(count(s, /<h1>/g)).toBe(1)
    expect(count(s, /<main>/g)).toBe(1)
    expect(s).toMatch(/^<div class="snapshot"><header>.*<nav aria-label="Primary">/)
    expect(s).toMatch(/<footer>.*<\/footer><\/div>$/)
  })

  it.each(snapshotPages)('%s links to every page, including Our work', (id) => {
    const links = hrefs(html(id))
    for (const href of PAGES) expect(links).toContain(href)
    // Our work is its own page now: no page sends readers to the old home-page anchor.
    expect(links).not.toContain('/#work')
  })

  it.each(snapshotPages)('%s carries the NAP and the copyright line', (id) => {
    const s = html(id)
    expect(s).toContain(escapeHtml(brand.legal))
    for (const l of brand.address) expect(s).toContain(escapeHtml(l))
    expect(s).toContain(brand.phone)
    expect(s).toContain(`href="${brand.phoneHref}"`)
    expect(s).toContain(`mailto:${brand.email}`)
    expect(s).toContain(`© 2026 ${brand.legal}`)
  })

  it('home: the hero H1, its key H2s, every FAQ and the stat values', () => {
    const s = html('home')
    expect(h1Text(s)).toBe('Every loose thread, woven into one system.')
    for (const h of [
      loom.weave.title,
      'Simplify.',
      proofSection.title,
      'Every corner of the business, connected.',
      'Our Work',
      'Priced on outcomes, not hours.',
      'Straight answers.',
      'Hand us the tangle.',
    ])
      expect(s).toContain(`<h2>${escapeHtml(h)}</h2>`)
    for (const f of faq) {
      expect(s).toContain(`<h3>${escapeHtml(f.q)}</h3>`)
      expect(s).toContain(escapeHtml(f.a))
    }
    expect(stats.map((x) => `${x.value}${x.suffix}`)).toEqual(['20+', '11', '2012'])
    for (const v of ['20+', '11', '2012']) expect(s).toContain(`<strong>${v}</strong>`)
    // Case-study metrics are in the text.
    expect(s).toContain('−80%')
    expect(s).toContain('300 → 4,500')
  })

  it('inner pages: real headlines and section headings', () => {
    expect(h1Text(html('about'))).toBe(aboutPage.title.join(' '))
    expect(html('about')).toContain(`<h2>${aboutPage.whyTitle}</h2>`)
    expect(h1Text(html('ai'))).toBe(aiPage.title.join(' '))
    expect(html('ai')).toContain(`<h2>${aiPage.howTitle}</h2>`)
    expect(h1Text(html('services'))).toBe(servicesPage.title.join(' '))
    expect(html('services')).toContain(`<h2>${servicesPage.systemsTitle}</h2>`)
    expect(h1Text(html('technology'))).toBe('The stack behind the systems we build.')
    expect(h1Text(html('contact'))).toBe('Tell us what is not working.')
    // The header CTA points at the form section on the same page, which exists.
    expect(hrefs(html('contact'))).toContain('#contact-form')
    expect(hrefs(html('contact'))).not.toContain('/#contact-form')
    expect(html('contact')).toContain('id="contact-form"')
    expect(h1Text(html('notFound'))).toBe(notFoundPage.title.join(' '))
    for (const sp of systemPages) {
      const s = html(`system:${sp.slug}`)
      expect(h1Text(s)).toBe(escapeHtml(`${sp.title}. ${sp.promise}`))
      for (const h of [systemsSection.painsTitle, systemsSection.buildTitle, systemsSection.impactTitle])
        expect(s).toContain(`<h2>${h}</h2>`)
      for (const m of Object.keys(sp.modules)) expect(s).toContain(`<h3>${escapeHtml(m)}</h3>`)
    }
  })

  it.each(legalPages)(
    'legal:$key carries the full legal text, its contents list and the draft note',
    ({ key, doc }) => {
      const s = html(`legal:${key}`)
      expect(h1Text(s)).toBe(escapeHtml(doc.title))
      expect(s).toContain(escapeHtml(doc.lead))
      expect(s).toContain(`datetime="${legalMeta.updated}"`)
      if (legalMeta.reviewNote) expect(s).toContain(escapeHtml(legalMeta.reviewNote))
      for (const sec of doc.sections) {
        const id = legalAnchor(sec.id)
        expect(s).toContain(`<section id="${id}"><h2>${escapeHtml(sec.heading)}</h2>`)
        expect(hrefs(s)).toContain(`#${id}`)
        for (const para of sec.body) expect(s).toContain(`<p>${escapeHtml(para)}</p>`)
      }
      // The closing contact block keeps the only #contact.
      expect(count(s, /id="contact"/g)).toBe(1)
    },
  )

  it('links the XML sitemap, never an HTML /sitemap page', () => {
    expect(snapshot('sitemap')).toBeNull()
    for (const id of snapshotPages) expect(hrefs(html(id)), id).not.toContain('/sitemap')
  })

  it('in-page anchors point back to the home page from other pages', () => {
    expect(hrefs(html('home'))).toContain('#faq')
    expect(hrefs(html('about'))).toContain('/#faq')
    expect(hrefs(html('about'))).not.toContain('#faq')
  })

  it('pricing is its own page: nothing links to the old home-page anchor, and the home section links to it', () => {
    for (const id of snapshotPages) {
      expect(hrefs(html(id)), id).not.toContain('/#pricing')
      expect(hrefs(html(id)), id).not.toContain('#pricing')
    }
    expect(hrefs(html('home'))).toContain(pricing.more.href)
  })

  it('pricing: one H1, the setters, every stage with its price note, the cost questions and no price figures', () => {
    const s = html('pricing')
    expect(h1Text(s)).toBe(pricingPage.title.join(' '))
    for (const h of [pricingPage.setsTitle, pricingPage.stagesTitle, pricingPage.afterTitle, pricingPage.faqTitle])
      expect(s).toContain(`<h2>${escapeHtml(h)}</h2>`)
    for (const x of pricing.sets) expect(s).toContain(`<h3>${escapeHtml(x.name)}</h3>`)
    for (const x of pricing.doesnt) expect(s).toContain(`<h3>${escapeHtml(x)}</h3>`)
    expect(pricingPage.stageNotes).toHaveLength(process.length)
    for (const [i, x] of process.entries()) {
      expect(s).toContain(`<h3>${escapeHtml(x.title)}</h3>`)
      expect(s).toContain(`<p>${escapeHtml(pricingPage.stageNotes[i])}</p>`)
    }
    expect(s).toContain(`<section id="agreed">`)
    for (const q of pricingPage.faq) {
      const f = faq.find((x) => x.q === q)
      expect(f, q).toBeDefined()
      expect(s).toContain(`<h3>${escapeHtml(q)}</h3><p>${escapeHtml(f!.a)}</p>`)
    }
    // No prices, ranges or currency anywhere in the page copy.
    expect(JSON.stringify(pricingPage)).not.toMatch(/[₹$€£]|\d/)
  })

  it('portfolio: one H1, every case with its sector, tags and metrics, and no numbers on earlier systems', () => {
    const s = html('portfolio')
    expect(h1Text(s)).toBe(portfolioPage.title.join(' '))
    for (const h of [portfolioPage.featuredTitle, portfolioPage.pastTitle, loom.contact.title])
      expect(s).toContain(`<h2>${escapeHtml(h)}</h2>`)
    for (const c of [...work, ...pastWork]) {
      expect(s).toContain(`<article id="${c.id}">`)
      expect(s).toContain(`<h3>${escapeHtml(c.title)}</h3>`)
      expect(s).toContain(escapeHtml(c.body))
      for (const t of c.tags) expect(s).toContain(`<li>${escapeHtml(t)}</li>`)
    }
    for (const c of work)
      for (const m of c.metrics) expect(s).toContain(`<dt>${escapeHtml(m.value)}</dt><dd>${escapeHtml(m.label)}</dd>`)
    expect(count(s, /<dl>/g)).toBe(work.length)
    expect(hrefs(s)).toContain('/our-services')
  })

  it('portfolio: every project from the old portfolio by name, with links to the system it is part of', () => {
    const s = html('portfolio')
    expect(s).toContain(`<h2>${escapeHtml(portfolioPage.archiveTitle)}</h2>`)
    for (const item of portfolioArchive) expect(s).toContain(`<span id="${item.id}">${escapeHtml(item.name)}</span>`)
    for (const item of portfolioArchive.filter((i) => i.system)) expect(hrefs(s)).toContain(`#${item.system}`)
  })

  it('home and system pages link to the portfolio', () => {
    expect(hrefs(html('home'))).toContain('/portfolio')
    const linked = systemPages.find((sp) => sp.proof)!
    expect(hrefs(html(`system:${linked.slug}`))).toContain(`/portfolio#${linked.proof!.caseId}`)
  })

  it('escapes text', () => {
    expect(escapeHtml(`<script>alert("x")</script> & 'y'`)).toBe(
      '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; &#39;y&#39;',
    )
    for (const id of snapshotPages) expect(html(id)).not.toMatch(/<script|<style| style=/)
    // "People & workforce" is in every nav.
    expect(html('home')).toContain('People &amp; workforce')
    expect(html('home')).not.toContain('People & workforce')
  })

  it('returns null for unknown pages', () => {
    expect(snapshot('loom')).toBeNull()
    expect(snapshot('system:nope')).toBeNull()
    expect(snapshot('legal:nope')).toBeNull()
  })
})

describe('pageForFile', () => {
  it('maps each HTML file to its page', () => {
    expect(pageForFile('index.html')).toBe('home')
    expect(pageForFile('/contact-us.html')).toBe('contact')
    expect(pageForFile('about-us.html')).toBe('about')
    expect(pageForFile('our-services.html')).toBe('services')
    expect(pageForFile('ai.html')).toBe('ai')
    expect(pageForFile('technology.html')).toBe('technology')
    expect(pageForFile('portfolio.html')).toBe('portfolio')
    expect(pageForFile('pricing.html')).toBe('pricing')
    expect(pageForFile('website-development.html')).toBe('website')
    expect(pageForFile('404.html')).toBe('notFound')
    expect(pageForFile('systems/people.html')).toBe('system:people')
    expect(pageForFile('systems\\finance.html')).toBe('system:finance')
    expect(pageForFile('privacy-policy.html')).toBe('legal:privacy')
    expect(pageForFile('terms-and-conditions.html')).toBe('legal:terms')
    expect(pageForFile('cookie-policy.html')).toBe('legal:cookies')
    expect(pageForFile('sitemap.html')).toBeNull()
  })

  it('leaves the internal loom page and unknown files alone', () => {
    expect(pageForFile('loom.html')).toBeNull()
    expect(pageForFile('systems/nope.html')).toBeNull()
    expect(pageForFile('src/index.html')).toBeNull()
  })
})

describe('snapshot copy style', () => {
  it('never joins items with a middle dot separator', () => {
    for (const id of snapshotPages) expect(html(id), id).not.toContain(' · ')
  })
})

describe('website development', () => {
  it('has one H1, every kind of site, every inclusion, the four stages and the questions', () => {
    const s = html('website')
    expect(h1Text(s)).toBe(websitePage.title.join(' '))
    for (const h of [websitePage.buildTitle, websitePage.includesTitle, websitePage.stepsTitle, websitePage.priceTitle])
      expect(s).toContain(`<h2>${escapeHtml(h)}</h2>`)
    for (const b of websitePage.builds) expect(s).toContain(`<h3>${escapeHtml(b.title)}</h3>`)
    for (const x of websitePage.includes) expect(s).toContain(`<dt>${escapeHtml(x.name)}</dt>`)
    expect(websitePage.steps).toHaveLength(process.length)
    for (const st of process) expect(s).toContain(`<h3>${escapeHtml(st.title)}</h3>`)
    for (const f of websitePage.faq) expect(s).toContain(`<h3>${escapeHtml(f.q)}</h3><p>${escapeHtml(f.a)}</p>`)
    expect(s).toContain('<section id="includes">')
  })

  it('links to ecommerce, the systems, pricing and each proof case on /portfolio', () => {
    const links = hrefs(html('website'))
    for (const href of ['/systems/ecommerce', '/our-services', '/pricing', '/portfolio']) expect(links).toContain(href)
    for (const id of websitePage.proofCases) {
      expect(pastWork.some((c) => c.id === id), id).toBe(true)
      expect(links).toContain(`/portfolio#${id}`)
    }
  })

  it('names no prices or timelines in numbers (the founding year is the only figure)', () => {
    expect(JSON.stringify(websitePage).replaceAll('since 2012', '')).not.toMatch(/[₹$€£]|\d/)
  })

  it('is linked from every page (footer) and from the home page Websites card', () => {
    for (const id of snapshotPages) expect(hrefs(html(id)), id).toContain('/website-development')
    expect(count(html('home'), /href="\/website-development"/g)).toBeGreaterThanOrEqual(2)
  })
})
