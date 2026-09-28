'use client';

import { useSyncExternalStore } from 'react';
import { cn } from '@/lib/cn';
import { getMotion, getMotionServerSnapshot, setMotion, subscribe } from '@/lib/prefs';

/**
 * Atom (client leaf). Pauses ambient motion, including the 3D scene.
 *
 * design.md §5.6 makes this a first-class affordance, not a hidden setting:
 * prefers-reduced-motion is honoured automatically by the boot script, and
 * this is the explicit alternative for someone who has not set it at the OS
 * level. The choice persists.
 */
export function MotionToggle({ className }: { className?: string }) {
  const motion = useSyncExternalStore(subscribe, getMotion, getMotionServerSnapshot);
  const paused = motion === 'paused';

  return (
    <button
      type="button"
      onClick={() => setMotion(paused ? 'running' : 'paused')}
      aria-pressed={paused}
      className={cn(
        'inline-flex size-10 items-center justify-center rounded-[2px] border border-line-2 text-ink-2',
        'transition-colors duration-300 ease-[var(--ease-brand)] hover:border-ink hover:text-ink',
        className,
      )}
    >
      <span aria-hidden="true" className="font-mono text-[11px] leading-none">
        {paused ? '▶' : '❙❙'}
      </span>
      <span className="sr-only">{paused ? 'Resume motion' : 'Pause motion'}</span>
    </button>
  );
}
