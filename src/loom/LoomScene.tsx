import { Billboard } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { buildParticles, buildStrands } from '@/lib/loom'
import { useBudgetDpr } from '@/hooks/useBudgetDpr'
import { useDocumentVisible } from '@/hooks/useDocumentVisible'
import { damp } from '@/lib/math'
import { glowFragment, glowVertex, particleFragment, particleVertex, strandFragment, strandVertex } from './shaders'
import { Warmup } from '@/scene/Warmup'
import { loomStore } from './store'

type Quality = { strands: number; points: number; particles: number }

/**
 * Looms share one visual language but each page gets its own:
 * - classic: the home / contact loom, multicolour threads woven into gold.
 * - spindle: About. Rising on a diagonal, cool blue-violet threads winding up into a pale-blue weave, orbit rings.
 * - frayed: 404. Tilted and broken, warm coral-red threads that never come together, rings knocked out of line.
 */
export type LoomVariant = 'classic' | 'spindle' | 'frayed'

type VariantConfig = {
  range: [number, number]
  woven: [number, number, number]
  fray: number
  rotation: [number, number, number]
  lamp: [number, number, number]
  mouthGlow: string
  haloGlow: string
  light: string
}

const VARIANTS: Record<LoomVariant, VariantConfig> = {
  classic: {
    range: [0, 1],
    woven: [0.95, 0.78, 0.5],
    fray: 0,
    rotation: [0, 0, 0],
    lamp: [4, 3.6, 3],
    mouthGlow: '#fff1dc',
    haloGlow: '#7f6cff',
    light: '#fff2df',
  },
  spindle: {
    range: [0, 0.42],
    woven: [0.62, 0.8, 1],
    fray: 0,
    rotation: [0, 0, 0.62],
    lamp: [2.2, 3.2, 4.6],
    mouthGlow: '#e4f1ff',
    haloGlow: '#4d9fff',
    light: '#dcecff',
  },
  frayed: {
    range: [0.42, 0.44],
    woven: [1, 0.55, 0.42],
    fray: 1,
    rotation: [0.18, 0.1, -0.22],
    lamp: [4.4, 1.8, 1.2],
    mouthGlow: '#ffe1d4',
    haloGlow: '#ff7a59',
    light: '#ffd9c8',
  },
}

/** Shared uniforms are written every frame through each material's own uniforms (see CLAUDE.md, rule 4). */
function writeCommon(u: Record<string, THREE.IUniform>, time: number, pointer: THREE.Vector2, strength: number) {
  u.uTime.value = time
  u.uOrder.value = loomStore.order
  ;(u.uPointer.value as THREE.Vector2).copy(pointer)
  u.uPointerStrength.value = strength
}

function makeCommonUniforms(v: VariantConfig) {
  return {
    uTime: { value: 0 },
    uOrder: { value: 0 },
    uPointer: { value: new THREE.Vector2(99, 99) },
    uPointerStrength: { value: 0 },
    uRange: { value: new THREE.Vector2(...v.range) },
    uWoven: { value: new THREE.Color(...v.woven) },
    uFray: { value: v.fray },
    uSpread: { value: 1 },
  }
}

/** hero: full-screen home hero. contact: framed beside a headline. */
export type LoomView = 'hero' | 'contact'

function Threads({
  quality,
  reducedMotion,
  view,
  v,
  spread = 1,
}: {
  quality: Quality
  reducedMotion: boolean
  view: LoomView
  /** Tangle reach (shader uSpread): below 1 gathers the threads toward the middle. */
  spread?: number
  v: VariantConfig
}) {
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

  const strandUniforms = useMemo(() => makeCommonUniforms(v), [v])
  const particleUniforms = useMemo(
    () => ({ ...makeCommonUniforms(v), uPixelRatio: { value: Math.min(gl.getPixelRatio(), 2) } }),
    [gl, v],
  )

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05)
    const time = reducedMotion ? 6 : state.clock.elapsedTime
    // Pointer on the z=0 plane, eased so threads part smoothly instead of snapping.
    pointer.current.x = damp(
      pointer.current.x,
      (state.pointer.x * viewport.width) / 2 + state.camera.position.x * 0.5,
      6,
      dt,
    )
    pointer.current.y = damp(pointer.current.y, (state.pointer.y * viewport.height) / 2, 6, dt)
    // The contact canvas sits under the page copy and gets no pointer events, so no thread parting there.
    const strength = reducedMotion || view !== 'hero' ? 0 : 1
    // Through the live materials (CLAUDE.md rule 4), including the variant's fray amount.
    for (const m of [strandMat.current, particleMat.current]) {
      if (!m) continue
      writeCommon(m.uniforms, time, pointer.current, strength)
      m.uniforms.uFray.value = v.fray
      m.uniforms.uSpread.value = spread
    }
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

