import { Swatch } from '@/components/atoms';
import type { Hue } from '@/types/content';

export interface AreaAccordionProps {
  title: string;
  body: string;
  hue?: Hue | undefined;
}

/**
 * Molecule. A titled block in the integration list.
 *
 * Named "accordion" in the design inventory, built as a static block: at this
 * length collapsing costs a click and buys nothing, and an always-open block
 * cannot strand content behind an interaction on a phone.
 */
export function AreaAccordion({ title, body, hue }: AreaAccordionProps) {
  return (
    <div className="border-t border-line py-4">
      <div className="flex items-baseline gap-2.5">
        {hue ? <Swatch hue={hue} active className="translate-y-[3px]" /> : null}
        <h3 className="text-[16.5px] font-medium tracking-tight text-ink">{title}</h3>
      </div>
      <p className="mt-2 max-w-[48ch] text-[14.5px] leading-relaxed text-ink-2">{body}</p>
    </div>
  );
}
