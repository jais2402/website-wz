import { useEffect, useRef } from 'react'

/**
 * Desktop-only trailing cursor ring that grows over interactive elements. Native cursor stays visible.
 * Its loop sleeps once the ring has caught up with the pointer and wakes on the next move.
 */
export function Cursor() {
  const ring = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return
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
    const move = (e: PointerEvent) => {
      x = e.clientX
      y = e.clientY
      const hot = (e.target as Element).closest('a, button, [role="tab"], .svc-card')
      el.classList.toggle('is-hot', !!hot)
      if (!raf) raf = requestAnimationFrame(loop)
    }
    window.addEventListener('pointermove', move, { passive: true })
    raf = requestAnimationFrame(loop)
    el.style.opacity = '1'
    return () => {
      window.removeEventListener('pointermove', move)
      cancelAnimationFrame(raf)
    }
  }, [])

  return <div ref={ring} className="cursor" aria-hidden="true" />
}
