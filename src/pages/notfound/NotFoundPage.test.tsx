import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

// jsdom lacks these; GSAP's ScrollTrigger reads matchMedia at import time (same stubs as src/test/headings.test.tsx).
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
  window.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver
})

const track = vi.fn()
vi.mock('@/lib/analytics', () => ({ track: (...a: unknown[]) => track(...a) }))
// The 3D hero and the contact block are not what this test is about.
vi.mock('../HeroLoom', () => ({ HeroLoom: () => null }))
vi.mock('@/loom/sections', () => ({ LoomContact: () => null }))

const { NotFoundPage } = await import('./NotFoundPage')

afterEach(() => {
  track.mockReset()
  window.history.replaceState(null, '', '/')
})

describe('404 page', () => {
  it('names the missing address, suggests the closest page and reports the path', async () => {
    window.history.replaceState(null, '', '/pricng?email=someone@example.com')
    render(<NotFoundPage />)
    expect(await screen.findByText('/pricng')).toBeTruthy()
    const link = screen.getByRole('link', { name: /did you mean how pricing works\?/i })
    expect(link.getAttribute('href')).toBe('/pricing')
    // Path only: the query string never reaches Analytics.
    expect(track).toHaveBeenCalledWith('page_not_found', { page_path: '/pricng', referrer: '' })
  })

  it('falls back to the home page when nothing matches', async () => {
    window.history.replaceState(null, '', '/wp-admin/setup-config.php')
    render(<NotFoundPage />)
    expect(await screen.findByText('/wp-admin/setup-config.php')).toBeTruthy()
    expect(screen.queryByRole('link', { name: /did you mean/i })).toBeNull()
    expect(screen.getAllByRole('link', { name: /back to the home page/i })[0].getAttribute('href')).toBe('/')
  })

  it('shows neither the address nor a report on /404 itself', () => {
    window.history.replaceState(null, '', '/404')
    render(<NotFoundPage />)
    expect(screen.queryByText(/is not a page on this site/)).toBeNull()
    expect(track).not.toHaveBeenCalled()
  })

  it('links every main page, including websites and pricing', () => {
    render(<NotFoundPage />)
    for (const href of ['/website-development', '/our-services', '/ai', '/pricing', '/portfolio', '/contact-us'])
      expect(document.querySelector(`.nf-grid a[href="${href}"]`)).toBeTruthy()
  })
})
