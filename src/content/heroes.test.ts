import { describe, expect, it } from 'vitest'
import { heroCard, heroFor } from './heroes'
import { pages } from './seo'

describe('social cards from the page heroes', () => {
  it('every built page has a hero, and its card (and alt text) is that hero', () => {
    for (const page of pages.filter((p) => p.id !== 'loom')) {
      const hero = heroFor(page.id)
      expect(hero, page.id).not.toBeNull()
      expect(page.card).toEqual(heroCard(page.id))
      expect(hero!.lines.join(' ')).toBe(page.card.title)
    }
  })
  it('reads the live copy: the home card is the loom headline', () => {
    expect(heroFor('home')!.lines).toEqual(['Every loose thread,', 'woven into', 'one system.'])
  })
})
