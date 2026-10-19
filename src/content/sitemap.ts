// The registry of legal pages and their shared copy. Labels reuse the footer's legal links in site.ts.
// (The sitemap itself is XML only: /sitemap.xml, generated at build by sitemapXml in lib/seo.ts.)
// Plain data with explicit `.ts` imports, so the snapshot plugin can load it outside the app's `@/` alias.
import { type LegalDoc, cookieStatement, privacyPolicy, termsOfUse } from './legal.ts'
import { legalLinks } from './site.ts'

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
