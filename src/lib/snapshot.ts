// Crawlable HTML snapshot of each page, built from the content modules. The Vite plugin in scripts/vite-snapshot.ts
// puts it inside <div id="root"> so crawlers that do not run JavaScript (AI crawlers, Bing) read the same copy users
// see; React replaces it on load. Pure string builders: no React, no DOM. Imports use relative paths with the .ts
// extension so the plugin can load this file outside the app's `@/` alias.

import { legalMeta } from '../content/legal.ts'
import { aboutPage, aiPage, notFoundPage, servicesPage, systemPages, systemsSection } from '../content/pages.ts'
import { type LegalKey, legalCopy, legalPages, sitemapPage } from '../content/sitemap.ts'
import {
  ai,
  areas,
  brand,
  contactPage,
  countries,
  ctas,
  faq,
  footer,
  integrations,
  integrationsSection,
  legalLinks,
  loom,
  nav,
  navSystems,
  navSystemsAll,
  pastWork,
  pricing,
  principles,
  process,
  processSection,
  reach,
  services,
  servicesSection,
  stack,
  stats,
  technologyPage,
  tools,
  work,
  workSection,
} from '../content/site.ts'
import { formatLegalDate, legalAnchor } from './legal.ts'

/** Page ids: one per shipped HTML file. Systems are `system:<slug>`. */
export type SnapshotPage =
  | 'home'
  | 'services'
  | 'ai'
  | 'technology'
  | 'about'
  | 'contact'
  | 'notFound'
  | 'sitemap'
  | `system:${string}`
  | `legal:${LegalKey}`

type Link = { label: string; href: string }

const ESC: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }

export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => ESC[c])
}

// ---- Tiny builders. Every text argument is escaped; `inner` arguments are already-built HTML. ----

const t = escapeHtml
const tag = (name: string, inner: string, attrs = '') => `<${name}${attrs}>${inner}</${name}>`
const p = (text: string) => tag('p', t(text))
const h1 = (text: string) => tag('h1', t(text))
const h2 = (text: string) => tag('h2', t(text))
const h3 = (text: string) => tag('h3', t(text))
const a = (href: string, label: string) => `<a href="${t(href)}">${t(label)}</a>`
const ul = (items: readonly string[]) => tag('ul', items.map((i) => tag('li', t(i))).join(''))
const ulHtml = (items: readonly string[], ordered = false) =>
  tag(ordered ? 'ol' : 'ul', items.map((i) => tag('li', i)).join(''))
const section = (inner: string, id?: string) => tag('section', inner, id ? ` id="${t(id)}"` : '')
/** Headlines set on several lines in the app read as one sentence here, with spaces between the lines. */
const line = (parts: readonly string[]) => parts.join(' ')

/** In-page anchors point back to the home page from other pages, as the app's nav and footer do. */
const homeHref = (href: string, onHome: boolean) => (href.startsWith('#') && !onHome ? `/${href}` : href)

// ---- Shared header, footer and contact block ----

function header(onHome: boolean, cta: Link = ctas.contact): string {
  const items = nav.map((l) => {
    const link = a(homeHref(l.href, onHome), l.label)
    if (l.href !== navSystemsAll.href) return link
    return link + ulHtml([a(navSystemsAll.href, navSystemsAll.label), ...navSystems.map((s) => a(s.href, s.label))])
  })
  return tag(
    'header',
    a(onHome ? '#top' : '/', brand.name) +
      tag('nav', ulHtml([...items, a(homeHref(cta.href, onHome), cta.label)]), ' aria-label="Primary"'),
  )
}

function address(label: string): string {
  return tag(
    'address',
    tag('strong', t(brand.legal)) +
      `<br>${t(label)}<br>` +
      brand.address.map(t).join('<br>') +
      `<br>${a(brand.phoneHref, brand.phone)}<br>${a(`mailto:${brand.email}`, brand.email)}<br>` +
      a(brand.mapsHref, 'Open in Google Maps'),
  )
}

function footerHtml(onHome: boolean): string {
  const cols = footer
    .map((col) =>
      tag(
        'nav',
        p(col.title) + ulHtml(col.links.map(([label, href]) => a(homeHref(href, onHome), label))),
        ` aria-label="${t(col.title)}"`,
      ),
    )
    .join('')
  return tag(
    'footer',
    p(`Custom software that grows with you. Designed, built, hosted and maintained from ${brand.city}.`) +
      address('Head office · Chennai') +
      cols +
      p(countries.map((c) => c.name).join(' · ')) +
      p(`© 2026 ${brand.legal}`) +
      tag('nav', ulHtml(legalLinks.map((l) => a(l.href, l.label))), ' aria-label="Legal"'),
  )
}

