import { Billboard } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { buildParticles, buildStrands } from '@/lib/loom'
import { damp } from '@/lib/math'
import { glowFragment, glowVertex, particleFragment, particleVertex, strandFragment, strandVertex } from './shaders'
import { loomStore } from './store'

type Quality = { strands: number; points: number; particles: number }

/** Shared uniforms are written every frame through each material's own uniforms (see CLAUDE.md, rule 4). */
function writeCommon(u: Record<string, THREE.IUniform>, time: number, pointer: THREE.Vector2, strength: number) {
  u.uTime.value = time
  u.uOrder.value = loomStore.order
  ;(u.uPointer.value as THREE.Vector2).copy(pointer)
  u.uPointerStrength.value = strength
}

function makeCommonUniforms() {
  return {
    uTime: { value: 0 },
    uOrder: { value: 0 },
    uPointer: { value: new THREE.Vector2(99, 99) },
    uPointerStrength: { value: 0 },
  }
}

export type LoomView = 'hero' | 'contact'

function Threads({ quality, reducedMotion, view }: { quality: Quality; reducedMotion: boolean; view: LoomView }) {
  const strandMat = useRef<THREE.ShaderMaterial>(null)
  const particleMat = useRef<THREE.ShaderMaterial>(null)
  const pointer = useRef(new THREE.Vector2(99, 99))
  const { viewport, gl } = useThree()

  const { strandGeo, particleGeo } = useMemo(() => {
    const data = buildStrands(quality.strands, quality.points)
    const strandGeo = new THREE.BufferGeometry()
    strandGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(data.t.length * 3), 3))
    strandGeo.setAttribute('aT', new THREE.BufferAttribute(data.t, 1))
    strandGeo.setAttribute('aSeed', new THREE.BufferAttribute(data.seed, 4))
    strandGeo.setIndex(new THREE.BufferAttribute(data.index, 1))
    strandGeo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 40)

    const p = buildParticles(quality.particles, data.strandSeeds)
    const particleGeo = new THREE.BufferGeometry()
    particleGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(quality.particles * 3), 3))
    particleGeo.setAttribute('aSeed', new THREE.BufferAttribute(p.seed, 4))
    particleGeo.setAttribute('aPhase', new THREE.BufferAttribute(p.phase, 1))
    particleGeo.setAttribute('aSpeed', new THREE.BufferAttribute(p.speed, 1))
    particleGeo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 40)
    return { strandGeo, particleGeo }
  }, [quality])

  const strandUniforms = useMemo(() => makeCommonUniforms(), [])
  const particleUniforms = useMemo(
    () => ({ ...makeCommonUniforms(), uPixelRatio: { value: Math.min(gl.getPixelRatio(), 2) } }),
    [gl],
  )

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05)
    const time = reducedMotion ? 6 : state.clock.elapsedTime
    // Pointer on the z=0 plane, eased so threads part smoothly instead of snapping.
    pointer.current.x = damp(pointer.current.x, (state.pointer.x * viewport.width) / 2 + state.camera.position.x * 0.5, 6, dt)
    pointer.current.y = damp(pointer.current.y, (state.pointer.y * viewport.height) / 2, 6, dt)
    // The contact canvas sits under the page copy and gets no pointer events, so no thread parting there.
    const strength = reducedMotion || view === 'contact' ? 0 : 1
    if (strandMat.current) writeCommon(strandMat.current.uniforms, time, pointer.current, strength)
    if (particleMat.current) writeCommon(particleMat.current.uniforms, time, pointer.current, strength)
  })

  return (
    <>
      <lineSegments geometry={strandGeo} frustumCulled={false}>
        <shaderMaterial
          ref={strandMat}
          vertexShader={strandVertex}
          fragmentShader={strandFragment}
          uniforms={strandUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
      <points geometry={particleGeo} frustumCulled={false}>
        <shaderMaterial
          ref={particleMat}
          vertexShader={particleVertex}
          fragmentShader={particleFragment}
          uniforms={particleUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </>
  )
}

// Rings of the loom, from the wide mouth to the narrow throat; then a flat dish (the spindle plate).
const RINGS = [
  { x: 0, r: 1.38, tube: 0.075 },
  { x: 0.75, r: 1.12, tube: 0.05 },
  { x: 1.6, r: 0.88, tube: 0.05 },
  { x: 2.55, r: 0.68, tube: 0.045 },
  { x: 3.45, r: 0.56, tube: 0.06 },
  { x: 4.5, r: 0.44, tube: 0.045 },
]
const DISH = { x: 5.6, r: 1.15 }
const STRUTS = 14

/** Lattice struts: each pair of neighbouring rings is joined by crossing diagonals, like a woven cage. */
function buildStruts(): THREE.BufferGeometry {
  const pts: number[] = []
  for (let i = 0; i < RINGS.length - 1; i++) {
    const a = RINGS[i]
    const b = RINGS[i + 1]
    for (let k = 0; k < STRUTS; k++) {
      const t0 = (k / STRUTS) * Math.PI * 2
      const t1 = ((k + 0.5) / STRUTS) * Math.PI * 2
      // forward diagonal and back diagonal
      pts.push(a.x, Math.cos(t0) * a.r, Math.sin(t0) * a.r, b.x, Math.cos(t1) * b.r, Math.sin(t1) * b.r)
      pts.push(a.x, Math.cos(t1) * a.r, Math.sin(t1) * a.r, b.x, Math.cos(t0) * b.r, Math.sin(t0) * b.r)
    }
  }
  // Spokes from the last ring out to the dish rim.
  const last = RINGS[RINGS.length - 1]
  for (let k = 0; k < 10; k++) {
    const t = (k / 10) * Math.PI * 2
    pts.push(last.x, Math.cos(t) * last.r, Math.sin(t) * last.r, DISH.x, Math.cos(t) * DISH.r, Math.sin(t) * DISH.r)
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
  return g
}

function Loom({ reducedMotion }: { reducedMotion: boolean }) {
  const cage = useRef<THREE.Group>(null)
  const dish = useRef<THREE.Group>(null)
  const struts = useMemo(() => buildStruts(), [])

  useFrame((_, delta) => {
    if (reducedMotion) return
    if (cage.current) cage.current.rotation.x += delta * 0.18
    if (dish.current) dish.current.rotation.x -= delta * 0.35
  })

  const metal = (
    <meshStandardMaterial color="#2b3042" metalness={0.9} roughness={0.32} emissive="#0c0f1a" />
  )

  return (
    <group>
      <group ref={cage}>
        {RINGS.map((r) => (
          <mesh key={r.x} position={[r.x, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[r.r, r.tube, 12, 96]} />
            {metal}
          </mesh>
        ))}
        <lineSegments geometry={struts}>
          <lineBasicMaterial color="#b9c0dc" transparent opacity={0.7} />
        </lineSegments>
        {/* Lamps around the mouth: bright enough to bloom. */}
        {Array.from({ length: 16 }, (_, i) => {
          const a = (i / 16) * Math.PI * 2
          return (
            <mesh key={i} position={[-0.02, Math.cos(a) * 1.38, Math.sin(a) * 1.38]} rotation={[a, 0, 0]}>
              <boxGeometry args={[0.06, 0.16, 0.05]} />
              <meshBasicMaterial color={[4, 3.6, 3]} toneMapped={false} />
            </mesh>
          )
        })}
      </group>

      <group ref={dish} position={[DISH.x, 0, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[DISH.r, DISH.r, 0.06, 64, 1, true]} />
          {metal}
        </mesh>
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[DISH.r, 0.045, 12, 96]} />
          {metal}
        </mesh>
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[DISH.r * 0.55, 0.02, 8, 64]} />
          <meshBasicMaterial color={[1.6, 1.3, 0.9]} toneMapped={false} />
        </mesh>
        {/* Hub collar the woven timeline exits through. */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.3, 0.38, 0.5, 32, 1, true]} />
          {metal}
        </mesh>
      </group>
    </group>
  )
}

function Glow({ position, scale, color, opacity = 1 }: { position: [number, number, number]; scale: number; color: string; opacity?: number }) {
  const mat = useRef<THREE.ShaderMaterial>(null)
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uColor: { value: new THREE.Color(color).multiplyScalar(opacity) } }), [color, opacity])
  useFrame(({ clock }) => {
    if (mat.current) mat.current.uniforms.uTime.value = clock.elapsedTime
  })
  return (
    <Billboard position={position}>
      <mesh scale={scale}>
        <planeGeometry />
        <shaderMaterial
          ref={mat}
          vertexShader={glowVertex}
          fragmentShader={glowFragment}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </Billboard>
  )
}

