import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { LoomLiteArt } from '@/components/LiteArt'
import { useLite } from '@/hooks/useLite'
import { loomStore } from '@/loom/store'

const LoomScene = lazy(() => import('@/loom/LoomScene').then((m) => ({ default: m.LoomScene })))

/** The loom from the home hero, framed on its own beside the contact headline. Static SVG art in lite mode. */
export function ContactLoom({ reducedMotion }: { reducedMotion: boolean }) {
  const { lite, fallBack } = useLite()
  const root = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(true)
  const [ready, setReady] = useState(false)

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
    const onLost = () => fallBack('WebGL context lost')
    canvas.addEventListener('webglcontextlost', onLost)
    return () => canvas.removeEventListener('webglcontextlost', onLost)
  }, [ready, fallBack])

  return (
    <div ref={root} className={`cp-loom${ready || lite ? ' is-ready' : ''}`} aria-hidden="true">
      {lite ? (
        <LoomLiteArt />
      ) : (
        <Suspense fallback={null}>
          <LoomScene view="contact" reducedMotion={reducedMotion} active={active} onReady={() => setReady(true)} />
        </Suspense>
      )}
    </div>
  )
}