/** The loom-style contact block that closes the home page and the inner pages. */
function contactBlock(): string {
  return section(
    p(loom.contact.kicker) +
      h2(loom.contact.title) +
      p(loom.contact.body) +
      address('Head office · Chennai') +
      tag('p', a(ctas.contact.href, ctas.contact.label)),
    'contact',
  )
}

/** A mid-page call to action (CtaStrip): copy plus the shared contact link and an optional second link. */
function ctaStrip(c: { title: string; body?: string; secondary?: Link }): string {
  const links = [
    a(ctas.contact.href, ctas.contact.label),
    ...(c.secondary ? [a(c.secondary.href, c.secondary.label)] : []),
  ]
  return tag(
    'aside',
    p(c.title) + (c.body ? p(c.body) : '') + tag('p', links.join(' · ')),
    ` aria-label="${t(c.title)}"`,
  )
}

function hero(kicker: string, title: string, lead: string, actions: Link[]): string {
  return section(p(kicker) + h1(title) + p(lead) + tag('p', actions.map((l) => a(l.href, l.label)).join(' · ')))
}

type Case = {
  id: string
  sector: string
  place?: string
  title: string
  body: string
  metrics?: readonly { value: string; label: string }[]
  tags: readonly string[]
}

const cases: readonly Case[] = [...work, ...pastWork]

function caseCard(c: Case): string {
  const metrics = c.metrics?.length
    ? tag('dl', c.metrics.map((m) => tag('dt', t(m.value)) + tag('dd', t(m.label))).join(''))
    : ''
  return tag(
    'article',
    p(c.place ? `${c.sector} · ${c.place}` : c.sector) + h3(c.title) + p(c.body) + metrics + ul(c.tags),
    ` id="${t(c.id)}"`,
  )
}

/** Wraps a page: header, one <main>, footer. The wrapper class lets the plugin's CSS hide it once JS runs. */
function page(main: string, onHome = false, cta?: Link): string {
  return `<div class="snapshot">${header(onHome, cta)}${tag('main', main)}${footerHtml(onHome)}</div>`
}

// ---- Pages ----

