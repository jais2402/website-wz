import { useEffect, useRef, useState } from 'react'

/**
 * For the pricing page's CSS-animated visuals: `seen` turns true the first time the element is on screen (it starts
 * the sequence and stays true), `visible` follows it on and off screen (pricing.css pauses every animation inside
 * while it is false). Both stay false in the prerender and without IntersectionObserver `seen` is set at once.
 */
export function useSeen<T extends HTMLElement>(threshold = 0.25) {
  const ref = useRef<T>(null)
  const [seen, setSeen] = useState(false)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      const t = window.setTimeout(() => {
        setSeen(true)
        setVisible(true)
      })
      return () => window.clearTimeout(t)
    }
    const io = new IntersectionObserver(
      ([e]) => {
        setVisible(e.isIntersecting)
        if (e.isIntersecting) setSeen(true)
      },
      { threshold },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [threshold])
  return { ref, seen, visible }
}
