import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { preloaderCopy } from '@/content/site'
import { bootPreloader } from '@/lib/snapshot'
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

  it('exists only for the home page', () => {
    expect(bootPreloader('about')).toBeNull()
    expect(bootPreloader('system:people')).toBeNull()
  })
})