function home(): string {
  const heroHtml = section(
    p(loom.eyebrow) +
      h1(line(loom.title)) +
      p(loom.sub) +
      tag(
        'p',
        `${a(ctas.contact.href, ctas.contact.label)} · ${a(ctas.hero.secondary.href, ctas.hero.secondary.label)}`,
      ) +
      tag(
        'nav',
        p(loom.systemsLine) + ulHtml(navSystems.map((s) => a(s.href, s.label))),
        ` aria-label="${t(loom.systemsLine)}"`,
      ) +
      loom.phases.map((ph) => tag('article', p(ph.kicker) + h2(ph.title) + p(ph.body))).join(''),
    'top',
  )

  const weave = section(
    h2(loom.weave.title) + ulHtml(loom.threadsIn.map((x) => tag('s', t(x)))) + ul(loom.threadsOut),
    'weave',
  )

  const story = section(
    p('How a Wezigns system feels') +
      principles.map((pr) => tag('article', h2(`${pr.title}.`) + p(pr.body) + ul(pr.chips))).join(''),
  )

  const proof = section(
    p('Tools we build with') +
      ul(tools) +
      h2('Twelve years of building software for growing businesses.') +
      ulHtml(stats.map((s) => `${tag('strong', t(`${s.value}${s.suffix}`))} ${t(s.label)}`)),
    'stats',
  )

  const servicesHtml = section(
    h2(servicesSection.title) +
      p(servicesSection.body) +
      services.map((s) => tag('article', p(s.kicker) + h3(s.title) + ul(s.items))).join(''),
    'build',
  )

  const explorer = section(
    p('The systems we build') +
      h2('Every corner of the business, connected.') +
      areas
        .map((ar, i) => {
          const href = navSystems[i]?.href ?? navSystemsAll.href
          return tag(
            'article',
            tag('h3', a(href, ar.title)) + ul(ar.modules.map((m) => m.name)) + tag('p', a(href, `Explore ${ar.title}`)),
          )
        })
        .join(''),
  )

  const ba = loom.beforeAfter
  const beforeAfter = section(h2(ba.title) + p('Before') + ul(ba.before) + p('After') + ul(ba.after), 'before-after')

  const aiHtml = section(
    h2(ai.title) +
      p(ai.body) +
      ulHtml(ai.points.map((x) => `${tag('strong', t(x.title))} ${t(x.text)}`)) +
      tag('p', a(ctas.aiDemo.href, ctas.aiDemo.label)),
    'ai',
  )

  const next = workSection.next
  const workHtml = section(
    h2(workSection.title) +
      p(next.body) +
      cases.map(caseCard).join('') +
      tag('article', h3(next.title) + p(next.body) + tag('p', a(next.href, next.cta))),
    'work',
  )

  const processHtml = section(
    p(processSection.kicker) +
      h2(processSection.title) +
      ulHtml(
        process.map((s) => h3(s.title) + p(s.body)),
        true,
      ),
    'process',
  )

  const pricingHtml = section(
    h2(line(pricing.title)) +
      p(pricing.body) +
      tag('p', a(pricing.cta.href, pricing.cta.label)) +
      p('Your price: agreed before build') +
      p('What sets it') +
      ulHtml(pricing.sets.map((s) => `${tag('strong', t(s.name))} ${t(s.text)}`)) +
      p('What doesn’t') +
      ul(pricing.doesnt) +
      p('Price: one number. Timeline: one date.') +
      ulHtml(
        pricing.steps.map((s) => h3(s.name) + p(s.text)),
        true,
      ),
    'pricing',
  )

  const integrationsHtml = section(
    h2(integrationsSection.title) +
      p(integrationsSection.body) +
      ul(integrations) +
      tag('p', a(ctas.integrations.href, ctas.integrations.label)),
    'integrations',
  )

  const countriesHtml = section(
    h2(reach.title) +
      p(reach.body) +
      ul(reach.regions.flatMap((r) => r.countries).map((c) => (c === reach.hq ? `${c} (${reach.hqLabel})` : c))),
    'countries',
  )

  const faqHtml = section(
    h2('Straight answers.') +
      faq.map((f) => h3(f.q) + p(f.a)).join('') +
      p(ctas.faq.title) +
      p(ctas.faq.body) +
      tag('p', `${a(brand.phoneHref, `${ctas.faq.call} ${brand.phone}`)} · ${a(`mailto:${brand.email}`, brand.email)}`),
    'faq',
  )

  return page(
    heroHtml +
      weave +
      story +
      proof +
      servicesHtml +
      explorer +
      beforeAfter +
      aiHtml +
      workHtml +
      processHtml +
      pricingHtml +
      integrationsHtml +
      countriesHtml +
      faqHtml +
      contactBlock(),
    true,
  )
}

function servicesPageHtml(): string {
  const s = servicesPage
  return page(
    hero(s.kicker, line(s.title), s.lead, [ctas.contact, s.workLink]) +
      section(
        h2(s.systemsTitle) +
          p(s.systemsIntro) +
          systemPages
            .map((sp) =>
              tag(
                'article',
                tag('h3', a(`/systems/${sp.slug}`, sp.title)) +
                  p(sp.promise) +
                  p(sp.intro) +
                  p(s.modulesLabel) +
                  ul(Object.keys(sp.modules)) +
                  tag('p', a(`/systems/${sp.slug}`, `${s.explore} ${sp.title}`)),
              ),
            )
            .join(''),
      ) +
      section(
        h2(s.servicesTitle) +
          p(s.servicesIntro) +
          services.map((x) => tag('article', p(x.kicker) + h3(x.title) + ul(x.items))).join(''),
      ) +
      ctaStrip(ctas.system) +
      contactBlock(),
  )
}

