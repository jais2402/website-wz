import type { ReactNode } from 'react';

export interface VisuallyHiddenProps {
  children: ReactNode;
}

/** Atom. Available to assistive technology, invisible on screen. */
export function VisuallyHidden({ children }: VisuallyHiddenProps) {
  return <span className="sr-only">{children}</span>;
}
