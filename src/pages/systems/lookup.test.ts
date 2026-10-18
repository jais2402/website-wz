import { systemPages } from '@/content/pages'
import { areas } from '@/content/site'
import { buildModules, findCase, findSystem, otherSystems } from './lookup'

describe('findSystem', () => {
  it('finds a page by slug', () => {
    expect(findSystem('finance')?.title).toBe('Finance & governance')
  })

  it('returns undefined for an unknown slug', () => {
    expect(findSystem('nope')).toBeUndefined()
  })
})

describe('otherSystems', () => {
  it('lists the other five, starting after the current one and wrapping round', () => {
    const slugs = otherSystems('finance').map((p) => p.slug)
    expect(slugs).toEqual(['industry', 'people', 'revenue', 'operations', 'ecommerce'])
  })

  it('never includes the current page', () => {
    for (const p of systemPages) {
      const others = otherSystems(p.slug)
      expect(others).toHaveLength(systemPages.length - 1)
      expect(others.map((o) => o.slug)).not.toContain(p.slug)
    }
  })
})

describe('content wiring', () => {
  it.each(systemPages.map((p) => [p.slug, p] as const))('%s: case, proof and area all resolve', (_, p) => {
    expect(findCase(p.caseId)).toBeDefined()
    if (p.proof) expect(findCase(p.proof.caseId)).toBeDefined()
    expect(areas[p.area]).toBeDefined()
  })

  it.each(systemPages.map((p) => [p.slug, p] as const))('%s: every module matches an explorer module', (_, p) => {
    const names = areas[p.area].modules.map((m) => m.name)
    expect(Object.keys(p.modules)).toEqual(names)
    expect(buildModules(p).map((m) => m.kind)).toEqual(areas[p.area].modules.map((m) => m.chart.kind))
  })
})
