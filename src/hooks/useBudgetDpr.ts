import { useEffect, useState } from 'react'
import { budgetDpr } from '@/lib/render'

/** Pixel ratio for a full-viewport 3D canvas, kept within the render budget; updates on resize. */
export function useBudgetDpr() {
  const read = () => budgetDpr(window.innerWidth, window.innerHeight, window.devicePixelRatio)
  const [dpr, setDpr] = useState(read)
  useEffect(() => {
    const on = () => setDpr(read())
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  return dpr
}
