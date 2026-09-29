import type { Hue } from '@/types/content';

/**
 * Normalise a hue as written in content/site.json.
 *
 * Most sections name the hue in full ("blueprint"). The range rows use the
 * prototype's single-letter codes. Both reach components, so both are resolved
 * here rather than at each call site — a raw code silently renders no swatch,
 * which is how the range list lost its colour column.
 */
const CODE: Record<string, Hue> = {
  '': 'blueprint',
  o: 'ochre',
  p: 'pine',
  u: 'plum',
  s: 'signal',
};

const NAMES: readonly Hue[] = ['blueprint', 'pine', 'ochre', 'plum', 'rose', 'signal'];

export function toHue(value: string | undefined | null): Hue | undefined {
  if (value == null) return undefined;
  if ((NAMES as readonly string[]).includes(value)) return value as Hue;
  return CODE[value];
}

/**
 * The resting hue order, identical to `MIX` in three/states.ts.
 *
 * Signal is deliberately absent: it is the scarcity token, one per screen
 * (CLAUDE.md), and a rotation would spread it everywhere.
 */
export const HUE_ROTATION = ['blueprint', 'pine', 'ochre', 'plum', 'rose'] as const;

/** The hue for row `i` of a list, so lists and the model agree. */
export function rotateHue(i: number): Hue {
  return HUE_ROTATION[i % HUE_ROTATION.length]!;
}