/** Contact page: a slow three-quarter orbit round the loom, with gentle parallax from the mouse anywhere on the page. */
function ContactRig({ reducedMotion }: { reducedMotion: boolean }) {
  const look = useRef(new THREE.Vector3())
  const mouse = useRef({ x: 0, y: 0 })
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.current.y = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])
  useFrame(({ camera, clock, size }, delta) => {
    const dt = Math.min(delta, 0.05)
    const sway = reducedMotion ? 0 : Math.sin(clock.elapsedTime * 0.12)
    const narrow = size.width < 640
    const tx = -1.6 + sway * 0.9 + mouse.current.x * 0.7
    const ty = 2.2 + mouse.current.y * 0.5
    const tz = narrow ? 12.5 : 11
    camera.position.x = damp(camera.position.x, tx, 2, dt)
    camera.position.y = damp(camera.position.y, ty, 2, dt)
    camera.position.z = damp(camera.position.z, tz, 2, dt)
    // Wide frames aim left of the loom so it rides to the right, clear of the headline.
    look.current.set(narrow ? 2.4 : 0.8, narrow ? 0 : -0.5, 0)
    camera.lookAt(look.current)
  })
  return null
}

/** Mouse parallax + scroll fly-in toward the loom mouth. Portrait screens pull back to fit the whole composition. */
function CameraRig() {
  const look = useRef(new THREE.Vector3())
  const mouth = useRef(new THREE.Vector3())
  useFrame(({ camera, pointer, size }, delta) => {
    const dt = Math.min(delta, 0.05)
    const portrait = size.height > size.width
    const p = loomStore.progress
    const baseZ = portrait ? 24 : 14
    const tx = (portrait ? 0.4 : -1.2) + p * 2.8 + pointer.x * 0.8
    const ty = 0.6 - p * 0.3 + pointer.y * 0.5
    const tz = baseZ - p * (portrait ? 11 : 6.5)
    camera.position.x = damp(camera.position.x, tx, 2.2, dt)
    camera.position.y = damp(camera.position.y, ty, 2.2, dt)
    camera.position.z = damp(camera.position.z, tz, 2.2, dt)
    // Aim below the loom so the composition rides in the upper part of the frame, above the copy.
    look.current.set(damp(look.current.x, (portrait ? 1.6 : -1.6) + p * 2.9, 2.2, dt), damp(look.current.y, portrait ? -1.5 : -1.8 + p * 1.8, 2.2, dt), 0)
    camera.lookAt(look.current)
    // Publish the mouth's screen position for the page's guide light.
    camera.updateMatrixWorld()
    mouth.current.set(-0.25, 0, 0).project(camera)
    loomStore.mouth.x = (mouth.current.x + 1) / 2
    loomStore.mouth.y = (1 - mouth.current.y) / 2
  })
  return null
}

