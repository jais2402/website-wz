import Link from 'next/link';
import { Button, Eyebrow } from '@/components/atoms';
import type { Link as ContentLink } from '@/types/content';

export interface SiteFooterProps {
  cta: { title: string; email: string; body: string; markets?: string[] | undefined };
  columns: Array<{ title: string; links: ContentLink[] }>;
  wordmark: string;
  base: string[];
  primaryCta: ContentLink;
}

/**
 * Organism. The last chance to act.
 *
 * Never a dead end: the primary CTA repeats here in the same words it uses
 * everywhere else, and the email is offered for people who will not fill a
 * form (context.md §5).
 */
export function SiteFooter({ cta, columns, wordmark, base, primaryCta }: SiteFooterProps) {
  return (
    <footer className="relative z-2 border-t border-line bg-panel px-gutter pb-10 pt-[clamp(72px,9vh,110px)]">
      <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <h2 className="text-d2 text-balance text-ink">{cta.title}</h2>
          <p className="mt-5 max-w-[46ch] text-lead text-ink-2">{cta.body}</p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Button href={primaryCta.href}>{primaryCta.label}</Button>
            <a
              href={`mailto:${cta.email}`}
              className="inline-flex min-h-10 items-center text-body text-ink-2 underline decoration-line-2 underline-offset-4 transition-colors duration-300 ease-brand hover:text-ink"
            >
              {cta.email}
            </a>
          </div>

          {cta.markets?.length ? (
            <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2">
              {cta.markets.map((market) => (
                <li key={market}>
                  <Eyebrow>{market}</Eyebrow>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <Eyebrow>{column.title}</Eyebrow>
              <ul className="mt-2">
                {column.links.map((link) => (
                  <li key={`${column.title}-${link.href}`}>
                    <Link
                      href={link.href}
                      className="inline-flex min-h-10 items-center text-small text-ink-2 transition-colors duration-300 ease-brand hover:text-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      <p
        aria-hidden="true"
        className="mt-[clamp(56px,8vh,96px)] select-none text-[clamp(56px,13vw,180px)] font-medium leading-[0.85] tracking-[-0.05em] text-wordmark"
      >
        {wordmark}
      </p>

      <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-line pt-5">
        {base.map((line) => (
          <p key={line} className="text-caption text-ink-3">
            {line}
          </p>
        ))}
      </div>
    </footer>
  );
}
