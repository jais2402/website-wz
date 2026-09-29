'use client';

import { useEffect, useRef, useState } from 'react';
import { getMotion, subscribe } from '@/lib/prefs';
import { onHighlight } from './highlight';
import { SCENE_ALIAS } from './scene-data';
import type { StageHandle } from './stage';

/**
 * Mounts the scene, but only when it has earned its place.
 *
 * Four fallbacks (architecture.md §4). In each the page is complete without it:
 *  1. No WebGL — createStage returns null and nothing mounts.
 *  2. Reduced motion — the stage renders on scroll only, never continuously.
 *  3. Low power — DPR and shadow map are clamped inside the stage.
 *  4. Below lg — the model is not the point on a phone; the chunk never loads.
 *
 * The stage module is imported dynamically after first paint, so three.js is
 * never in the critical path.
 */
export function SceneCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const calloutsRef = useRef<HTMLDivElement>(null);
  const leadsRef = useRef<SVGSVGElement>(null);
  const stageRef = useRef<StageHandle | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const wide = window.matchMedia('(min-width: 1000px)');

    async function start() {
      if (cancelled || stageRef.current) return;
      if (!wide.matches) { document.documentElement.classList.add('no3d'); return; }
      const canvas = canvasRef.current, callouts = calloutsRef.current, leads = leadsRef.current;
      if (!canvas || !callouts || !leads) return;

      const { createStage } = await import('./stage');
      if (cancelled) return;

      const stage = createStage(canvas, callouts, leads);
      if (!stage) { document.documentElement.classList.add('no3d'); return; }
      stageRef.current = stage;
      stage.setPaused(getMotion() === 'paused');
      // Sections set their highlights on mount, before the lazy stage exists;
      // re-subscribing replays them into it.
      onHighlight((scene, index) => {
        const key = SCENE_ALIAS[scene];
        if (key) stage.setHighlight(key, index);
      })();
      document.documentElement.classList.remove('no3d');
      // Marks a live stage: static stand-ins ([data-stage-fallback]) step aside.
      document.documentElement.classList.add('has3d');
      setMounted(true);
    }

    // After first paint — the LCP element must not wait on this.
    const ric = 'requestIdleCallback' in window ? window.requestIdleCallback : undefined;
    const idle: number = ric
      ? ric(() => void start(), { timeout: 1500 })
      : (setTimeout(() => void start(), 500) as unknown as number);

    const unsubscribe = subscribe(() => {
      stageRef.current?.setPaused(getMotion() === 'paused');
    });

    const unsubscribeHighlight = onHighlight((scene, index) => {
      const key = SCENE_ALIAS[scene];
      if (key) stageRef.current?.setHighlight(key, index);
    });

    const onWide = () => { if (wide.matches) void start(); };
    wide.addEventListener('change', onWide);

    return () => {
      cancelled = true;
      if (ric && 'cancelIdleCallback' in window) window.cancelIdleCallback(idle);
      else clearTimeout(idle);
      wide.removeEventListener('change', onWide);
      unsubscribe();
      unsubscribeHighlight();
      stageRef.current?.destroy();
      stageRef.current = null;
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        id="stage"
        aria-hidden="true"
        className={mounted ? 'ready' : undefined}
      />
      <div ref={calloutsRef} id="callouts" aria-hidden="true">
        <svg ref={leadsRef} id="leads" aria-hidden="true" />
      </div>
    </>
  );
}
