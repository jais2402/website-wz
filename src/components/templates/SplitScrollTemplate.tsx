import type { ReactNode } from 'react';

export interface SplitScrollTemplateProps {
  header: ReactNode;
  scene?: ReactNode;
  children: ReactNode;
  footer: ReactNode;
}

/**
 * Template. The scroll journey shell: fixed canvas behind, content above,
 * sections alternating sides. Receives content-bearing organisms as children;
 * it never reads content itself.
 */
export function SplitScrollTemplate({
  header,
  scene,
  children,
  footer,
}: SplitScrollTemplateProps) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-[2px] focus:bg-ink focus:px-4 focus:py-2 focus:text-ground"
      >
        Skip to content
      </a>
      {header}
      {scene}
      <main id="main" className="relative z-[2]">
        {children}
      </main>
      {footer}
    </>
  );
}
