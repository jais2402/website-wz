import { cn } from '@/lib/cn';
import type { Hue } from '@/types/content';

export interface SwatchProps {
  hue?: Hue;
  active?: boolean;
  className?: string;
}

const HUE_CLASS: Record<Hue, string> = {
  blueprint: 'bg-blueprint',
  pine: 'bg-pine',
  ochre: 'bg-ochre',
  plum: 'bg-plum',
  rose: 'bg-rose',
  signal: 'bg-signal',
};

/**
 * Atom. Carries the hue that ties a list item to its part of the 3D model.
 * Decorative: colour never carries meaning alone, so every swatch sits next
 * to its label. Dimmed until the item is the one being read.
 */
export function Swatch({ hue = 'blueprint', active = false, className }: SwatchProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'block size-2.5 flex-none rounded-[1px] transition-opacity duration-[450ms] ease-[var(--ease-brand)]',
        HUE_CLASS[hue],
        active ? 'opacity-100' : 'opacity-35',
        className,
      )}
    />
  );
}
