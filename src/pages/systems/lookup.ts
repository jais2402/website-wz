import { type SystemPage, systemPages } from '@/content/pages'
import { type Chart, areas, pastWork, work } from '@/content/site'

// Pure lookups for the system pages: the page for a slug, its neighbours, its case study and its modules.

export type CaseStudy = {
  id: string
  sector: string
  place?: string
  title: string
  body: string
  metrics?: readonly { value: string; label: string }[]
  tags: readonly string[]
  tone: string
}

const cases: readonly CaseStudy[] = [...work, ...pastWork]

export function findSystem(slug: string): SystemPage | undefined {
  return systemPages.find((p) => p.slug === slug)
}

/** The other systems, starting with the one after `slug` and wrapping round, so each page links onward. */
export function otherSystems(slug: string): SystemPage[] {
  const i = systemPages.findIndex((p) => p.slug === slug)
  if (i < 0) return [...systemPages]
  return [...systemPages.slice(i + 1), ...systemPages.slice(0, i)]
}

export function findCase(id: string): CaseStudy | undefined {
  return cases.find((c) => c.id === id)
}

/** The page's module sentences paired with the matching explorer module's chart kind (used for the glyph). */
export function buildModules(page: SystemPage): { name: string; text: string; kind: Chart['kind'] }[] {
  const mods = areas[page.area]?.modules ?? []
  return Object.entries(page.modules).map(([name, text], i) => ({
    name,
    text,
    kind: (mods.find((m) => m.name === name) ?? mods[i])?.chart.kind ?? 'line',
  }))
}
