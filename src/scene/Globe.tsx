import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { countries, reach } from '@/content/site'
import { arcPoints, facingRotationY } from '@/lib/geo'
import { damp } from '@/lib/math'
import { sceneStore } from '@/lib/sceneStore'
import { latLonToVec3 } from '@/lib/shapes'

const R = 1.9
const ARC_SEGMENTS = 72

const arcVertex = /* glsl */ `
uniform float uTime;
uniform float uDraw;
uniform float uHighlight;
attribute float aT;
attribute float aArc;
varying float vAlpha;
varying float vHot;
void main() {
  // Each thread draws outward from Chennai as the globe fades in, then carries travelling light pulses.
  float drawn = step(aT, uDraw * (1.0 + aArc * 0.04));
  float pulse = smoothstep(0.09, 0.0, abs(fract(uTime * 0.28 + aArc * 0.137) - aT));
  float hl = abs(aArc - uHighlight) < 0.5 ? 1.0 : 0.0;
  vHot = max(pulse, hl);
  vAlpha = drawn * (0.55 + pulse * 0.6 + hl * 0.6);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const arcFragment = /* glsl */ `
uniform float uOpacity;
varying float vAlpha;
varying float vHot;
void main() {
  vec3 blue = vec3(0.42, 0.68, 1.0);
  vec3 col = mix(blue, vec3(0.9, 0.96, 1.0), vHot * 0.7);
  gl_FragColor = vec4(col, vAlpha * uOpacity);
}
`

/** Countries globe: dotted sphere, latitude rings, pins and gold threads from Chennai. Fades in with sceneStore.globe. */
export function Globe({ dots, reducedMotion }: { dots: number; reducedMotion: boolean }) {
  const group = useRef<THREE.Group>(null)
  const dotMat = useRef<THREE.PointsMaterial>(null)
  const ringMat = useRef<THREE.LineBasicMaterial>(null)
  const arcMat = useRef<THREE.ShaderMaterial>(null)
  const pins = useRef<(THREE.Mesh | null)[]>([])
  const fade = useRef(0)
  const draw = useRef(0)
  const { viewport } = useThree()

  const hqIndex = countries.findIndex((c) => c.name === reach.hq)
  const hq = countries[hqIndex]

  const { dotGeo, ringGeo, arcGeo, pinPositions } = useMemo(() => {
    // Even dot shell (Fibonacci sphere).
    const p = new Float32Array(dots * 3)
    for (let i = 0; i < dots; i++) {
      const k = i + 0.5
      const phi = Math.acos(1 - (2 * k) / dots)
      const theta = Math.PI * (1 + Math.sqrt(5)) * k
      p.set([Math.cos(theta) * Math.sin(phi) * R, Math.cos(phi) * R, Math.sin(theta) * Math.sin(phi) * R], i * 3)
    }
    const dotGeo = new THREE.BufferGeometry()
    dotGeo.setAttribute('position', new THREE.BufferAttribute(p, 3))

    // Latitude rings every 30°.
    const ring: number[] = []
    for (const lat of [-60, -30, 0, 30, 60]) {
      for (let i = 0; i < 96; i++) {
        const a = latLonToVec3(lat, (i / 96) * 360 - 180, R * 1.002)
        const b = latLonToVec3(lat, ((i + 1) / 96) * 360 - 180, R * 1.002)
        ring.push(...a, ...b)
      }
    }
    const ringGeo = new THREE.BufferGeometry()
    ringGeo.setAttribute('position', new THREE.Float32BufferAttribute(ring, 3))

    // One arc from the HQ to every other country, as line segments with progress + arc index attributes.
    const pos: number[] = []
    const t: number[] = []
    const arcIdx: number[] = []
    countries.forEach((c, ci) => {
      if (ci === hqIndex) return
      const pts = arcPoints(hq, c, R, ARC_SEGMENTS)
      for (let i = 0; i < ARC_SEGMENTS; i++) {
        pos.push(pts[i * 3], pts[i * 3 + 1], pts[i * 3 + 2], pts[i * 3 + 3], pts[i * 3 + 4], pts[i * 3 + 5])
        t.push(i / ARC_SEGMENTS, (i + 1) / ARC_SEGMENTS)
        arcIdx.push(ci, ci)
      }
    })
    const arcGeo = new THREE.BufferGeometry()
    arcGeo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
    arcGeo.setAttribute('aT', new THREE.Float32BufferAttribute(t, 1))
    arcGeo.setAttribute('aArc', new THREE.Float32BufferAttribute(arcIdx, 1))

    const pinPositions = countries.map((c) => latLonToVec3(c.lat, c.lon, R * 1.01))
    return { dotGeo, ringGeo, arcGeo, pinPositions }
  }, [dots, hq, hqIndex])

  const arcUniforms = useMemo(() => ({ uTime: { value: 0 }, uDraw: { value: 0 }, uHighlight: { value: -1 }, uOpacity: { value: 0 } }), [])
  const baseRotY = facingRotationY(62) // Chennai just right of centre; Europe, the Gulf and Australia in view

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05)
    fade.current = damp(fade.current, sceneStore.globe, 4, dt)
    draw.current = sceneStore.globe > 0.5 ? damp(draw.current, 1, 1.4, dt) : damp(draw.current, 0, 6, dt)
    const f = fade.current
    if (!group.current) return
    group.current.visible = f > 0.01
    if (!group.current.visible) return

    const time = reducedMotion ? 0 : state.clock.elapsedTime
    if (dotMat.current) dotMat.current.opacity = 0.5 * f
    if (ringMat.current) ringMat.current.opacity = 0.16 * f
    if (arcMat.current) {
      const u = arcMat.current.uniforms
      u.uTime.value = time
      u.uDraw.value = reducedMotion ? 1 : draw.current
      u.uHighlight.value = sceneStore.highlight
      u.uOpacity.value = f
    }
    pins.current.forEach((m, i) => {
      if (!m) return
      const isHq = i === hqIndex
      const lit = i === sceneStore.highlight
      const pulse = 1 + Math.sin(time * 3 + i) * 0.15
      m.scale.setScalar((isHq ? 1.8 : lit ? 1.6 : 1) * pulse * f)
    })

    const sideBySide = viewport.width > 5.2
    group.current.position.x = sideBySide ? viewport.width * 0.2 : 0
    // Phones: fill most of the width in the open space above the card.
    group.current.position.y = sideBySide ? 0 : viewport.height * 0.2
    const size = sideBySide ? Math.min(1, viewport.width / 10) : Math.min(1, viewport.width / 5.4)
    group.current.scale.setScalar(size * (0.9 + f * 0.1))
    // Gentle sway (not a full spin) so the threads stay in view; follows the pointer a little.
    // The globe sits right of the camera axis, so turn it back toward the camera by the viewing angle.
    const viewAngle = Math.atan2(-group.current.position.x, state.camera.position.z)
    group.current.rotation.y = baseRotY + viewAngle + Math.sin(time * 0.15) * 0.22 + state.pointer.x * 0.15
    group.current.rotation.x = 0.28 - state.pointer.y * 0.1
  })

  return (
    <group ref={group} visible={false}>
      <points geometry={dotGeo}>
        <pointsMaterial ref={dotMat} size={0.028} color="#9aa3c7" transparent opacity={0} depthWrite={false} sizeAttenuation />
      </points>
      <lineSegments geometry={ringGeo}>
        <lineBasicMaterial ref={ringMat} color="#8cc4ff" transparent opacity={0} depthWrite={false} />
      </lineSegments>
      <lineSegments geometry={arcGeo} frustumCulled={false}>
        <shaderMaterial
          ref={arcMat}
          vertexShader={arcVertex}
          fragmentShader={arcFragment}
          uniforms={arcUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
      {pinPositions.map((p, i) => (
        <mesh
          key={countries[i].name}
          position={p}
          ref={(m) => {
            pins.current[i] = m
          }}
        >
          <sphereGeometry args={[0.035, 12, 12]} />
          <meshBasicMaterial color={i === hqIndex ? [1.4, 1.9, 2.4] : [0.45, 0.95, 2.2]} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}
