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
        className="focus:rounded-hair focus:bg-ink focus:text-ground sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2"
      >
        Skip to content
      </a>
      {header}
      <main id="main" className="premium-document relative z-2 pt-[clamp(120px,16vh,168px)]">
        {children}
      </main>
      {footer}
    </>
  );
}
