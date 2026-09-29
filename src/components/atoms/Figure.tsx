import { cn } from '@/lib/cn';
import type { Hue } from '@/types/content';

export interface FigureProps {
  value: number | string;
  suffix?: string | undefined;
  /** The suffix's colour. The number stays ink so a row of them is readable. */
  hue?: Hue | undefined;
  className?: string;
}

// Literal strings: Tailwind only generates what it can see. These are the
// contrast-safe TEXT values, never the surface ones (design.md §5).
const SUFFIX: Record<Hue, string> = {
  blueprint: 'text-blueprint-t',
  pine: 'text-pine-t',
  ochre: 'text-ochre-t',
  plum: 'text-plum-t',
  rose: 'text-rose-t',
  signal: 'text-signal-t',
};

/**
 * Atom. A large number. Tabular figures so a column of them aligns.
 * Never place a count next to a founding year — design.md §7 forbids the
 * arithmetic trap.
 */
export function Figure({ value, suffix, hue, className }: FigureProps) {
  return (
    <p className={cn('text-fig font-medium tabular-nums text-ink', className)}>
      {value}
      {suffix ? <span className={hue ? SUFFIX[hue] : 'text-blueprint-t'}>{suffix}</span> : null}
    </p>
  );
}
