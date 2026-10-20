import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'

/** Longest wait for the GPU to finish linking before drawing anyway (compiling early is an optimisation only). */
const COMPILE_TIMEOUT_MS = 4000

/**
 * Compiles every shader in the scene up front, then reports once a few frames (post-processing included) have
 * rendered, so the first scroll never stalls on shader compilation. Renders nothing.
 *
 * Compiling is asynchronous where the browser supports it (KHR_parallel_shader_compile): the GPU driver links the
 * programs off the main thread while the scene is held back from drawing, because the first draw of a program that
 * is still linking blocks the main thread until it is done. Every caller shows the scene only after `onDone`
 * (the home preloader, the inner pages' fade-in), so holding it back is never visible.
 */
export function Warmup({ onDone, frames = 3 }: { onDone: () => void; frames?: number }) {
  // Read the live renderer and scene inside the effect: three.js objects are mutable by design.
  const get = useThree((state) => state.get)
  const count = useRef(0)
  const reported = useRef(false)
  const compiled = useRef(false)
  const cb = useRef(onDone)
  useEffect(() => {
    cb.current = onDone
  }, [onDone])

  useEffect(() => {
    const { gl, scene, camera } = get()
    let alive = true
    let timer = 0
    let pending: Promise<unknown> = Promise.resolve()
    try {
      // compile() collects the visible objects synchronously, so hide the scene only after this call.
      pending = gl.compileAsync(scene, camera)
    } catch {
      // Compiling early is an optimisation only.
    }
    const wasVisible = scene.visible
    scene.visible = false
    const release = () => {
      if (!alive || compiled.current) return
      compiled.current = true
      scene.visible = wasVisible
    }
    pending.catch(() => {}).then(release)
    timer = window.setTimeout(release, COMPILE_TIMEOUT_MS)
    return () => {
      alive = false
      window.clearTimeout(timer)
      if (!compiled.current) scene.visible = wasVisible
    }
  }, [get])

  useFrame(() => {
    if (reported.current || !compiled.current) return
    count.current += 1
    if (count.current >= frames) {
      reported.current = true
      cb.current()
    }
  })
  return null
}
