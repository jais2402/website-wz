import { act, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { StickyCall } from './StickyCall'

const scrollTo = (y: number) => {
  Object.defineProperty(window, 'scrollY', { value: y, configurable: true })
  window.dispatchEvent(new Event('scroll'))
  act(() => {
    vi.runAllTimers()
  })
}

describe('StickyCall', () => {
  afterEach(() => {
    vi.useRealTimers()
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true })
  })

  it('tucks away while scrolling down and comes back on the way up', () => {
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame'] })
    Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true })
    const { container } = render(<StickyCall />)
    const pill = () => container.querySelector('.sticky-call')!.classList.contains('is-shown')

    scrollTo(500)
    expect(pill()).toBe(false) // first screen still in view
    scrollTo(2000)
    expect(pill()).toBe(false) // scrolling down: reading
    scrollTo(1800)
    expect(pill()).toBe(true) // scrolling up
    scrollTo(1803)
    expect(pill()).toBe(true) // a few pixels of jitter change nothing
    scrollTo(2400)
    expect(pill()).toBe(false)
  })
})
