import { cn } from '@/lib/cn';

export interface ChipProps {
  children: string;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

/**
 * Atom. Pill-shaped label. Interactive when onClick is given, static otherwise.
 * Padding, not a bare hit area, carries the 40px target (design.md §6).
 */
export function Chip({ children, selected = false, onClick, className }: ChipProps) {
  const classes = cn(
    'inline-flex min-h-10 items-center rounded-full border px-4 text-caption leading-none',
    'transition-colors duration-300 ease-[var(--ease-brand)]',
    selected ? 'border-blueprint bg-blueprint text-on-brand' : 'border-line-2 text-ink-2',
    onClick && !selected && 'hover:border-ink hover:text-ink',
    className,
  );

  if (!onClick) return <span className={classes}>{children}</span>;

  return (
    <button type="button" aria-pressed={selected} className={classes} onClick={onClick}>
      {children}
    </button>
  );
}
