import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { LoomLiteArt } from '@/components/LiteArt'
import { useAfterPaint } from '@/hooks/useAfterPaint'
import { useLite } from '@/hooks/useLite'
import { loomStore } from '@/loom/store'

const LoomScene = lazy(() => import('@/loom/LoomScene').then((m) => ({ default: m.LoomScene })))

/** The loom from the home hero, framed on its own beside the contact headline. A still of the real loom on the lite and static tiers. */
export function ContactLoom({ reducedMotion }: { reducedMotion: boolean }) {
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
    loomStore.order = 0.45
  }, [])

  // Pause the WebGL loop once the header has scrolled away.
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
    <div ref={root} className={`cp-loom${ready || art ? ' is-ready' : ''}`} aria-hidden="true">
      {art ? (
        <LoomLiteArt poster="loom-contact" />
      ) : (
        active &&
        afterPaint && (
          <Suspense fallback={null}>
            <LoomScene view="contact" reducedMotion={reducedMotion} active={active} onReady={() => setReady(true)} />
          </Suspense>
        )
      )}
    </div>
  )
}