function systemPageHtml(slug: string): string | null {
  const sp = systemPages.find((x) => x.slug === slug)
  if (!sp) return null
  const copy = systemsSection
  const caseStudy = cases.find((c) => c.id === sp.caseId)
  // The other systems, starting after this one and wrapping round (as on the page).
  const i = systemPages.indexOf(sp)
  const others = [...systemPages.slice(i + 1), ...systemPages.slice(0, i)]
  const proof = sp.proof
    ? tag(
        'aside',
        tag('p', tag('strong', t(sp.proof.value))) + p(sp.proof.label) + tag('p', a('/#work', 'Read the case')),
      )
    : ''
  return page(
    hero(copy.kicker, `${sp.title}. ${sp.promise}`, sp.intro, [
      copy.cta,
      { label: 'See what we build', href: '#build' },
    ]) +
      section(
        h2(copy.painsTitle) +
          sp.pains
            .map((x) => tag('figure', tag('blockquote', p(`“${x.quote}”`)) + tag('figcaption', t(x.who))))
            .join(''),
      ) +
      section(
        h2(copy.buildTitle) + ulHtml(Object.entries(sp.modules).map(([name, text]) => h3(name) + p(text))),
        'build',
      ) +
      section(
        h2(copy.impactTitle) +
          ulHtml(sp.impact.map((x) => `${p(x.who)}${p(`Before: ${x.before}`)}${p(`After: ${x.after}`)}`)) +
          proof,
      ) +
      ctaStrip(ctas.system) +
      section(
        h2(copy.toolsTitle) +
          tag('dl', sp.tools.map((g) => tag('dt', t(g.label)) + tag('dd', t(g.items.join(', ')))).join('')),
      ) +
      section(
        (caseStudy ? p(workSection.title) + caseCard(caseStudy) : '') +
          tag(
            'nav',
            h2(copy.moreTitle) + ulHtml(others.map((o) => `${a(`/systems/${o.slug}`, o.title)} ${t(o.promise)}`)),
            ` aria-label="${t(copy.moreTitle)}"`,
          ),
      ) +
      contactBlock(),
  )
}

function aiPageHtml(): string {
  const x = aiPage
  return page(
    hero(x.kicker, line(x.title), x.lead, [x.cta, { label: x.heroLink, href: '#ways' }]) +
      section(
        h2(x.waysTitle) +
          x.ways
            .map((w) =>
              tag(
                'article',
                p(w.label) +
                  h3(w.title) +
                  p(w.text) +
                  tag('p', a(w.key === 'inside' ? '#inside' : '#solutions', x.waysLink)),
              ),
            )
            .join(''),
        'ways',
      ) +
      section(
        p(x.ways[0].label) +
          h2(x.insideTitle) +
          x.inside.map((i) => tag('article', p(i.system) + h3(i.title) + p(i.text))).join(''),
        'inside',
      ) +
      section(
        p(x.ways[1].label) +
          h2(x.solutionsTitle) +
          x.solutions
            .map((s) =>
              tag('article', h3(s.title) + p(s.text) + tag('ol', s.flow.map((f) => tag('li', t(f))).join(''))),
            )
            .join(''),
        'solutions',
      ) +
      ctaStrip(ctas.ai) +
      section(
        p(x.howKicker) +
          h2(x.howTitle) +
          ulHtml(
            x.how.map((s) => h3(s.title) + p(s.text)),
            true,
          ) +
          x.guardrails.map((g) => tag('article', h3(g.title) + p(g.text))).join(''),
        'how',
      ) +
      contactBlock(),
  )
}

function technologyPageHtml(): string {
  const x = technologyPage
  return page(
    hero(x.kicker, line(x.title), x.lead, [ctas.contact, { label: 'See the stack', href: '#stack' }]) +
      section(h2(x.stackTitle) + p(x.stackIntro) + stack.map((g) => h3(g.group) + ul(g.items)).join(''), 'stack') +
      section(
        h2(x.layersTitle) +
          ulHtml(
            x.layers.map((l) => h3(l.name) + p(l.text) + ul(l.items)),
            true,
          ),
      ) +
      ctaStrip(ctas.technology) +
      section(h2(x.aiTitle) + x.ai.map((i) => tag('article', h3(i.title) + p(i.text))).join('')) +
      contactBlock(),
  )
}

function aboutPageHtml(): string {
  const x = aboutPage
  return page(
    hero(x.kicker, line(x.title), x.lead, [x.cta, { label: 'See our work', href: '/#work' }]) +
      section(h2(x.whyTitle) + x.why.map((w) => tag('article', h3(w.title) + p(w.text))).join('')) +
      section(
        h2(x.storyTitle) +
          ulHtml(
            x.story.map((s) => p(s.year) + h3(s.title) + p(s.text)),
            true,
          ),
      ) +
      section(
        h2(x.numbersTitle) +
          tag('dl', stats.map((s) => tag('dt', t(s.label)) + tag('dd', t(`${s.value}${s.suffix}`))).join('')),
      ) +
      ctaStrip(ctas.about) +
      section(
        h2(x.processTitle) +
          ulHtml(
            process.map((s) => h3(s.title) + p(s.body)),
            true,
          ),
      ) +
      contactBlock(),
  )
}

