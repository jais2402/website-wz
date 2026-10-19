import { describe, expect, it } from 'vitest'
import { archiveSectors, pastWork, portfolioArchive, work } from '@/content/site'
import { countLabel, filterBySector, sectorCounts } from './portfolio'

const items: { id: string; sector: string }[] = [
  { id: 'a', sector: 'Retail' },
  { id: 'b', sector: 'Other' },
  { id: 'c', sector: 'Retail' },
]

describe('sectorCounts', () => {
  it('counts each sector in the given order and drops empty ones', () => {
    expect(sectorCounts(items, ['Events', 'Retail', 'Other'])).toEqual([
      { sector: 'Retail', count: 2 },
      { sector: 'Other', count: 1 },
    ])
  })
})

describe('filterBySector', () => {
  it('returns everything for null, in order', () => {
    expect(filterBySector(items, null).map((i) => i.id)).toEqual(['a', 'b', 'c'])
  })
  it('returns only the chosen sector', () => {
    expect(filterBySector(items, 'Retail').map((i) => i.id)).toEqual(['a', 'c'])
    expect(filterBySector(items, 'Events')).toEqual([])
  })
})

describe('countLabel', () => {
  it('fills n and total', () => {
    expect(countLabel('Showing {n} of {total} projects', 3, 100)).toBe('Showing 3 of 100 projects')
  })
})

describe('portfolioArchive', () => {
  it('lists the 100 projects from the old portfolio, each with a sector that has a chip', () => {
    expect(portfolioArchive).toHaveLength(100)
    for (const p of portfolioArchive) expect(archiveSectors).toContain(p.sector)
    const counted = sectorCounts(portfolioArchive, archiveSectors).reduce((n, c) => n + c.count, 0)
    expect(counted).toBe(portfolioArchive.length)
  })

  it('has unique kebab-case ids that do not clash with the case ids', () => {
    const caseIds = [...work, ...pastWork].map((c) => c.id)
    const ids = portfolioArchive.map((p) => p.id)
    expect(new Set([...ids, ...caseIds]).size).toBe(ids.length + caseIds.length)
    for (const id of ids) expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
  })

  it('links only to earlier systems that exist', () => {
    const pastIds: string[] = pastWork.map((c) => c.id)
    for (const p of portfolioArchive) if (p.system) expect(pastIds).toContain(p.system)
  })
})
