'use client';

import { useEffect, useRef } from 'react';
import { isSceneKey } from './states';
import type { SceneKey } from './types';

export interface ScrollState {
  /** The scene the reader is in. */
  key: SceneKey;
  /** The scene being blended toward across a boundary band. */
  nextKey: SceneKey;
  /** 0 at the start of the blend band, 1 at the end. */
  blend: number;
  side: 'l' | 'r' | 'c';
  paused: boolean;
}

/**
 * The single rAF loop. Nothing else in the app may own one.
 *
 * It writes into a ref rather than React state — `setState` at scroll rate
 * would re-render the tree continuously, which architecture.md §4 forbids. The
 * renderer reads this ref inside useFrame.
 *
 * `invalidate` is called on every change so a demand-driven frameloop wakes up;
 * when nothing moves, nothing renders.
 */
export function useScrollState(invalidate: () => void) {
  const state = useRef<ScrollState>({
    key: 'workarounds',
    nextKey: 'workarounds',
    blend: 0,
    side: 'l',
    paused: false,
  });

  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>('section[data-scene]'),
    ).filter((el) => isSceneKey(el.dataset.scene));

    if (!sections.length) return;

    let frame = 0;
    let running = true;

    const readPaused = () => document.documentElement.dataset.motion === 'paused';

    function measure() {
      const mid = window.innerHeight * 0.5;
      let activeIndex = 0;

      for (let i = 0; i < sections.length; i += 1) {
        const rect = sections[i]!.getBoundingClientRect();
        if (rect.top <= mid) activeIndex = i;
      }

      const active = sections[activeIndex]!;
      const next = sections[Math.min(activeIndex + 1, sections.length - 1)]!;
      const rect = active.getBoundingClientRect();

      // Blend across the last 25% of a section, so scenes cross-fade rather
      // than snapping at the boundary.
      const height = Math.max(rect.height, 1);
      const passed = Math.min(1, Math.max(0, (mid - rect.top) / height));
      const blend = passed <= 0.75 ? 0 : (passed - 0.75) / 0.25;

      const current = state.current;
      const key = active.dataset.scene as SceneKey;
      const nextKey = next.dataset.scene as SceneKey;
      const side = (active.dataset.side as 'l' | 'r' | 'c') ?? 'l';
      const paused = readPaused();

      const changed =
        current.key !== key ||
        current.nextKey !== nextKey ||
        current.side !== side ||
        current.paused !== paused ||
        Math.abs(current.blend - blend) > 0.002;

      if (changed) {
        current.key = key;
        current.nextKey = nextKey;
        current.blend = blend;
        current.side = side;
        current.paused = paused;
        invalidate();
      }
    }

    function tick() {
      if (!running) return;
      measure();
      frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);

    return () => {
      running = false;
      cancelAnimationFrame(frame);
    };
  }, [invalidate]);

  return state;
}
