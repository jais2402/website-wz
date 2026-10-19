import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SplitReveal } from '@/components/Reveal'
import { loom } from '@/content/site'
import { LiteContext } from '@/hooks/useLite'
import { LoomHero } from '@/loom/hero'
import { PageHero } from '@/pages/shell'

// Headlines built from line or word spans must keep a single space between them in textContent, or crawlers,
// snippets and text extractors read "thread,woven intoone system.".

// jsdom has neither; GSAP's ScrollTrigger reads matchMedia at import time, so stub them before the imports run.
vi.hoisted(() => {
  window.matchMedia ??= ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia
  window.IntersectionObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return []
    }
  } as unknown as typeof IntersectionObserver
})

describe('heading text spacing', () => {
  it('home hero H1 reads its lines with single spaces', () => {
    render(
      // Lite mode renders the static SVG art instead of the lazy WebGL loom.
      <LiteContext.Provider value={{ lite: true, reason: 'test', fallBack: () => {} }}>
        <LoomHero reducedMotion introReady={false} />
      </LiteContext.Provider>,
    )
    const h1 = screen.getByRole('heading', { level: 1 })
    expect(h1.textContent).toBe(loom.title.join(' '))
    expect(h1.textContent).toBe('Every loose thread, woven into one system.')
  })

  it('PageHero H1 reads its lines with single spaces', () => {
    render(<PageHero kicker="About" title={['From small', 'teams to', 'big systems.']} lead="Lead." />)
    const h1 = screen.getByRole('heading', { level: 1 })
    expect(h1.textContent).toBe('From small teams to big systems.')
    expect(h1.querySelectorAll('.pg-title-line')).toHaveLength(3)
  })

  it('PageHero with a single line has no stray space', () => {
    render(<PageHero kicker="AI" title={['One line.']} lead="Lead." />)
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('One line.')
  })

  it('SplitReveal keeps word spaces and the plain sentence as its accessible name', () => {
    const text = 'Twelve years of building software for growing businesses.'
    render(<SplitReveal as="h2" text={text} />)
    const h2 = screen.getByRole('heading', { level: 2, name: text })
    expect(h2.textContent).toBe(text)
    expect(h2.getAttribute('aria-label')).toBe(text)
  })
})
