import { Canvas, useFrame } from '@react-three/fiber'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import { Component, type ReactNode, useEffect, useState } from 'react'
import { useBudgetDpr } from '@/hooks/useBudgetDpr'
import { useLite } from '@/hooks/useLite'
import { useDocumentVisible } from '@/hooks/useDocumentVisible'
import { damp } from '@/lib/math'
import { canvasSlot } from '@/lib/canvasSlot'
import { homeGate } from '@/lib/loadGate'
import { sceneStore } from '@/lib/sceneStore'
import { Dust } from './Dust'
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
  // Lite tier (software renderer): the same scene and look (bloom included), fewer threads, framed smaller beside
  // the copy and at a lower internal resolution.
  const liteGl = useLite().tier === 'lite'
  const budget = useBudgetDpr()
  // Lite: the canvas is a small box beside the copy (about 0.5M px), so it can render near 1x and stay sharp.
  const dpr = liteGl ? Math.min(0.85, budget) : budget
  const [active, setActive] = useState(true)
  // Keeps rendering until the shaders are compiled and drawn once, even before a 3D zone is on screen.
  const [warm, setWarm] = useState(false)
  const [heroVisible, setHeroVisible] = useState(canvasSlot.heroVisible)
  const visible = useDocumentVisible()
  useEffect(() => canvasSlot.subscribe(setHeroVisible), [])
  // One WebGL context at a time: mounted once while the preloader runs (shaders compiled and cached), then only
  // while a 3D zone is on screen and the hero's loom is not. Unmounting tears down the context and its loop.
  const mounted = !warm || (active && !heroVisible)

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
        {mounted && (
          <Canvas
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
            {/* Lite: no dust; inside the boxed canvas it only outlined the box. */}
            {!liteGl && <Dust count={mobile ? 425 : 1190} />}
            <ThreadField
              quality={
                liteGl
                  ? { strands: 380, points: 100, riders: 1500 }
                  : mobile
                    ? { strands: 320, points: 90, riders: 1600 }
                    : { strands: 640, points: 120, riders: 3000 }
              }
              boost={1}
              framed={liteGl}
              reducedMotion={reducedMotion}
            />
            <Globe dots={mobile ? 1400 : 2600} reducedMotion={reducedMotion} framed={liteGl} />
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
