import { content } from '@/lib/content';
import { ogImage } from '@/lib/og';

/**
 * JSON-LD. Built from content/site.json so the structured data can never
 * disagree with what is on the page — schema describing absent content is
 * forbidden (standards.md, seo-specialist, geo-specialist).
 *
 * Entity naming is exact and identical everywhere: "Wezigns". Half of users
 * misspell it as "Wedesigns" (context.md §4), and a generative engine resolving
 * a weak or inconsistent entity will not cite it with confidence.
 *
 * Deliberately absent until the facts exist: aggregateRating, review, employee,
 * telephone, address. Rule 1 — an absence costs less than a fake.
 */
export function organizationSchema() {
  const base = content.meta.siteUrl.replace(/\/$/, '');
  const facts = content.meta.TODO_business_facts;

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${base}/#organization`,
    name: content.meta.name,
    url: `${base}/`,
    email: content.meta.email,
    description: content.meta.description,
    foundingDate: String(content.meta.since),
    areaServed: content.meta.markets,
    ...(facts.phone ? { telephone: facts.phone } : {}),
    ...(ogImage() ? { logo: `${base}${ogImage()!.url}` } : {}),
  };
}

export function websiteSchema() {
  const base = content.meta.siteUrl.replace(/\/$/, '');
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${base}/#website`,
    url: `${base}/`,
    name: content.meta.name,
    publisher: { '@id': `${base}/#organization` },
    inLanguage: 'en',
  };
}

/**
 * FAQPage from the faq section. Answer text is the same string the DOM renders,
 * so the markup and the page can never drift.
 */
export function faqSchema() {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const faq = content.sections.find((s) => (s as any).pattern === 'faq') as any;
  if (!faq?.items?.length) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.items.map((item: { q: string; a: string }) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };
}

export function caseStudySchema() {
  const base = content.meta.siteUrl.replace(/\/$/, '');
  return content.cases.map((c) => ({
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    '@id': `${base}/work/#${c.slug}`,
    name: c.title,
    about: c.sector,
    creator: { '@id': `${base}/#organization` },
    text: c.body.join(' '),
  }));
}
