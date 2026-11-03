// Each page's hero label and headline, read from the same copy the page renders. Used for the social cards
// (scripts/og-cards.mjs draws the lines, the last in the serif accent) and their alt text (seo.ts `card`).
// Plain data with explicit `.ts` imports, so the build scripts can load it outside the app's `@/` alias.
import { aboutPage, aiPage, notFoundPage, portfolioPage, pricingPage, servicesPage, systemPages, systemsSection } from './pages.ts'
import { contactPage, loom, technologyPage } from './site.ts'
import { legalCopy, legalPages } from './sitemap.ts'

export type Hero = { kicker: string; lines: string[] }

const titled = (p: { kicker: string; title: readonly string[] }): Hero => ({ kicker: p.kicker, lines: [...p.title] })

const byId: Record<string, () => Hero> = {
  home: () => ({ kicker: loom.eyebrow, lines: [...loom.title] }),
  services: () => titled(servicesPage),
  about: () => titled(aboutPage),
  ai: () => titled(aiPage),
  technology: () => titled(technologyPage),
  portfolio: () => titled(portfolioPage),
  pricing: () => titled(pricingPage),
  notFound: () => titled(notFoundPage),
  contact: () => ({ kicker: contactPage.kicker, lines: [contactPage.title] }),
}

/** The page's hero, or null for a page without one (its card in seo.ts is then written by hand). */
export function heroFor(id: string): Hero | null {
  if (byId[id]) return byId[id]()
  const system = systemPages.find((s) => s.slug === id)
  if (system) return { kicker: systemsSection.kicker, lines: [`${system.title}.`, system.promise] }
  const legal = legalPages.find((l) => l.key === id)
  if (legal) return { kicker: legalCopy.kicker, lines: [legal.doc.title] }
  return null
}

/** The social card's text for seo.ts: the hero label and the headline as one line (also the image's alt text). */
export function heroCard(id: string): { kicker: string; title: string } {
  const hero = heroFor(id)
  if (!hero) throw new Error(`heroCard: no hero for page "${id}"`)
  return { kicker: hero.kicker, title: hero.lines.join(' ') }
}
