import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { buildParticles, buildStrands } from '@/lib/loom'
import { damp } from '@/lib/math'
import { sceneStore } from '@/lib/sceneStore'
import { stageWeights } from '@/lib/shapes'
import { riderFragment, riderVertex, threadFragment, threadVertex } from './threadShaders'

type Quality = { strands: number; points: number; riders: number }
type Props = { quality: Quality; reducedMotion: boolean }

const STAGES = 4
// Horizontal offset per stage (fraction of viewport width) so the shape sits beside the glass card.
const STAGE_OFFSET_X = [0.08, 0.2, 0.22, 0.22]

function makeUniforms(extra: Record<string, THREE.IUniform> = {}) {
  return {
    uTime: { value: 0 },
    uStage: { value: 0 },
    uPointer: { value: new THREE.Vector2(99, 99) },
    uPointerStrength: { value: 0 },
    uFade: { value: 1 },
    ...extra,
  }
}

/**
 * The pinned story in the loom's language: loose threads (stage 0) weave into a panel (Simplify), climb a helix
 * cone (Scale) and wrap a sphere round a glowing core (Secure). Particles ride the threads.
 */
export function ThreadField({ quality, reducedMotion }: Props) {
  const group = useRef<THREE.Group>(null)
  const threadMat = useRef<THREE.ShaderMaterial>(null)
  const riderMat = useRef<THREE.ShaderMaterial>(null)
  const core = useRef<THREE.Mesh>(null)
  const coreMat = useRef<THREE.MeshBasicMaterial>(null)
  const stage = useRef(sceneStore.stage)
  const spin = useRef(0)
  const pointer = useRef(new THREE.Vector2(99, 99))
  const visibleFade = useRef(1)
  const { viewport, gl } = useThree()

  const { threadGeo, riderGeo } = useMemo(() => {
    const data = buildStrands(quality.strands, quality.points, 31)
    const threadGeo = new THREE.BufferGeometry()
    threadGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(data.t.length * 3), 3))
    threadGeo.setAttribute('aT', new THREE.BufferAttribute(data.t, 1))
    threadGeo.setAttribute('aSeed', new THREE.BufferAttribute(data.seed, 4))
    threadGeo.setIndex(new THREE.BufferAttribute(data.index, 1))
    threadGeo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 20)

    const p = buildParticles(quality.riders, data.strandSeeds, 47)
    const riderGeo = new THREE.BufferGeometry()
    riderGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(quality.riders * 3), 3))
    riderGeo.setAttribute('aSeed', new THREE.BufferAttribute(p.seed, 4))
    riderGeo.setAttribute('aPhase', new THREE.BufferAttribute(p.phase, 1))
    riderGeo.setAttribute('aSpeed', new THREE.BufferAttribute(p.speed, 1))
    riderGeo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 20)
    return { threadGeo, riderGeo }
  }, [quality])

  const threadUniforms = useMemo(() => makeUniforms(), [])
  const riderUniforms = useMemo(() => makeUniforms({ uPixelRatio: { value: Math.min(gl.getPixelRatio(), 2) } }), [gl])

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05)
    stage.current = reducedMotion ? sceneStore.stage : damp(stage.current, sceneStore.stage, 3, dt)
    const s = Math.min(STAGES - 1, stage.current)
    const weights = stageWeights(s, STAGES)
    const time = reducedMotion ? 4 : state.clock.elapsedTime

    pointer.current.x = damp(pointer.current.x, (state.pointer.x * viewport.width) / 2, 8, dt)
    pointer.current.y = damp(pointer.current.y, (state.pointer.y * viewport.height) / 2, 8, dt)
    const strength = reducedMotion || viewport.width < 6 ? 0 : 1
    // Hand-off to the countries globe: the woven sphere fades as the globe fades in.
    visibleFade.current = damp(visibleFade.current, 1 - sceneStore.globe, 4, dt)

    // Write through the live materials (see CLAUDE.md, 3D rule 4).
    for (const mat of [threadMat.current, riderMat.current]) {
      if (!mat) continue
      mat.uniforms.uTime.value = time
      mat.uniforms.uStage.value = s
      ;(mat.uniforms.uPointer.value as THREE.Vector2).copy(pointer.current)
      mat.uniforms.uPointerStrength.value = strength
      mat.uniforms.uFade.value = visibleFade.current
    }

    // Glowing core appears only inside the Secure sphere.
    if (coreMat.current && core.current) {
      coreMat.current.opacity = weights[3] * visibleFade.current
      core.current.scale.setScalar((0.16 + weights[3] * 0.14) * (1 + Math.sin(time * 2) * 0.06))
    }

    if (!group.current) return
    const sideBySide = viewport.width > 5.2
    group.current.position.x = sideBySide ? weights.reduce((a, w, i) => a + w * STAGE_OFFSET_X[i], 0) * viewport.width : 0
    // On phones the copy card sits at the bottom, so lift the shape into the top half once the story starts.
    group.current.position.y = sideBySide ? 0 : (1 - weights[0]) * viewport.height * 0.2
    group.current.scale.setScalar(Math.min(1, viewport.width / 11) * (sideBySide ? 1 : 0.85))

    // The woven panel faces the viewer like a dashboard; the cone and sphere turn slowly.
    if (!reducedMotion) spin.current += dt * 0.16
    const turning = weights[2] + weights[3]
    group.current.rotation.y = spin.current * turning - weights[1] * 0.18 + state.pointer.x * 0.15
    group.current.rotation.x = 0.12 * weights[1] + 0.22 * weights[2] + 0.15 * weights[3] - state.pointer.y * 0.08
  })

  return (
    <group ref={group}>
      <lineSegments geometry={threadGeo} frustumCulled={false}>
        <shaderMaterial
          ref={threadMat}
          vertexShader={threadVertex}
          fragmentShader={threadFragment}
          uniforms={threadUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
      <points geometry={riderGeo} frustumCulled={false}>
        <shaderMaterial
          ref={riderMat}
          vertexShader={riderVertex}
          fragmentShader={riderFragment}
          uniforms={riderUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <mesh ref={core}>
        <icosahedronGeometry args={[1, 3]} />
        <meshBasicMaterial ref={coreMat} color={[1.15, 1.05, 0.75]} transparent opacity={0} toneMapped={false} />
      </mesh>
    </group>
  )
}
