'use client';

import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { N, sceneState } from './states';
import { readHue, sharedGeometry, sharedMaterial, type HueKey } from './materials';
import { useScrollState } from './useScrollState';

const HUES: HueKey[] = ['blueprint', 'pine', 'ochre', 'plum', 'rose', 'signal'];
/** Index of `signal` in HUES — the scarcity token, never mixed down. */
const SIGNAL_HUE = 5;

/** Frame-rate independent damping: identical motion at 30 and 120 fps. */
const RATE = 5.2;

/**
 * The scene. One InstancedMesh, N=64 rounded boxes, shared geometry and
 * material — draw calls stay in the low tens.
 *
 * Everything in useFrame mutates preallocated objects. No allocation, no
 * setState, per architecture.md §4.
 */
export function Instances({ dark }: { dark: boolean }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const invalidate = useThree((s) => s.invalidate);
  const elapsed = useRef(0);
  /** Seconds since the scroll state last changed. Drives the idle stop below. */
  const sinceChange = useRef(0);
  const lastSignature = useRef('');
  const scroll = useScrollState(invalidate);

  // Preallocated scratch — reused and MUTATED every frame, never replaced.
  // A ref, not useMemo: mutating a memo result is what the React compiler's
  // immutability rule exists to catch, and R3F requires the mutation.
  const scratchRef = useRef<{
    matrix: THREE.Matrix4;
    position: THREE.Vector3;
    quaternion: THREE.Quaternion;
    euler: THREE.Euler;
    scale: THREE.Vector3;
    colour: THREE.Color;
    target: THREE.Color;
    tint: THREE.Color;
    current: Array<{ x: number; y: number; z: number; s: number; rx: number; ry: number; r: number; g: number; b: number }>;
  } | null>(null);

  if (scratchRef.current === null) {
    scratchRef.current = {
      matrix: new THREE.Matrix4(),
      position: new THREE.Vector3(),
      quaternion: new THREE.Quaternion(),
      euler: new THREE.Euler(),
      scale: new THREE.Vector3(),
      colour: new THREE.Color(),
      target: new THREE.Color(),
      tint: new THREE.Color(),
      /** Current interpolated transform per instance. */
      current: Array.from({ length: N }, () => ({
        x: 0, y: 0, z: 0, s: 0, rx: 0, ry: 0,
        r: 0, g: 0, b: 0,
      })),
    };
  }

  // Module-level singletons: one geometry and one material for the page.
  const geometry = sharedGeometry();
  const material = sharedMaterial();

  // A theme change alters every target colour, so wake the loop.
  useEffect(() => invalidate(), [dark, invalidate]);

  useFrame((_state, delta) => {
    const instanced = mesh.current;
    const scratch = scratchRef.current;
    if (!instanced || !scratch) return;

    const s = scroll.current;

    // Idle detection. architecture.md §4 requires that an idle page renders
    // nothing; design.md §5.5 wants ambient drift. Both hold if the drift
    // settles: it runs while the reader is moving and for a short tail after,
    // then stops entirely and the demand loop goes quiet until the next scroll.
    const signature = `${s.key}|${s.nextKey}|${s.side}|${s.blend.toFixed(3)}|${s.paused}`;
    if (signature !== lastSignature.current) {
      lastSignature.current = signature;
      sinceChange.current = 0;
    } else {
      sinceChange.current += delta;
    }
    const IDLE_AFTER = 2.5;
    const drifting = !s.paused && sinceChange.current < IDLE_AFTER;

    const from = sceneState(s.key, s.side);
    const to = sceneState(s.nextKey, s.side);
    const t = s.blend;

    // Paused or reduced motion: snap to the target instead of easing.
    const k = s.paused ? 1 : 1 - Math.exp(-Math.min(delta, 0.1) * RATE);

    let moving = false;

    for (let i = 0; i < N; i += 1) {
      const a = from.instances[i]!;
      const b = to.instances[i]!;

      const tx = a.x + (b.x - a.x) * t;
      const ty = a.y + (b.y - a.y) * t;
      const tz = a.z + (b.z - a.z) * t;
      const ts = a.s + (b.s - a.s) * t;
      const trx = a.rx + (b.rx - a.rx) * t;
      const tryy = a.ry + (b.ry - a.ry) * t;

      const c = scratch.current[i]!;
      c.x += (tx - c.x) * k;
      c.y += (ty - c.y) * k;
      c.z += (tz - c.z) * k;
      c.s += (ts - c.s) * k;
      c.rx += (trx - c.rx) * k;
      c.ry += (tryy - c.ry) * k;

      if (
        Math.abs(tx - c.x) > 0.001 ||
        Math.abs(ty - c.y) > 0.001 ||
        Math.abs(ts - c.s) > 0.001
      ) {
        moving = true;
      }

      // Colour. design.md §5.1: **neutral by default, colour on attention.**
      // Parts render in the model material; a hue is mixed in only faintly, so
      // the scene reads as one object rather than a bag of sweets. The single
      // signal piece is the exception and takes its hue at full strength —
      // §5.2, one per screen, the thing being fixed.
      const hueIndex = t < 0.5 ? a.hue : b.hue;
      readHue(scratch.target, dark ? 'model' : 'model2', dark);
      if (hueIndex >= 0) {
        const isSignal = hueIndex === SIGNAL_HUE;
        readHue(scratch.tint, HUES[hueIndex % HUES.length]!, dark);
        scratch.target.lerp(scratch.tint, isSignal ? 1 : 0.22);
      }
      c.r += (scratch.target.r - c.r) * k;
      c.g += (scratch.target.g - c.g) * k;
      c.b += (scratch.target.b - c.b) * k;

      scratch.position.set(c.x, c.y, c.z);
      scratch.euler.set(c.rx, c.ry, 0);
      scratch.quaternion.setFromEuler(scratch.euler);
      scratch.scale.setScalar(Math.max(c.s, 0.0001));
      scratch.matrix.compose(scratch.position, scratch.quaternion, scratch.scale);
      instanced.setMatrixAt(i, scratch.matrix);
      instanced.setColorAt(i, scratch.colour.setRGB(c.r, c.g, c.b));
    }

    instanced.instanceMatrix.needsUpdate = true;
    if (instanced.instanceColor) instanced.instanceColor.needsUpdate = true;

    // Ambient drift. design.md §5.5: slow yaw, sub-degree — never attention-
    // seeking. A bounded oscillation, not an accumulating spin: an unbounded
    // rotation swings a wide layout across the centre line and competes with
    // reading.
    if (drifting) {
      elapsed.current += delta;
      // Ease the drift out as the idle window closes, so it stops rather than
      // snapping to rest.
      const fade = Math.max(0, 1 - sinceChange.current / IDLE_AFTER);
      instanced.rotation.y = Math.sin(elapsed.current * 0.22) * 0.05 * fade; // ≤2.9°
      instanced.rotation.x = Math.sin(elapsed.current * 0.16) * 0.02 * fade;
      moving = true;
    } else if (instanced.rotation.y !== 0 || instanced.rotation.x !== 0) {
      instanced.rotation.y = 0;
      instanced.rotation.x = 0;
      moving = true;
    }

    // The model slides to the stage opposite the reading column. Moving the
    // group rather than the camera keeps the perspective square, so the model
    // never leans across into the text.
    const targetX = from.cameraX + (to.cameraX - from.cameraX) * t;
    if (Math.abs(instanced.position.x - targetX) > 0.002) {
      instanced.position.x += (targetX - instanced.position.x) * k;
      moving = true;
    }

    // Demand-driven: ask for another frame only while something is actually
    // changing. Once the transforms have converged and the drift has faded, no
    // frame is requested and the renderer goes quiet until the next scroll,
    // pointer move or theme change calls invalidate().
    if (moving) invalidate();
  });

  return (
    <instancedMesh
      ref={mesh}
      args={[geometry, material, N]}
      frustumCulled={false}
    />
  );
}
