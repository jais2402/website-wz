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
 *
 * Circular, matching ThemeToggle — the prototype's two header controls share
 * one shape.
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
        'inline-flex size-10 items-center justify-center rounded-full border border-line-2 text-ink',
        'transition-colors duration-300 ease-[var(--ease-brand)] hover:border-ink',
        className,
      )}
    >
      {/* Paused shows a play triangle; running shows two pause bars. CSS shapes,
          so there is no icon payload and they follow currentColor. */}
      {paused ? (
        <span
          aria-hidden="true"
          className="ml-[3px] size-0 border-y-[6px] border-l-[10px] border-y-transparent border-l-current"
        />
      ) : (
        <span
          aria-hidden="true"
          className="h-[11px] w-2.5 bg-[linear-gradient(90deg,currentColor_0_3px,transparent_3px_7px,currentColor_7px_10px)]"
        />
      )}
      <span className="sr-only">{paused ? 'Resume motion' : 'Pause motion'}</span>
    </button>
  );
}
