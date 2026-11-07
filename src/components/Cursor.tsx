import { useEffect, useRef } from 'react'

/**
 * Desktop-only trailing cursor ring that grows over interactive elements. Native cursor stays visible.
 * Its loop sleeps once the ring has caught up with the pointer and wakes on the next move. Hidden until the pointer
 * first moves and while it is outside the window, so it never sits parked on the page (it used to wait at the centre
 * of the screen until the mouse moved). Scrolling re-checks what is under the pointer.
 */
export function Cursor() {
  const ring = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // A fine pointer only, and no trailing ring for visitors who asked for less motion.
    if (!window.matchMedia('(pointer: fine)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const el = ring.current
    if (!el) return
    let x = window.innerWidth / 2
    let y = window.innerHeight / 2
    let cx = x
    let cy = y
    let raf = 0
    const loop = () => {
      cx += (x - cx) * 0.18
      cy += (y - cy) * 0.18
      el.style.transform = `translate3d(${cx}px, ${cy}px, 0)`
      raf = Math.abs(x - cx) + Math.abs(y - cy) > 0.3 ? requestAnimationFrame(loop) : 0
    }
    let seen = false
    const hotAt = (target: Element | null) =>
      el.classList.toggle('is-hot', !!target?.closest('a, button, [role="tab"], .svc-card'))
    const move = (e: PointerEvent) => {
      x = e.clientX
      y = e.clientY
      if (!seen) {
        // First move: start from the pointer instead of trailing in from wherever the ring was.
        seen = true
        cx = x
        cy = y
      }
      el.style.opacity = '1'
      hotAt(e.target as Element)
      if (!raf) raf = requestAnimationFrame(loop)
    }
    const leave = () => {
      el.style.opacity = '0'
    }
    const scroll = () => {
      if (seen) hotAt(document.elementFromPoint(x, y))
    }
    window.addEventListener('pointermove', move, { passive: true })
    document.documentElement.addEventListener('pointerleave', leave)
    window.addEventListener('scroll', scroll, { passive: true })
    return () => {
      window.removeEventListener('pointermove', move)
      document.documentElement.removeEventListener('pointerleave', leave)
      window.removeEventListener('scroll', scroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  return <div ref={ring} className="cursor" aria-hidden="true" />
}