function Loom({ reducedMotion, variant, v }: { reducedMotion: boolean; variant: LoomVariant; v: VariantConfig }) {
  const frayed = variant === 'frayed'
  const cage = useRef<THREE.Group>(null)
  const dish = useRef<THREE.Group>(null)
  const struts = useMemo(() => buildStruts(), [])

  useFrame((_, delta) => {
    if (reducedMotion) return
    if (cage.current) cage.current.rotation.x += delta * 0.18
    if (dish.current) dish.current.rotation.x -= delta * (frayed ? 0.06 : 0.35)
  })

  const metal = <meshStandardMaterial color="#2b3042" metalness={0.9} roughness={0.32} emissive="#0c0f1a" />

  return (
    <group>
      <group ref={cage}>
        {RINGS.map((r, i) => (
          // The frayed loom's rings are knocked out of line; the others sit true.
          <mesh
            key={r.x}
            position={frayed ? [r.x + i * 0.12, Math.sin(i * 1.7) * 0.32, Math.cos(i * 2.3) * 0.28] : [r.x, 0, 0]}
            rotation={frayed ? [i % 2 ? 0.32 : -0.26, Math.PI / 2 + Math.sin(i) * 0.38, 0] : [0, Math.PI / 2, 0]}
          >
            <torusGeometry args={[r.r, r.tube, 12, 96]} />
            {metal}
          </mesh>
        ))}
        {/* The broken loom has lost its cage struts. */}
        {!frayed && (
          <lineSegments geometry={struts}>
            <lineBasicMaterial color={variant === 'spindle' ? '#b8d4ff' : '#b9c0dc'} transparent opacity={0.7} />
          </lineSegments>
        )}
        {/* The spindle carries two glowing orbit rings round its waist. */}
        {variant === 'spindle' &&
          [0, 1].map((k) => (
            <mesh key={k} position={[2.3, 0, 0]} rotation={[k ? 0.9 : -0.9, Math.PI / 2, 0.4]}>
              <torusGeometry args={[1.9 + k * 0.35, 0.012, 8, 128]} />
              <meshBasicMaterial color={[1.2, 1.9, 3]} toneMapped={false} />
            </mesh>
          ))}
        {/* Lamps around the mouth: bright enough to bloom. */}
        {Array.from({ length: 16 }, (_, i) => {
          const a = (i / 16) * Math.PI * 2
          return (
            <mesh key={i} position={[-0.02, Math.cos(a) * 1.38, Math.sin(a) * 1.38]} rotation={[a, 0, 0]}>
              <boxGeometry args={[0.06, 0.16, 0.05]} />
              <meshBasicMaterial color={frayed && i % 3 === 0 ? [0.4, 0.2, 0.15] : v.lamp} toneMapped={false} />
            </mesh>
          )
        })}
      </group>

      <group
        ref={dish}
        position={[DISH.x, frayed ? -0.6 : 0, frayed ? 0.4 : 0]}
        rotation={frayed ? [0.5, 0.3, 0.35] : [0, 0, 0]}
      >
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
          <meshBasicMaterial
            color={frayed ? [0.9, 0.4, 0.3] : variant === 'spindle' ? [1, 1.4, 2] : [1.6, 1.3, 0.9]}
            toneMapped={false}
          />
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

function Glow({
  position,
  scale,
  color,
  opacity = 1,
}: {
  position: [number, number, number]
  scale: number
  color: string
  opacity?: number
}) {
  const mat = useRef<THREE.ShaderMaterial>(null)
  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uColor: { value: new THREE.Color(color).multiplyScalar(opacity) } }),
    [color, opacity],
  )
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
function ContactRig({ reducedMotion, variant }: { reducedMotion: boolean; variant: LoomVariant }) {
  const look = useRef(new THREE.Vector3())
  const placed = useRef(false)
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
    // Inner-page hero card (640–800px canvas): a little closer and centred on the loom.
    const card = !narrow && size.width < 800
    const spindle = variant === 'spindle'
    // The spindle rises at about 35°, so the camera centres on the middle of its tilted axis.
    const tx = (spindle ? -0.6 : -1.6) + sway * 0.9 + mouse.current.x * 0.7
    const ty = (spindle ? 2.8 : 2.2) + mouse.current.y * 0.5
    const tz = narrow ? 12.5 : card ? 9.5 : 11
    // Wide frames aim left of the loom so it rides to the right, clear of the headline.
    if (spindle) look.current.set(2.2, 1.5, 0)
    else look.current.set(narrow || card ? 2.4 : 0.8, narrow || card ? 0 : -0.5, 0)
    // Start in place (no fly-in: the first frame's delta is 0, so set it directly), then ease with the sway and mouse.
    if (!placed.current) {
      camera.position.set(tx, ty, tz)
      placed.current = true
    } else {
      camera.position.x = damp(camera.position.x, tx, 2, dt)
      camera.position.y = damp(camera.position.y, ty, 2, dt)
      camera.position.z = damp(camera.position.z, tz, 2, dt)
    }
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
    // Landscape starts further left so the loom mouth sits clear of the intro panel's right edge (it used to
    // glow under the glass corner); the end of the scroll (p = 1) frames exactly as before.
    const tx = (portrait ? 0.4 + p * 2.8 : -3.6 + p * 5.2) + pointer.x * 0.8
    const ty = 0.6 - p * 0.3 + pointer.y * 0.5
    const tz = baseZ - p * (portrait ? 11 : 6.5)
    camera.position.x = damp(camera.position.x, tx, 2.2, dt)
    camera.position.y = damp(camera.position.y, ty, 2.2, dt)
    camera.position.z = damp(camera.position.z, tz, 2.2, dt)
    // Aim below the loom so the composition rides in the upper part of the frame, above the copy.
    look.current.set(
      damp(look.current.x, portrait ? 1.6 + p * 2.9 : -4.0 + p * 5.3, 2.2, dt),
      damp(look.current.y, portrait ? -1.5 : -1.8 + p * 1.8, 2.2, dt),
      0,
    )
    camera.lookAt(look.current)
    // Publish the mouth's screen position for the page's guide light.
    camera.updateMatrixWorld()
    mouth.current.set(-0.25, 0, 0).project(camera)
    loomStore.mouth.x = (mouth.current.x + 1) / 2
    loomStore.mouth.y = (1 - mouth.current.y) / 2
  })
  return null
}

