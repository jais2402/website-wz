import Link from 'next/link';
import type { Link as ContentLink } from '@/types/content';
export interface SiteFooterProps {
  cta: { title: string; email: string; body: string; markets?: string[] | undefined };
  phone?: { display: string; href: string } | undefined;
  office?:
    | {
        label?: string | undefined;
        lines?: string[] | undefined;
        city: string;
        region?: string | undefined;
        postalCode?: string | undefined;
        country: string;
        mapUrl?: string | undefined;
      }
    | undefined;
  columns: Array<{ title: string; links: ContentLink[] }>;
  wordmark: string;
  base: string[];
  primaryCta: ContentLink;
}
export function SiteFooter({ cta, columns, wordmark, base, primaryCta, office }: SiteFooterProps) {
  return (
    <footer className="premium-footer">
      <div className="footer-top">
        <div>
          <Link href="/" className="premium-logo">
            {wordmark}
          </Link>
          <p>
            Custom software.
            <br />
            Built around your business.
          </p>
          <Link href={primaryCta.href} className="quiet-link">
            {primaryCta.label}
          </Link>
        </div>
        <div className="footer-columns">
          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <span>{column.title}</span>
              {column.links.map((link) => (
                <Link key={link.href} href={link.href}>
                  {link.label}
                </Link>
              ))}
            </nav>
          ))}
        </div>
      </div>
      <div className="footer-markets" id="regions">
        <span>
          {office?.city ?? 'Chennai'}, {office?.country ?? 'India'}
        </span>
        <p>{cta.markets?.join(', ')}</p>
      </div>
      <div className="footer-base">
        {base.slice(0, 1).map((line) => (
          <p key={line}>{line}</p>
        ))}
        <a href="#main" aria-label="Back to top">
          ↑
        </a>
      </div>
    </footer>
  );
}
