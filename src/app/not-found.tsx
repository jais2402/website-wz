import type { Metadata } from 'next';
import { content, footer, contactFacts } from '@/lib/content';
import { Button } from '@/components/atoms';
import { SiteFooter, SiteHeader } from '@/components/organisms';
import { DocumentTemplate } from '@/components/templates';

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: true },
};

/**
 * 404. Never a dead end (context.md §5): the primary CTA and the two
 * deep-linkable pages are all one click away.
 */
export default function NotFound() {
  const { nav, hero } = content;
  const primaryCta = hero.actions[0]!;

  return (
    <DocumentTemplate
      header={<SiteHeader
          nav={nav.primary}
          cta={nav.cta}
          wordmark={footer.wordmark}
          name={content.meta.name}
          since={content.meta.since}
        />}
      footer={
        <SiteFooter
          {...contactFacts()}
          cta={footer.cta}
          columns={footer.columns}
          wordmark={footer.wordmark}
          base={footer.base}
          primaryCta={primaryCta}
        />
      }
    >
      <div className="mx-auto max-w-centre px-gutter pb-[clamp(96px,14vh,160px)]">
        <p className="font-mono text-meta uppercase tracking-[0.14em] text-ink-3">404</p>
        <h1 className="mt-4 text-d1 text-balance">
          That page has moved <span className="text-blueprint-t">or never existed.</span>
        </h1>
        <p className="mt-6 max-w-measure-tight text-lead text-ink-2">
          The link may be out of date. Everything we build and how we work is still here.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href={primaryCta.href}>{primaryCta.label}</Button>
          <Button href="/work" variant="secondary">
            See our work
          </Button>
          <Button href="/capabilities" variant="secondary">
            See all capabilities
          </Button>
        </div>
      </div>
    </DocumentTemplate>
  );
}
