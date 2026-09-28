import { cn } from '@/lib/cn';

export interface EyebrowProps {
  children: string;
  className?: string;
}

/** Atom. Mono, uppercase, wide tracking. Labels a block; never a heading. */
export function Eyebrow({ children, className }: EyebrowProps) {
  return (
    <p
      className={cn(
        'font-mono text-meta uppercase tracking-[0.14em] text-ink-3',
        className,
      )}
    >
      {children}
    </p>
  );
}