function contactPageHtml(): string {
  const c = contactPage
  return page(
    section(p(c.kicker) + h1(c.title) + p(c.lead)) +
      section(
        address('Head office') +
          p(`Phone: ${brand.phone}. ${c.phoneNote}.`) +
          p(`Email: ${brand.email}. ${c.emailNote}`) +
          tag('p', `${t(`Working with teams in ${countries.length} countries.`)} ${a('/#countries', 'See where')}`),
      ),
    false,
    { label: 'Send a message', href: '#contact-form' },
  )
}

function notFoundPageHtml(): string {
  const x = notFoundPage
  return page(
    hero(x.kicker, line(x.title), x.lead, [x.home, ctas.contact]) +
      section(h2(x.linksTitle) + ulHtml(x.links.map((l) => `${a(l.href, l.label)} ${t(l.text)}`))) +
      contactBlock(),
  )
}

function legalPageHtml(key: string): string | null {
  const entry = legalPages.find((l) => l.key === key)
  if (!entry) return null
  const { doc } = entry
  const others = legalPages.filter((l) => l.key !== key)
  const updated = tag('time', t(formatLegalDate(legalMeta.updated)), ` datetime="${t(legalMeta.updated)}"`)
  return page(
    section(p(legalCopy.kicker) + h1(doc.title) + p(doc.lead) + tag('p', `${t(legalCopy.updated)} ${updated}`)) +
      (legalMeta.reviewNote
        ? tag('aside', p(legalCopy.draftLabel) + p(legalMeta.reviewNote), ` aria-label="${t(legalCopy.draftLabel)}"`)
        : '') +
      tag(
        'nav',
        p(legalCopy.tocTitle) +
          ulHtml(doc.sections.map((x) => a(`#${legalAnchor(x.id)}`, x.heading))) +
          p(legalCopy.otherTitle) +
          ulHtml(others.map((o) => a(o.path, o.label))),
        ` aria-label="${t(legalCopy.tocTitle)}"`,
      ) +
      tag(
        'article',
        doc.sections.map((x) => section(h2(x.heading) + x.body.map(p).join(''), legalAnchor(x.id))).join(''),
      ) +
      contactBlock(),
  )
}

function sitemapPageHtml(): string {
  const x = sitemapPage
  return page(
    section(p(x.kicker) + h1(line(x.title)) + p(x.lead)) +
      x.groups
        .map((g) => section(h2(g.title) + ulHtml(g.links.map((l) => `${a(l.href, l.label)} ${t(l.text)}`))))
        .join('') +
      contactBlock(),
  )
}

/** The snapshot for a page id, or null for an unknown page (the plugin then leaves #root empty). */
export function snapshot(id: string): string | null {
  switch (id) {
    case 'home':
      return home()
    case 'services':
      return servicesPageHtml()
    case 'ai':
      return aiPageHtml()
    case 'technology':
      return technologyPageHtml()
    case 'about':
      return aboutPageHtml()
    case 'contact':
      return contactPageHtml()
    case 'notFound':
      return notFoundPageHtml()
    case 'sitemap':
      return sitemapPageHtml()
  }
  if (id.startsWith('legal:')) return legalPageHtml(id.slice('legal:'.length))
  return id.startsWith('system:') ? systemPageHtml(id.slice('system:'.length)) : null
}

/** Every page id with a snapshot, in sitemap order. */
export const snapshotPages: SnapshotPage[] = [
  'home',
  'services',
  ...systemPages.map((s) => `system:${s.slug}` as const),
  'ai',
  'technology',
  'about',
  'contact',
  ...legalPages.map((l) => `legal:${l.key}` as const),
  'sitemap',
  'notFound',
]

const FILES: Record<string, SnapshotPage> = {
  'index.html': 'home',
  'contact-us.html': 'contact',
  'about-us.html': 'about',
  'our-services.html': 'services',
  'ai.html': 'ai',
  'technology.html': 'technology',
  '404.html': 'notFound',
  'privacy-policy.html': 'legal:privacy',
  'terms-and-conditions.html': 'legal:terms',
  'cookie-policy.html': 'legal:cookies',
  'sitemap.html': 'sitemap',
}

/**
 * Page id for an HTML file path relative to the project root ("index.html", "systems/people.html"). Anything else,
 * including the internal loom.html, gets null and no snapshot.
 */
export function pageForFile(file: string): SnapshotPage | null {
  const f = file.replace(/\\/g, '/').replace(/^\.?\//, '')
  if (FILES[f]) return FILES[f]
  const m = f.match(/^systems\/([a-z0-9-]+)\.html$/)
  return m && systemPages.some((s) => s.slug === m[1]) ? `system:${m[1]}` : null
}
