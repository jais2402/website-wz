/**
 * Theme and motion preferences, stored on <html> and mirrored to localStorage.
 *
 * The boot script in app/layout.tsx sets both attributes before first paint, so
 * the DOM — not React state — is the source of truth. Components subscribe to
 * it with useSyncExternalStore, which is the pattern React 19 wants for an
 * external system and avoids setState-in-an-effect cascading renders.
 */

export type Theme = 'light' | 'dark';
export type Motion = 'running' | 'paused';

/** Must match the keys used by the boot script in app/layout.tsx. */
const THEME_KEY = 'wz-theme';
const MOTION_KEY = 'wz-motion';
const EVENT = 'wz:prefs';

const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

const darkQuery = () => window.matchMedia('(prefers-color-scheme: dark)');
const reduceQuery = () => window.matchMedia('(prefers-reduced-motion: reduce)');

export function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener(EVENT, listener);
  // The system preference is part of the snapshot whenever no explicit
  // override is set, so a change to it has to re-render the toggles too.
  const dark = darkQuery();
  const reduce = reduceQuery();
  dark.addEventListener('change', listener);
  reduce.addEventListener('change', listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener(EVENT, listener);
    dark.removeEventListener('change', listener);
    reduce.removeEventListener('change', listener);
  };
}

export function getTheme(): Theme {
  // An explicit override wins; otherwise report what the system is actually
  // showing, or the toggle offers "dark" while the page is already dark.
  const attr = document.documentElement.dataset.theme;
  if (attr === 'dark' || attr === 'light') return attr;
  return darkQuery().matches ? 'dark' : 'light';
}

export function getMotion(): Motion {
  const attr = document.documentElement.dataset.motion;
  if (attr === 'paused' || attr === 'running') return attr;
  return reduceQuery().matches ? 'paused' : 'running';
}

/** Server and first client render agree on this; the boot script corrects it before paint. */
export const getThemeServerSnapshot = (): Theme => 'light';
export const getMotionServerSnapshot = (): Motion => 'running';

function persist(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* private mode — the choice still applies to this page view */
  }
}

export function setTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  persist(THEME_KEY, theme);
  emit();
}

export function setMotion(motion: Motion) {
  document.documentElement.dataset.motion = motion;
  persist(MOTION_KEY, motion);
  emit();
}
