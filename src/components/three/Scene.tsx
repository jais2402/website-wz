'use client';

import { useSyncExternalStore } from 'react';
import { Canvas } from '@react-three/fiber';
import { getTheme, getThemeServerSnapshot, subscribe } from '@/lib/prefs';
import { Instances } from './Instances';

/**
 * The only <Canvas>. Everything about it is decorative:
 * aria-hidden, non-focusable, pointer-events: none.
 *
 * Every fact the scene shows also exists in the DOM as text — if a fact only
 * exists here, it does not exist (architecture.md §4).
 */
export default function Scene() {
  const dark = useSyncExternalStore(subscribe, getTheme, getThemeServerSnapshot) === 'dark';

  // Low-power devices get DPR 1. R3F's default ceiling is 2; ours is 1.75.
  const lowPower =
    (navigator.hardwareConcurrency ?? 8) <= 4 ||
    ((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8) <= 4;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[1] hidden lg:block"
    >
      <Canvas
        frameloop="demand"
        dpr={lowPower ? 1 : [1, 1.75]}
        gl={{ antialias: true, powerPreference: 'low-power', alpha: true }}
        camera={{ position: [0, 0, 9], fov: 34 }}
tabIndex={-1}
      >
        <ambientLight intensity={dark ? 0.8 : 1.15} />
        <directionalLight position={[3, 5, 6]} intensity={dark ? 1.5 : 2.1} />
        <directionalLight position={[-4, -2, -3]} intensity={dark ? 0.4 : 0.6} />
        <Instances dark={dark} />
      </Canvas>
    </div>
  );
}
