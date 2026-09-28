import { cn } from '@/lib/cn';

export interface RuleProps {
  className?: string;
}

/** Atom. A hairline. Decorative, so it is hidden from assistive tech. */
export function Rule({ className }: RuleProps) {
  return <hr aria-hidden="true" className={cn('border-0 border-t border-line', className)} />;
}
