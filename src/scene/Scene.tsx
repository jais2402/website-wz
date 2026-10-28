import { Canvas, useFrame } from '@react-three/fiber'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import { Component, type ReactNode, useEffect, useState } from 'react'
import { useBudgetDpr } from '@/hooks/useBudgetDpr'
import { useDocumentVisible } from '@/hooks/useDocumentVisible'
import { damp } from '@/lib/math'
import { canvasSlot } from '@/lib/canvasSlot'
import { homeGate } from '@/lib/loadGate'
import { sceneStore } from '@/lib/sceneStore'
import { Dust } from './Dust'
import { gfx, useGfxLive } from '@/gfx/gfxMode'
import { watchFrames } from '@/gfx/frameTest'
import { Globe } from './Globe'
import { ThreadField } from './ThreadField'
import { Warmup } from './Warmup'

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
  const budgetDpr = useBudgetDpr()
  // Poster mode (no live hero loom: a weak GPU, or ?gfx=poster) keeps the story scenes but lighter: at most 1x
  // pixels, half the threads and riders, and smaller shapes. The live mode is unchanged. A machine that turns out too
  // slow for the live scenes (hero or story) switches to it on the spot.
  const lite = !useGfxLive()
  const dpr = lite ? Math.min(1, budgetDpr) : budgetDpr
  const [active, setActive] = useState(true)
  // Keeps rendering until the shaders are compiled and drawn once, even before a 3D zone is on screen.
  const [warm, setWarm] = useState(false)
  const [heroVisible, setHeroVisible] = useState(canvasSlot.heroVisible)
  const visible = useDocumentVisible()
  useEffect(() => canvasSlot.subscribe(setHeroVisible), [])
  // One WebGL context at a time: mounted once while the preloader runs (shaders compiled and cached), then whenever
  // the hero's loom is off screen. It mounts as soon as the hero leaves (not when a 3D zone arrives), so the shaders
  // are rebuilt during the sections before the story and the threads are there the moment it scrolls in; between
  // the story and the globe it stays mounted and only pauses. Unmounting tears down the context and its loop.
  // Poster mode has no hero WebGL to share with, so the story stays mounted throughout.
  const mounted = lite || !warm || !heroVisible

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

  // The story and globe are watched like the hero: kept under ~25 fps, they switch to the lighter scene.
  const watching = mounted && warm && active && visible && !lite && !reducedMotion && gfx.mode !== 'live'
  useEffect(() => {
    if (!watching) return
    return watchFrames(() => gfx.markSlow())
  }, [watching])

  return (
    <div className={`canvas-root${active ? '' : ' is-paused'}`} aria-hidden="true">
      <WebGLBoundary>
        {mounted && (
          <Canvas
            // Switching to the lighter scene rebuilds the canvas with its smaller buffers.
            key={lite ? 'lite' : 'full'}
            frameloop={(active || !warm) && visible ? 'always' : 'never'}
            dpr={dpr}
            camera={{ position: [0, 0, 7.5], fov: 45, near: 0.1, far: 60 }}
            gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
          >
            <Warmup
              onDone={() => {
                setWarm(true)
                homeGate?.done('scene')
              }}
            />
            <CameraRig />
            <Dust count={mobile ? 425 : 1190} />
            <ThreadField
              quality={
                lite
                  ? mobile
                    ? { strands: 150, points: 80, riders: 600 }
                    : { strands: 300, points: 100, riders: 1200 }
                  : mobile
                    ? { strands: 320, points: 90, riders: 1600 }
                    : { strands: 640, points: 120, riders: 3000 }
              }
              size={lite ? 0.78 : 1}
              reducedMotion={reducedMotion}
            />
            <Globe dots={mobile ? 1400 : 2600} reducedMotion={reducedMotion} />
            {/* Loom-style glow on desktop; phones skip post-processing to keep frame rates up. */}
            {!mobile && (
              <EffectComposer multisampling={0}>
                <Bloom
                  mipmapBlur
                  levels={6}
                  resolutionScale={0.5}
                  intensity={0.55}
                  luminanceThreshold={0.32}
                  luminanceSmoothing={0.4}
                  radius={0.65}
                />
              </EffectComposer>
            )}
          </Canvas>
        )}
      </WebGLBoundary>
    </div>
  )
}
