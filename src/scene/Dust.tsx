import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { mulberry32 } from '@/lib/shapes'

/** Far, slow background dust that gives the scene depth and parallax. */
export function Dust({ count = 1200 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null)
  const positions = useMemo(() => {
    const rng = mulberry32(99)
    const p = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      p[i * 3] = (rng() - 0.5) * 40
      p[i * 3 + 1] = (rng() - 0.5) * 24
      p[i * 3 + 2] = -6 - rng() * 18
    }
    return p
  }, [count])

  useFrame(({ pointer }, delta) => {
    if (!ref.current) return
    ref.current.rotation.z += delta * 0.006
    ref.current.position.x += (pointer.x * 0.6 - ref.current.position.x) * 0.03
    ref.current.position.y += (pointer.y * 0.4 - ref.current.position.y) * 0.03
  })

  return (
    <points ref={ref} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#9aa0c8" transparent opacity={0.45} sizeAttenuation depthWrite={false} />
    </points>
  )
}
