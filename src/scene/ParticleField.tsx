import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { damp } from '@/lib/math'
import { sceneStore } from '@/lib/sceneStore'
import { buildStages, mulberry32, stageWeights } from '@/lib/shapes'
import { Markers } from './Markers'
import { particleFragment, particleVertex } from './shaders'

type Props = { count: number; reducedMotion: boolean }

// Horizontal offset per stage, as a fraction of viewport width, so the shape sits beside the copy (hero is centred).
const STAGE_OFFSET_X = [0, 0.2, 0.22, 0.22, 0.24]

export function ParticleField({ count, reducedMotion }: Props) {
  const group = useRef<THREE.Group>(null)
  const material = useRef<THREE.ShaderMaterial>(null)
  const stage = useRef(sceneStore.stage)
  const spin = useRef(0)
  const { viewport, gl } = useThree()

  const geometry = useMemo(() => {
    const stages = buildStages(count)
    const g = new THREE.BufferGeometry()
    // `position` is required by three for bounds; aPos0 carries the real data.
    g.setAttribute('position', new THREE.BufferAttribute(stages[0], 3))
    stages.forEach((s, i) => g.setAttribute(`aPos${i}`, new THREE.BufferAttribute(s, 3)))
    const random = new Float32Array(count)
    const tint = new Float32Array(count)
    const rng = mulberry32(42)
    for (let i = 0; i < count; i++) {
      random[i] = rng()
      tint[i] = rng()
    }
    g.setAttribute('aRandom', new THREE.BufferAttribute(random, 1))
    g.setAttribute('aTint', new THREE.BufferAttribute(tint, 1))
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 10)
    return g
  }, [count])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uStage: { value: sceneStore.stage },
      uPixelRatio: { value: Math.min(gl.getPixelRatio(), 2) },
      uSize: { value: 42 },
      uPointer: { value: new THREE.Vector3(99, 99, 0) },
      uPointerStrength: { value: 0 },
      uOpacity: { value: 1 },
      uColorA: { value: new THREE.Color('#c6ff3d') },
      uColorB: { value: new THREE.Color('#8b7bff') },
      uColorC: { value: new THREE.Color('#ff7a59') },
    }),
    [gl],
  )

  useFrame(({ clock, pointer }, delta) => {
    // Write through the live material: R3F may hand the material a different uniforms object than our memo
    // (e.g. under StrictMode double-render), so mutating `uniforms` directly would never reach the GPU.
    const u = material.current?.uniforms as typeof uniforms | undefined
    if (!u) return
    const dt = Math.min(delta, 0.05)
    stage.current = reducedMotion ? sceneStore.stage : damp(stage.current, sceneStore.stage, 3.2, dt)
    const s = stage.current
    const weights = stageWeights(s)

    u.uStage.value = s
    if (!reducedMotion) u.uTime.value = clock.elapsedTime

    // Pointer in world units on the z=0 plane; repulsion fades out on small screens.
    const target = u.uPointer.value
    target.x = damp(target.x, (pointer.x * viewport.width) / 2, 8, dt)
    target.y = damp(target.y, (pointer.y * viewport.height) / 2, 8, dt)
    u.uPointerStrength.value = reducedMotion || viewport.width < 6 ? 0 : 1

    if (!group.current) return
    // Side-by-side layout from ~tablet width up; on phones the shape stays centred behind a glass card.
    const sideBySide = viewport.width > 5.2
    const offsetX = sideBySide ? weights.reduce((acc, w, i) => acc + w * STAGE_OFFSET_X[i], 0) * viewport.width : 0
    group.current.position.x = offsetX
    // On phones the copy card sits at the bottom, so lift the shape into the top half once the story starts.
    group.current.position.y = sideBySide ? 0 : (1 - weights[0]) * viewport.height * 0.2
    group.current.scale.setScalar(Math.min(1, viewport.width / 11) * (sideBySide ? 1 - (1 - weights[0]) * 0.15 : 1))

    // Spin everywhere except the grid stage, which faces the viewer like a dashboard.
    if (!reducedMotion) spin.current += dt * (0.12 + weights[4] * 0.1)
    const facing = 1 - weights[1]
    group.current.rotation.y = spin.current * facing + pointer.x * 0.15
    group.current.rotation.x = -0.18 * weights[1] + weights[2] * 0.2 + pointer.y * -0.08 + weights[4] * 0.25
  })

  return (
    <group ref={group}>
      <points geometry={geometry} frustumCulled={false}>
        <shaderMaterial
          ref={material}
          vertexShader={particleVertex}
          fragmentShader={particleFragment}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <Markers />
    </group>
  )
}
