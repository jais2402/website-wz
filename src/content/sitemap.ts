// Copy for the HTML sitemap (sitemap.html, /sitemap) and the registry of legal pages. Page names and blurbs reuse
// the copy in site.ts / pages.ts where it exists; only group titles and a few blurbs are new.
// Plain data with explicit `.ts` imports, so the snapshot plugin can load it outside the app's `@/` alias.
import { type LegalDoc, cookieStatement, privacyPolicy, termsOfUse } from './legal.ts'
import { notFoundPage, systemPages } from './pages.ts'
import { footer, legalLinks, pricing } from './site.ts'

export type LegalKey = 'privacy' | 'terms' | 'cookies'

const legalLabel = (href: string) => legalLinks.find((l) => l.href === href)?.label ?? href

/** The three legal pages, in footer order. `key` matches <body data-page="legal:<key>">. */
export const legalPages: { key: LegalKey; path: string; label: string; text: string; doc: LegalDoc }[] = [
  {
    key: 'privacy',
    path: '/privacy-policy',
    label: legalLabel('/privacy-policy'),
    text: 'What we collect through this website, who handles it, and your rights',
    doc: privacyPolicy,
  },
  {
    key: 'terms',
    path: '/terms-and-conditions',
    label: legalLabel('/terms-and-conditions'),
    text: 'The terms for using this website',
    doc: termsOfUse,
  },
  {
    key: 'cookies',
    path: '/cookie-policy',
    label: legalLabel('/cookie-policy'),
    text: 'The cookies we use, and how to accept, reject or change them',
    doc: cookieStatement,
  },
]

export const isLegalKey = (key: string): key is LegalKey => legalPages.some((l) => l.key === key)

export const legalCopy = {
  kicker: 'Legal',
  updated: 'Last updated',
  draftLabel: 'Draft',
  tocTitle: 'On this page',
  otherTitle: 'Other legal pages',
}

export type SitemapLink = { label: string; href: string; text: string }

// One-line blurbs already written for the 404 page's "Or go straight to" list.
const blurb = (href: string) => notFoundPage.links.find((l) => l.href === href)?.text ?? ''
const explore = (href: string) => footer[0].links.find(([, h]) => h === href)?.[0] ?? href

export const sitemapPage = {
  kicker: 'Sitemap',
  title: ['Every page,', 'in one place.'],
  lead: 'Every page on this website, grouped so you can go straight to what you need.',
  groups: [
    {
      title: 'Main pages',
      links: [
        { label: 'Home', href: '/', text: 'Custom business software for SMEs and MSMEs, since 2012' },
        { label: 'Systems overview', href: '/our-services', text: blurb('/our-services') },
        { label: 'AI', href: '/ai', text: blurb('/ai') },
        { label: 'Technology', href: '/technology', text: blurb('/technology') },
        { label: 'Our work', href: '/portfolio', text: blurb('/portfolio') },
        { label: 'About us', href: '/about-us', text: blurb('/about-us') },
        { label: 'Contact us', href: '/contact-us', text: blurb('/contact-us') },
      ],
    },
    {
      title: 'Systems',
      links: systemPages.map((s) => ({ label: s.title, href: `/systems/${s.slug}`, text: s.promise })),
    },
    {
      title: 'Home page sections',
      links: [
        { label: explore('#build'), href: '/#build', text: 'The three jobs we do for every system' },
        { label: explore('#process'), href: '/#process', text: 'Four stages, from the first workshop to after launch' },
        { label: 'Pricing', href: '/#pricing', text: pricing.body },
        { label: explore('#faq'), href: '/#faq', text: 'Straight answers to the questions we hear most' },
      ],
    },
    {
      title: 'Legal',
      links: [
        ...legalPages.map((l) => ({ label: l.label, href: l.path, text: l.text })),
        { label: legalLabel('/sitemap'), href: '/sitemap', text: 'This page: every page on the website in one list' },
      ],
    },
  ] satisfies { title: string; links: SitemapLink[] }[],
}
