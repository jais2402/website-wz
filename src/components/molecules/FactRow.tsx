import { Eyebrow, Swatch } from '@/components/atoms';
import type { Hue } from '@/types/content';

export interface FactRowProps {
  k: string;
  v: string;
  /** Ties the row to a hue, as the range rows already do. Omit for none. */
  hue?: Hue | undefined;
}

/**
 * Molecule. A label/value pair on a hairline. Used in the evidence table.
 *
 * The swatch is the same decorative square the range and process lists carry
 * (Designer, 2026-09-29): the reading column was the plain part of the page,
 * not the model. Colour never carries meaning alone — every swatch sits beside
 * its own label, and the text colour is unchanged.
 */
export function FactRow({ k, v, hue }: FactRowProps) {
  return (
    <div className="flex items-baseline justify-between gap-6 border-t border-line py-3.5">
      <dt className="flex items-baseline gap-2.5">
        {hue ? <Swatch hue={hue} active className="translate-y-[1px]" /> : null}
        <Eyebrow>{k}</Eyebrow>
      </dt>
      <dd className="text-right text-body text-ink">{v}</dd>
    </div>
  );
}
