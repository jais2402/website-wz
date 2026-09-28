'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

/**
 * Mounts the scene, but only when it has earned its place.
 *
 * Four fallbacks, per architecture.md §4 — in each case this renders nothing
 * and the page is complete without it:
 *
 * 1. **No WebGL** — capability-checked before the chunk is imported.
 * 2. **Reduced motion / paused** — the user's explicit or system choice.
 *    (The scene also honours `paused` internally by snapping instead of easing;
 *    this is the stronger case: never download it at all.)
 * 3. **Low-power** — handled inside Scene via DPR clamping.
 * 4. **Below lg** — the split layout does not exist on a phone, and the model
 *    is not the point there. Also saves the whole chunk on mobile data.
 *
 * The import is dynamic with ssr:false and only fires after first paint, so the
 * three/R3F chunk is never in the critical path.
 */
const Scene = dynamic(() => import('./Scene'), { ssr: false });

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl2') || canvas.getContext('webgl'))
    );
  } catch {
    return false;
  }
}

export function SceneCanvas() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const wide = window.matchMedia('(min-width: 1000px)');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

    function evaluate() {
      const paused = document.documentElement.dataset.motion === 'paused';
      const ok = wide.matches && !reduced.matches && !paused && hasWebGL();
      setReady(ok);
      // The no-3D class lets CSS reflow to a single column (architecture.md §4).
      document.documentElement.classList.toggle('no3d', !ok);
    }

    // After first paint, so the chunk never competes with the LCP element.
    // requestIdleCallback is unavailable on Safari < 17, hence the fallback.
    const ric: typeof window.requestIdleCallback | undefined =
      'requestIdleCallback' in window ? window.requestIdleCallback : undefined;
    const idle: number = ric
      ? ric(evaluate, { timeout: 1200 })
      : (setTimeout(evaluate, 400) as unknown as number);

    wide.addEventListener('change', evaluate);
    reduced.addEventListener('change', evaluate);
    window.addEventListener('wz:prefs', evaluate);

    return () => {
      if (ric && 'cancelIdleCallback' in window) window.cancelIdleCallback(idle);
      else clearTimeout(idle);
      wide.removeEventListener('change', evaluate);
      reduced.removeEventListener('change', evaluate);
      window.removeEventListener('wz:prefs', evaluate);
    };
  }, []);

  if (!ready) return null;
  return <Scene />;
}
