import type { ReactNode } from 'react';

export interface DocumentTemplateProps {
  header: ReactNode;
  children: ReactNode;
  footer: ReactNode;
}

/**
 * Template. The shell for /work and /capabilities — the deep-linkable
 * document pages. No split canvas, no scene: these exist to be read and
 * shared, and every case has its own anchor.
 */
export function DocumentTemplate({ header, children, footer }: DocumentTemplateProps) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-hair focus:bg-ink focus:px-4 focus:py-2 focus:text-ground"
      >
        Skip to content
      </a>
      {header}
      <main id="main" className="relative z-2 pt-[clamp(120px,16vh,168px)]">
        {children}
      </main>
      {footer}
    </>
  );
}
