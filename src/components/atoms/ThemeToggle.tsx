'use client';

import { useSyncExternalStore } from 'react';
import { cn } from '@/lib/cn';
import { getTheme, getThemeServerSnapshot, setTheme, subscribe } from '@/lib/prefs';

/**
 * Atom (client leaf). Overrides the prefers-color-scheme default via
 * data-theme on <html>, and persists the choice.
 *
 * The boot script in layout.tsx applies the stored value before paint, so this
 * component only reflects the DOM — it never sets the initial theme itself,
 * which would flash.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, getTheme, getThemeServerSnapshot);
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-pressed={isDark}
      className={cn(
        'inline-flex size-10 items-center justify-center rounded-[2px] border border-line-2 text-ink-2',
        'transition-colors duration-300 ease-[var(--ease-brand)] hover:border-ink hover:text-ink',
        className,
      )}
    >
      <span aria-hidden="true" className="font-mono text-[11px] leading-none">
        {isDark ? 'LT' : 'DK'}
      </span>
      <span className="sr-only">{isDark ? 'Switch to light theme' : 'Switch to dark theme'}</span>
    </button>
  );
}
