import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { useEffect, useState } from 'react'
import { hashTarget } from '@/lib/hash'

gsap.registerPlugin(ScrollTrigger)

/**
 * ScrollTrigger measures pin positions on load and on window resize only. When the page height changes later
 * (a lazy section mounts, fonts swap, a card grows), every pin below starts and ends at the wrong scroll offset:
 * Our Work then unpinned early with its cards still moving. Re-measure whenever the document height changes.
 */
function watchPageHeight() {
  if (typeof window === 'undefined' || typeof ResizeObserver === 'undefined') return
  let measured = 0
  let timer = 0
  ScrollTrigger.addEventListener('refresh', () => {
    measured = document.documentElement.scrollHeight
  })
  const check = () => {
    window.clearTimeout(timer)
    timer = window.setTimeout(() => {
      if (Math.abs(document.documentElement.scrollHeight - measured) > 2) ScrollTrigger.refresh()
    }, 200)
  }
  new ResizeObserver(check).observe(document.body)
  document.fonts?.ready.then(check)
}
watchPageHeight()

export { gsap, ScrollTrigger }

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const on = () => setReduced(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return reduced
}

let lenis: Lenis | null = null

/**
 * Smoothly scrolls to an in-page hash, element or absolute Y position, falling back to native scrolling.
 * `immediate` jumps there with no animation (deep links on load).
 */
export function scrollToTarget(target: string | HTMLElement | number, { immediate = false } = {}) {
  if (lenis) lenis.scrollTo(target, { offset: 0, duration: 1.4, immediate, force: immediate })
  else if (typeof target === 'number') window.scrollTo({ top: target, behavior: immediate ? 'auto' : 'smooth' })
  else {
    const el = typeof target === 'string' ? document.querySelector(target) : target
    el?.scrollIntoView({ behavior: immediate ? 'auto' : 'smooth' })
  }
}

/**
 * Deep links (/#faq from another page): the browser's own jump happens before the pins and lazy sections exist,
 * so it lands on the hero. Once `ready`, re-measure the pins and jump to the hash; later hash changes scroll too.
 */
export function useHashScroll(ready: boolean) {
  useEffect(() => {
    if (!ready) return
    const go = (immediate: boolean) => {
      const id = hashTarget(window.location.hash)
      const el = id ? document.getElementById(id) : null
      if (el) scrollToTarget(el, { immediate })
    }
    const timer = window.setTimeout(() => {
      if (!hashTarget(window.location.hash)) return
      ScrollTrigger.refresh()
      go(true)
    }, 150)
    const onHash = () => go(false)
    window.addEventListener('hashchange', onHash)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('hashchange', onHash)
    }
  }, [ready])
}

/** Lenis smooth scrolling, driven by GSAP's ticker so ScrollTrigger stays in sync. Disabled for reduced motion. */
export function useSmoothScroll(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return
    lenis = new Lenis({ duration: 1.15, smoothWheel: true })
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => lenis?.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    return () => {
      gsap.ticker.remove(tick)
      lenis?.destroy()
      lenis = null
    }
  }, [enabled])
}

export function lockScroll(locked: boolean) {
  if (locked) lenis?.stop()
  else lenis?.start()
  document.documentElement.classList.toggle('is-locked', locked)
}
