import { describe, expect, it } from 'vitest'
import { portfolioPage } from '@/content/pages'
import { archiveSectors, pastWork, portfolioArchive, work } from '@/content/site'
import { countLabel, filterBySector, nameBreaks, sectorCounts, stackSlot } from './portfolio'

describe('stackSlot', () => {
  it('puts the active screen at the front and the one before it at the back', () => {
    expect(stackSlot(2, 2, 5)).toBe(0)
    expect(stackSlot(3, 2, 5)).toBe(1)
    expect(stackSlot(1, 2, 5)).toBe(4)
  })

  it('gives every screen its own slot', () => {
    for (let active = 0; active < 5; active++) {
      const slots = [0, 1, 2, 3, 4].map((i) => stackSlot(i, active, 5)).sort()
      expect(slots).toEqual([0, 1, 2, 3, 4])
    }
  })

  it('moves the front screen to the back on the next step', () => {
    expect(stackSlot(0, 0, 4)).toBe(0)
    expect(stackSlot(0, 1, 4)).toBe(3)
    expect(stackSlot(0, 0, 0)).toBe(0)
  })
})

describe('portfolio hero showcase', () => {
  it('shows only real cases, each once', () => {
    const ids: string[] = [...work, ...pastWork].map((c) => c.id)
    const shown = portfolioPage.showcase.screens.map((s) => s.id)
    for (const id of shown) expect(ids).toContain(id)
    expect(new Set(shown).size).toBe(shown.length)
  })
})

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

describe('nameBreaks', () => {
  it('splits a domain-like name before each dot', () => {
    expect(nameBreaks('Callrehabcenters.com')).toEqual(['Callrehabcenters', '.com'])
    expect(nameBreaks('shop.example.co')).toEqual(['shop', '.example', '.co'])
  })

  it('keeps names with spaces or without a dot whole', () => {
    expect(nameBreaks('Acme Retail')).toEqual(['Acme Retail'])
    expect(nameBreaks('St. Mary School')).toEqual(['St. Mary School'])
    expect(nameBreaks('Wezigns')).toEqual(['Wezigns'])
  })
})
