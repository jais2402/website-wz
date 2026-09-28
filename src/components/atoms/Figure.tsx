import { cn } from '@/lib/cn';

export interface FigureProps {
  value: number | string;
  suffix?: string | undefined;
  className?: string;
}

/**
 * Atom. A large number. Tabular figures so a column of them aligns.
 * Never place a count next to a founding year — design.md §7 forbids the
 * arithmetic trap.
 */
export function Figure({ value, suffix, className }: FigureProps) {
  return (
    <p className={cn('text-fig font-medium tabular-nums text-ink', className)}>
      {value}
      {suffix ? <span className="text-blueprint-t">{suffix}</span> : null}
    </p>
  );
}