type SceneProps = {
  reducedMotion: boolean
  active: boolean
  onReady?: () => void
  view?: LoomView
  variant?: LoomVariant
  /**
   * Software renderer (perf-lite): the same look (bloom included) at a lower internal resolution. On the home hero
   * also a minimal thread count, gathered toward the middle.
   */
  light?: boolean
}

export function LoomScene({
  reducedMotion,
  active,
  onReady,
  view = 'hero',
  variant = 'classic',
  light = false,
}: SceneProps) {
  const v = VARIANTS[variant]
  // Lite home hero: the same full-screen loom and camera, with a minimal set of threads gathered in the middle.
  const minimal = light && view === 'hero'
  const quality = useMemo<Quality>(() => {
    if (minimal) return { strands: 240, points: 100, particles: 1400 }
    const small = window.matchMedia('(max-width: 768px), (pointer: coarse)').matches
    return small ? { strands: 420, points: 110, particles: 2600 } : { strands: 800, points: 140, particles: 5600 }
  }, [minimal])

  const budget = useBudgetDpr()
  // No GPU: render at most 0.6x and let the browser scale it up; the soft, glowing threads hide the difference.
  const dpr = light ? Math.min(0.6, budget) : budget
  const visible = useDocumentVisible()
  const running = active && visible

  return (
    <Canvas
      dpr={dpr}
      camera={{ position: [-1.2, 0.6, 14], fov: 40, near: 0.1, far: 100 }}
      // No MSAA: post-processing renders to its own target, so canvas antialiasing only cost GPU time.
      gl={{ antialias: false, powerPreference: 'high-performance' }}
      frameloop={running ? 'always' : 'never'}
    >
      {/* Contact page: match the page ink so the masked edges melt into it. */}
      <color attach="background" args={[view === 'contact' ? '#07070c' : '#04050c']} />
      <ambientLight intensity={0.25} />
      <pointLight position={[-0.6, 0, 0]} color={v.light} intensity={60} distance={9} />
      <pointLight position={[6, 3, 4]} color="#6f7dff" intensity={25} distance={20} />
      <pointLight position={[3, -3, -3]} color="#c6ff3d" intensity={6} distance={12} />

      <Glow position={[-14, 0, -12]} scale={40} color="#1a2350" opacity={0.6} />
      {/* Everything that belongs to the loom turns with it (the spindle stands upright, the frayed loom tilts). */}
      <group rotation={v.rotation}>
        <Glow position={[-0.25, 0, 0]} scale={2.8} color={v.mouthGlow} opacity={0.9} />
        <Glow position={[-0.4, 0, 0]} scale={9} color={v.haloGlow} opacity={0.22} />
        <Threads quality={quality} reducedMotion={reducedMotion} view={view} v={v} spread={minimal ? 0.55 : 1} />
        <Loom reducedMotion={reducedMotion} variant={variant} v={v} />
      </group>
      {/* Ready = shaders compiled and the first frames drawn, not just the context created. */}
      {onReady && <Warmup onDone={onReady} />}
      {view === 'contact' ? <ContactRig reducedMotion={reducedMotion} variant={variant} /> : <CameraRig />}

      {
        <EffectComposer multisampling={0}>
          <Bloom
            mipmapBlur
            levels={6}
            resolutionScale={0.5}
            intensity={0.85}
            luminanceThreshold={0.28}
            luminanceSmoothing={0.4}
            radius={0.7}
          />
          <Vignette eskil={false} offset={0.2} darkness={0.75} />
        </EffectComposer>
      }
    </Canvas>
  )
}
