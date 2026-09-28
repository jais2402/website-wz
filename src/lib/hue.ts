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
