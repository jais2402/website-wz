import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { useAfterPaint } from '@/hooks/useAfterPaint'
import { webgl } from '@/lib/webgl'
import { usePrefersReducedMotion } from '@/hooks/motion'
import type { LoomVariant } from '@/loom/LoomScene'
import { loomStore } from '@/loom/store'
import './heroLoom.css'

const LoomScene = lazy(() => import('@/loom/LoomScene').then((m) => ({ default: m.LoomScene })))

/**
 * A loom beside an inner page's headline (PageHero `visual`): same language as the home hero, its own shape per
 * page (`variant`, see LoomScene).
 * The WebGL loop pauses once the hero scrolls away; without WebGL the space stays empty.
 */
export function HeroLoom({ variant = 'classic' }: { variant?: LoomVariant }) {
  const reducedMotion = usePrefersReducedMotion()
  const root = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(true)
  const [ready, setReady] = useState(false)
  // three.js starts downloading only after the headline has painted.
  const afterPaint = useAfterPaint()

  // Threads come in half-calmed: tangled on the way in, ordered once they pass through the loom.
  useEffect(() => {
    loomStore.progress = 0
    loomStore.order = variant === 'frayed' ? 0 : 0.45
  }, [variant])

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting))
    if (root.current) io.observe(root.current)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={root} className={`hero-loom is-${variant}${ready ? ' is-ready' : ''}`} aria-hidden="true">
      {webgl &&
        active &&
        afterPaint && (
          <Suspense fallback={null}>
            <LoomScene
              view="contact"
              variant={variant}
              reducedMotion={reducedMotion}
              active={active}
              onReady={() => setReady(true)}
            />
          </Suspense>
        )}
    </div>
  )
}
