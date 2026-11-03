import { describe, expect, it } from 'vitest'
import { notFoundPage } from '@/content/pages'
import { editDistance, pathWords, suggestPage } from './notFound'

const pages = notFoundPage.suggest
const best = (path: string) => suggestPage(path, pages)?.path ?? null

describe('pathWords', () => {
  it('splits an address into plain words, without extension, query or case', () => {
    expect(pathWords('/Systems/HR_Payroll.html?ref=x#top')).toEqual(['systems', 'hr', 'payroll'])
    expect(pathWords('/web%20design')).toEqual(['web', 'design'])
    expect(pathWords('/%E0%A4%A')).toEqual(['e0', 'a4', 'a'])
    expect(pathWords('/')).toEqual([])
  })
})

describe('editDistance', () => {
  it('counts single-letter edits', () => {
    expect(editDistance('pricng', 'pricing')).toBe(1)
    expect(editDistance('protfolio', 'portfolio')).toBe(2)
    expect(editDistance('same', 'same')).toBe(0)
  })
})

describe('suggestPage', () => {
  it('finds the page for a typo', () => {
    expect(best('/pricng')).toBe('/pricing')
    expect(best('/protfolio')).toBe('/portfolio')
    expect(best('/contct')).toBe('/contact-us')
    expect(best('/technolgy')).toBe('/technology')
  })
  it('maps the words people type to the right page', () => {
    expect(best('/hrms')).toBe('/systems/people')
    expect(best('/crm-software')).toBe('/systems/revenue')
    expect(best('/inventory')).toBe('/systems/operations')
    expect(best('/web-design')).toBe('/website-development')
    expect(best('/saas-development')).toBe('/our-services')
    expect(best('/chatbot')).toBe('/ai')
    expect(best('/cost')).toBe('/pricing')
    expect(best('/contact-us.html')).toBe('/contact-us')
  })
  it('handles old-site style addresses', () => {
    expect(best('/portfolio-item-unknown')).toBe('/portfolio')
    expect(best('/services/ecommerce-development')).toBe('/systems/ecommerce')
    expect(best('/privacy')).toBe('/privacy-policy')
  })
  it('suggests nothing when nothing is a confident match', () => {
    expect(best('/xyzzy')).toBeNull()
    expect(best('/wp-admin/setup-config.php')).toBeNull()
    expect(best('/')).toBeNull()
    expect(best('/a/b/c/d/e/f/blog')).toBeNull()
  })
  it('only suggests real pages from the list', () => {
    const paths = new Set(pages.map((p) => p.path))
    for (const typed of ['/hr', '/web', '/ai-chat', '/about', '/terms']) expect(paths.has(best(typed) ?? '')).toBe(true)
  })
})
