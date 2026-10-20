import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { LoomLiteArt } from '@/components/LiteArt'
import { useAfterPaint } from '@/hooks/useAfterPaint'
import { useLite } from '@/hooks/useLite'
import { usePrefersReducedMotion } from '@/hooks/motion'
import type { LoomVariant } from '@/loom/LoomScene'
import { loomStore } from '@/loom/store'
import './heroLoom.css'

const LoomScene = lazy(() => import('@/loom/LoomScene').then((m) => ({ default: m.LoomScene })))

/**
 * A loom beside an inner page's headline (PageHero `visual`): same language as the home hero, its own shape per
 * page (`variant`, see LoomScene).
 * A still of the real loom on the lite and static tiers; the WebGL loop pauses once the hero scrolls away.
 */
export function HeroLoom({ variant = 'classic' }: { variant?: LoomVariant }) {
  const reducedMotion = usePrefersReducedMotion()
  const { tier, demote } = useLite()
  // Static (no WebGL): a still of the real loom. Lite (software renderer): the light loom. Full: the full loom.
  const art = tier === 'static'
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

  useEffect(() => {
    const canvas = root.current?.querySelector('canvas')
    if (!ready || !canvas) return
    // A real GPU loss happens on a canvas still on the page; our own unmount (off screen) also fires this event,
    // on a canvas that has already been removed, and must not demote the page.
    const onLost = () => {
      if (canvas.isConnected) demote(tier === 'full' ? 'lite' : 'static', 'WebGL context lost')
    }
    canvas.addEventListener('webglcontextlost', onLost)
    return () => canvas.removeEventListener('webglcontextlost', onLost)
  }, [ready, demote, tier])

  return (
    <div ref={root} className={`hero-loom is-${variant}${ready || art ? ' is-ready' : ''}`} aria-hidden="true">
      {art ? (
        <LoomLiteArt
          poster={variant === 'spindle' ? 'loom-spindle' : variant === 'frayed' ? 'loom-frayed' : 'loom-contact'}
        />
      ) : (
        active &&
        afterPaint && (
          <Suspense fallback={null}>
            <LoomScene
              light={tier === 'lite'}
              view="contact"
              variant={variant}
              reducedMotion={reducedMotion}
              active={active}
              onReady={() => setReady(true)}
            />
          </Suspense>
        )
      )}
    </div>
  )
}
