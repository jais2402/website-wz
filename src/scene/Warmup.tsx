import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'

/**
 * Compiles every shader in the scene up front, then reports once a few frames (post-processing included) have
 * rendered, so the first scroll never stalls on shader compilation. Renders nothing.
 */
export function Warmup({ onDone, frames = 3 }: { onDone: () => void; frames?: number }) {
  const { gl, scene, camera } = useThree()
  const count = useRef(0)
  const reported = useRef(false)
  const cb = useRef(onDone)
  useEffect(() => {
    cb.current = onDone
  }, [onDone])

  useEffect(() => {
    try {
      gl.compile(scene, camera)
    } catch {
      // Compiling early is an optimisation only.
    }
  }, [gl, scene, camera])

  useFrame(() => {
    if (reported.current) return
    count.current += 1
    if (count.current >= frames) {
      reported.current = true
      cb.current()
    }
  })
  return null
}