type SceneProps = { reducedMotion: boolean; active: boolean; onReady?: () => void; view?: LoomView }

export function LoomScene({ reducedMotion, active, onReady, view = 'hero' }: SceneProps) {
  const quality = useMemo<Quality>(() => {
    const small = window.matchMedia('(max-width: 768px), (pointer: coarse)').matches
    return small ? { strands: 420, points: 110, particles: 2600 } : { strands: 1000, points: 150, particles: 7500 }
  }, [])

  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [-1.2, 0.6, 14], fov: 40, near: 0.1, far: 100 }}
      onCreated={onReady}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      frameloop={active ? 'always' : 'never'}
    >
      {/* Contact page: match the page ink so the masked edges melt into it. */}
      <color attach="background" args={[view === 'contact' ? '#07070c' : '#04050c']} />
      <ambientLight intensity={0.25} />
      <pointLight position={[-0.6, 0, 0]} color="#fff2df" intensity={60} distance={9} />
      <pointLight position={[6, 3, 4]} color="#6f7dff" intensity={25} distance={20} />
      <pointLight position={[3, -3, -3]} color="#c6ff3d" intensity={6} distance={12} />

      <Glow position={[-14, 0, -12]} scale={40} color="#1a2350" opacity={0.6} />
      <Glow position={[-0.25, 0, 0]} scale={2.8} color="#fff1dc" opacity={0.9} />
      <Glow position={[-0.4, 0, 0]} scale={9} color="#7f6cff" opacity={0.22} />

      <Threads quality={quality} reducedMotion={reducedMotion} view={view} />
      <Loom reducedMotion={reducedMotion} />
      {view === 'contact' ? <ContactRig reducedMotion={reducedMotion} /> : <CameraRig />}

      <EffectComposer multisampling={0}>
        <Bloom mipmapBlur intensity={0.85} luminanceThreshold={0.28} luminanceSmoothing={0.4} radius={0.7} />
        <Vignette eskil={false} offset={0.2} darkness={0.75} />
      </EffectComposer>
    </Canvas>
  )
}
