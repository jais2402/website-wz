import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { LoomLiteArt } from '@/components/LiteArt'
import { useFpsWatchdog, useLite } from '@/hooks/useLite'
import { usePrefersReducedMotion } from '@/hooks/motion'
import type { LoomVariant } from '@/loom/LoomScene'
import { loomStore } from '@/loom/store'
import './heroLoom.css'

const LoomScene = lazy(() => import('@/loom/LoomScene').then((m) => ({ default: m.LoomScene })))

/**
 * A loom beside an inner page's headline (PageHero `visual`): same language as the home hero, its own shape per
 * page (`variant`, see LoomScene).
 * Static SVG art in lite mode; the WebGL loop pauses once the hero scrolls away.
 */
export function HeroLoom({ variant = 'classic' }: { variant?: LoomVariant }) {
  const reducedMotion = usePrefersReducedMotion()
  const { lite, fallBack } = useLite()
  const root = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(true)
  const [ready, setReady] = useState(false)
  useFpsWatchdog(ready && active)

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

  useEffect(() => {
    const canvas = root.current?.querySelector('canvas')
    if (!ready || !canvas) return
    const onLost = () => fallBack('WebGL context lost')
    canvas.addEventListener('webglcontextlost', onLost)
    return () => canvas.removeEventListener('webglcontextlost', onLost)
  }, [ready, fallBack])

  return (
    <div ref={root} className={`hero-loom is-${variant}${ready || lite ? ' is-ready' : ''}`} aria-hidden="true">
      {lite ? (
        <LoomLiteArt />
      ) : (
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
