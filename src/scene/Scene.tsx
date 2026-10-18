import { Canvas, useFrame } from '@react-three/fiber'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import { Component, type ReactNode, useEffect, useState } from 'react'
import { damp } from '@/lib/math'
import { sceneStore } from '@/lib/sceneStore'
import { Dust } from './Dust'
import { Globe } from './Globe'
import { ThreadField } from './ThreadField'

/** Renders a static gradient if WebGL is unavailable instead of crashing the page. */
class WebGLBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? <div className="canvas-fallback" /> : this.props.children
  }
}

function CameraRig() {
  useFrame(({ camera, pointer }, delta) => {
    const dt = Math.min(delta, 0.05)
    camera.position.x = damp(camera.position.x, pointer.x * 0.35, 2.5, dt)
    camera.position.y = damp(camera.position.y, pointer.y * 0.25, 2.5, dt)
    camera.position.z = damp(camera.position.z, 7.5 - sceneStore.dolly * 1.2, 2.5, dt)
    camera.lookAt(0, 0, 0)
  })
  return null
}

function useIsMobile() {
  const [mobile] = useState(() => window.matchMedia('(max-width: 768px), (pointer: coarse)').matches)
  return mobile
}

/**
 * The single fixed WebGL canvas behind the page. It only renders while a `[data-3d-zone]` section
 * is on screen; opaque sections cover it and the frame loop pauses to save battery.
 */
export function Scene({ reducedMotion }: { reducedMotion: boolean }) {
  const mobile = useIsMobile()
  const [active, setActive] = useState(true)

  useEffect(() => {
    const zones = Array.from(document.querySelectorAll('[data-3d-zone]'))
    const onScreen = new Set<Element>()
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) onScreen.add(e.target)
          else onScreen.delete(e.target)
        }
        sceneStore.visible = onScreen.size > 0
        setActive(sceneStore.visible)
      },
      { rootMargin: '10% 0px' },
    )
    zones.forEach((z) => io.observe(z))
    return () => io.disconnect()
  }, [])

  return (
    <div className={`canvas-root${active ? '' : ' is-paused'}`} aria-hidden="true">
      <WebGLBoundary>
        <Canvas
          frameloop={active ? 'always' : 'never'}
          dpr={[1, mobile ? 1.5 : 2]}
          camera={{ position: [0, 0, 7.5], fov: 45, near: 0.1, far: 60 }}
          gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        >
          <CameraRig />
          <Dust count={mobile ? 425 : 1190} />
          <ThreadField
            quality={mobile ? { strands: 320, points: 90, riders: 1600 } : { strands: 760, points: 130, riders: 4200 }}
            reducedMotion={reducedMotion}
          />
          <Globe dots={mobile ? 1400 : 2600} reducedMotion={reducedMotion} />
          {/* Loom-style glow on desktop; phones skip post-processing to keep frame rates up. */}
          {!mobile && (
            <EffectComposer multisampling={0}>
              <Bloom mipmapBlur intensity={0.55} luminanceThreshold={0.32} luminanceSmoothing={0.4} radius={0.65} />
            </EffectComposer>
          )}
        </Canvas>
      </WebGLBoundary>
    </div>
  )
}
