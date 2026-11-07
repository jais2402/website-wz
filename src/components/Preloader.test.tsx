import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { preloaderCopy } from '@/content/site'
import { bootPreloader, diwaliInner } from '@/lib/snapshot'
import { Preloader } from './Preloader'

// GSAP's ScrollTrigger reads matchMedia at import time; jsdom has none.
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
})

describe('boot preloader', () => {
  it('is the same markup React renders, so the swap on first render is invisible', () => {
    const { container } = render(
      <Preloader
        reducedMotion
        gate={{ ready: new Promise(() => {}), done() {}, progress: () => 0, isReady: () => false }}
        caption={preloaderCopy.home}
        onDone={() => {}}
      />,
    )
    expect(bootPreloader('home')!.replace('preloader is-boot', 'preloader')).toBe(container.innerHTML)
  })

  it('carries the Diwali centre too, the same markup React renders for Diwali', () => {
    const { container } = render(
      <Preloader
        reducedMotion
        festive="diwali"
        gate={{ ready: new Promise(() => {}), done() {}, progress: () => 0, isReady: () => false }}
        caption={preloaderCopy.home}
        onDone={() => {}}
      />,
    )
    const usual = bootPreloader('home')!
    const both = bootPreloader('home', 'diwali')!
    expect(both).toBe(usual.replace(/<\/div>$/, `${diwaliInner()}</div>`))
    // React's Diwali copy is the boot copy without the usual centre, its label and class set for the festival.
    const expected = both
      .replace(/<div class="pre-inner"><span class="pre-mark">.*?<\/span><\/div>(?=<div class="dw-sky")/, '')
      .replace('preloader is-boot', 'preloader is-diwali')
      .replace('aria-label="Loading"', 'aria-label="Loading. Happy Diwali from Wezigns"')
    expect(container.innerHTML).toBe(expected)
  })

  it('exists only for the home page', () => {
    expect(bootPreloader('about')).toBeNull()
    expect(bootPreloader('system:people')).toBeNull()
  })
})
