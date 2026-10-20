import { useEffect } from 'react'

/**
 * CSS loops (marquee, orbit rings, case-card runners, dashes) keep running when their section is far off screen,
 * which costs battery on phones. Marks each <main> section that is out of view with `.is-offscreen`; index.css
 * pauses every animation inside it. The WebGL canvases pause themselves the same way.
 */
export function usePauseOffscreen() {
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const sections = [...document.querySelectorAll<HTMLElement>('main > section, main > * > section')]
    if (!sections.length) return
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.target.classList.toggle('is-offscreen', !e.isIntersecting)),
      { rootMargin: '200px 0px' },
    )
    sections.forEach((s) => io.observe(s))
    return () => {
      io.disconnect()
      sections.forEach((s) => s.classList.remove('is-offscreen'))
    }
  }, [])
}
