import { Canvas, useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { budgetDpr } from '@/lib/render'
import { damp } from '@/lib/tilt'
import { coreStore } from './coreStore'

// The AI page's hero centrepiece (lazy chunk, loaded only when gfx.live and motion is allowed): a pearl-glass core
// whose colour bands flow inside it, wrapped by three tilted orbit rings with a bead riding each. Real 3D, so the rings
// pass behind and in front of the core. Small canvas (the core's box only), so it renders well inside the budget.

const vertex = /* glsl */ `
uniform float uTime;
varying vec3 vNormal;
varying vec3 vView;
varying vec3 vPos;

// Cheap 3D value noise (smooth, no texture).
float hash(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
float noise(vec3 p) {
  vec3 i = floor(p); vec3 f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
}

void main() {
  // The surface breathes a little: a slow, low swell along the normal.
  float swell = noise(position * 1.7 + vec3(0.0, uTime * 0.35, 0.0)) - 0.5;
  vec3 p = position + normal * swell * 0.07;
  vPos = position;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vView = -mv.xyz;
  vNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * mv;
}
`

const fragment = /* glsl */ `
uniform float uTime;
varying vec3 vNormal;
varying vec3 vView;
varying vec3 vPos;

float hash(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
float noise(vec3 p) {
  vec3 i = floor(p); vec3 f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
}
float fbm(vec3 p) { return noise(p) * 0.6 + noise(p * 2.1 + 3.7) * 0.3 + noise(p * 4.3 - 1.3) * 0.1; }

// Brand ramp: blue, violet, cyan, a touch of coral.
vec3 ramp(float t) {
  t = fract(t);
  vec3 a = vec3(0.30, 0.62, 1.00);
  vec3 b = vec3(0.55, 0.48, 1.00);
  vec3 c = vec3(0.18, 0.82, 1.00);
  vec3 d = vec3(1.00, 0.58, 0.48);
  if (t < 0.34) return mix(a, b, t / 0.34);
  if (t < 0.62) return mix(b, c, (t - 0.34) / 0.28);
  if (t < 0.82) return mix(c, d, (t - 0.62) / 0.20);
  return mix(d, a, (t - 0.82) / 0.18);
}

void main() {
  vec3 n = normalize(vNormal);
  vec3 v = normalize(vView);
  float facing = max(dot(n, v), 0.0);
  float fres = pow(1.0 - facing, 2.0);

  // Flowing bands inside the glass: the noise field drifts, the view angle shifts the hue (thin-film look).
  vec3 q = vPos * 1.35 + vec3(uTime * 0.11, -uTime * 0.07, uTime * 0.05);
  float flow = fbm(q + fbm(q * 0.8 + uTime * 0.05));
  vec3 band = ramp(flow * 1.1 + fres * 0.45 + uTime * 0.02);

  // Pearl body: a milky white centre, colour gathering toward the rim, deepening right at the edge.
  vec3 milk = vec3(0.97, 0.97, 1.0);
  vec3 col = mix(milk, band, smoothstep(0.05, 0.85, fres + flow * 0.35));
  col = mix(col, band * 0.72, pow(fres, 3.0) * 0.8);

  // Two lights: a soft key upper left, a cool rim lower right; plus a crisp highlight.
  vec3 key = normalize(vec3(-0.5, 0.7, 0.6));
  vec3 h = normalize(key + v);
  float spec = pow(max(dot(n, h), 0.0), 70.0);
  float sheen = pow(max(dot(n, h), 0.0), 8.0) * 0.18;
  float rim = pow(1.0 - facing, 6.0);
  col += vec3(1.0) * (spec * 0.9 + sheen) + vec3(0.75, 0.85, 1.0) * rim * 0.55;

  gl_FragColor = vec4(col, 1.0);
}
`

/** Orbit ring tilts (radians): the same three orbits as the page's SVG knot, now in depth. */
const rings = [
  { rot: [1.15, 0, 0.2] as const, color: '#1f6fe0', speed: 0.42, bead: '#1f6fe0' },
  { rot: [1.15, 0, 0.2 + (Math.PI * 2) / 3] as const, color: '#6a55f0', speed: -0.33, bead: '#6a55f0' },
  { rot: [1.15, 0, 0.2 - (Math.PI * 2) / 3] as const, color: '#0e9fc4', speed: 0.27, bead: '#0e9fc4' },
]

function Core() {
  const group = useRef<THREE.Group>(null)
  const orb = useRef<THREE.Mesh>(null)
  const beads = useRef<(THREE.Mesh | null)[]>([])
  const mat = useRef<THREE.ShaderMaterial>(null)
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), [])
  const tilt = useRef({ x: 0, y: 0 })

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    // Always through the live material (see CLAUDE.md): R3F may hand the material another uniforms object.
    if (mat.current) mat.current.uniforms.uTime.value = t
    // Pointer turns the whole core toward the visitor; scrolling away spins it a little further.
    const k = tilt.current
    k.x = damp(k.x, coreStore.py * 0.35 + coreStore.scroll * 0.6, 4, dt)
    k.y = damp(k.y, coreStore.px * 0.5, 4, dt)
    if (group.current) {
      group.current.rotation.x = k.x
      group.current.rotation.y = k.y + t * 0.08
    }
    if (orb.current) orb.current.rotation.y = -t * 0.12
    beads.current.forEach((b, i) => {
      if (!b) return
      const a = t * rings[i].speed * 2 + i * 2.1
      b.position.set(Math.cos(a) * 1.5, Math.sin(a) * 1.5, 0)
    })
  })

  return (
    <group ref={group}>
      <mesh ref={orb}>
        <icosahedronGeometry args={[1, 24]} />
        <shaderMaterial ref={mat} vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} />
      </mesh>
      {rings.map((r, i) => (
        <group key={r.color} rotation={r.rot as unknown as [number, number, number]}>
          <mesh>
            <torusGeometry args={[1.5, 0.011, 8, 160]} />
            <meshBasicMaterial color={r.color} transparent opacity={0.7} />
          </mesh>
          <mesh
            ref={(m) => {
              beads.current[i] = m
            }}
          >
            <sphereGeometry args={[0.055, 16, 12]} />
            <meshBasicMaterial color={r.bead} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/**
 * The live core. `onReady` fires after the first frames are drawn, so the CSS core underneath can fade out without a
 * blank gap. The parent unmounts this when the hero leaves the screen (one WebGL canvas at a time on the page).
 */
export function AiCore({ onReady }: { onReady?: () => void }) {
  const box = useRef<HTMLDivElement>(null)
  const [dpr, setDpr] = useState(1)

  // The canvas is only the core's box: the screen's ratio (max 2), capped by the shared pixel budget.
  useEffect(() => {
    const el = box.current
    if (!el) return
    const read = () => {
      const r = el.getBoundingClientRect()
      setDpr(budgetDpr(r.width, r.height, window.devicePixelRatio))
    }
    read()
    const ro = new ResizeObserver(read)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div ref={box} className="aip-core-canvas">
      <Canvas
        dpr={dpr}
        camera={{ position: [0, 0, 5.2], fov: 40 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'default' }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0)
          // Two frames in: shaders compiled and the core drawn.
          let n = 0
          const tick = () => (++n >= 2 ? onReady?.() : requestAnimationFrame(tick))
          requestAnimationFrame(tick)
        }}
      >
        <Core />
      </Canvas>
    </div>
  )
}
