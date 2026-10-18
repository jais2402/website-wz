import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { countries } from '@/content/site'
import { damp } from '@/lib/math'
import { sceneStore } from '@/lib/sceneStore'
import { latLonToVec3 } from '@/lib/shapes'

const vertex = /* glsl */ `
uniform float uTime;
uniform float uPixelRatio;
attribute float aPhase;
varying float vPulse;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  vPulse = 0.5 + 0.5 * sin(uTime * 2.4 + aPhase);
  gl_PointSize = (90.0 + vPulse * 60.0) * uPixelRatio / -mv.z;
}
`

const fragment = /* glsl */ `
uniform float uOpacity;
varying float vPulse;
void main() {
  float r = length(gl_PointCoord - 0.5);
  float ring = smoothstep(0.5, 0.42, r) * smoothstep(0.30, 0.38, r) * (1.0 - vPulse * 0.6);
  float dot = smoothstep(0.16, 0.0, r);
  gl_FragColor = vec4(vec3(0.776, 1.0, 0.239), (ring + dot) * uOpacity);
}
`

/** Pulsing pins for the 11 countries; fades in only on the globe stage. Must sit inside the particle group. */
export function Markers() {
  const opacity = useRef(0)
  const material = useRef<THREE.ShaderMaterial>(null)
  const geometry = useMemo(() => {
    const pos = new Float32Array(countries.length * 3)
    const phase = new Float32Array(countries.length)
    countries.forEach((c, i) => {
      pos.set(latLonToVec3(c.lat, c.lon, 2.34), i * 3)
      phase[i] = i * 1.7
    })
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1))
    return g
  }, [])

  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uOpacity: { value: 0 }, uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) } }),
    [],
  )

  useFrame(({ clock }, delta) => {
    const target = sceneStore.stage > 3.6 ? 1 : 0
    opacity.current = damp(opacity.current, target, 4, Math.min(delta, 0.05))
    // Write through the live material (see ParticleField for why).
    const u = material.current?.uniforms
    if (!u) return
    u.uOpacity.value = opacity.current
    u.uTime.value = clock.elapsedTime
  })

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={material}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
