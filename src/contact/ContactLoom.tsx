import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { useAfterPaint } from '@/hooks/useAfterPaint'
import { webgl } from '@/lib/webgl'
import { loomStore } from '@/loom/store'

const LoomScene = lazy(() => import('@/loom/LoomScene').then((m) => ({ default: m.LoomScene })))

/** The loom from the home hero, framed on its own beside the contact headline. */
export function ContactLoom({ reducedMotion }: { reducedMotion: boolean }) {
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

  return (
    <div ref={root} className={`cp-loom${ready ? ' is-ready' : ''}`} aria-hidden="true">
      {webgl &&
        active &&
        afterPaint && (
          <Suspense fallback={null}>
            <LoomScene view="contact" reducedMotion={reducedMotion} active={active} onReady={() => setReady(true)} />
          </Suspense>
        )}
    </div>
  )
}
