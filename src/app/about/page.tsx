import type { Metadata } from 'next';
import { content, footer, contactFacts } from '@/lib/content';
import { aboutPage } from '@/lib/pages';
import { Button, Eyebrow } from '@/components/atoms';
import { HeadlineSplit } from '@/components/molecules';
import { SiteFooter, SiteHeader } from '@/components/organisms';
import { DocumentTemplate } from '@/components/templates';
import { slug as toSlug } from '@/lib/slug';

const page = aboutPage;

export const metadata: Metadata = {
  // The content file carries the full title, so bypass the layout's
  // "%s · Wezigns" template rather than doubling the suffix.
  title: { absolute: page.title },
  description: page.description,
  alternates: { canonical: '/about' },
};

/**
 * The company page.
 *
 * Deliberately has no team section, no founder story and no headcount: those
 * are blocked business facts (context.md §6) and rule 1 says an absence costs
 * less than a fake. Every figure here already appears on the home page — this
 * page gathers them, it does not add any.
 */
export default function AboutPage() {
  const { nav, hero } = content;
  const primaryCta = hero.actions[0]!;
  const { markets, since } = content.meta;

  return (
    <DocumentTemplate
      header={
        <SiteHeader
          nav={nav.primary}
          cta={nav.cta}
          wordmark={footer.wordmark}
          name={content.meta.name}
          since={since}
        />
      }
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
      <div className="mx-auto max-w-centre px-gutter pb-[clamp(72px,9vh,110px)]">
        <HeadlineSplit headline={page.headline} level="d1" as="h1" id="about-title" />
        <p className="mt-6 max-w-measure text-lead text-ink-2">{page.lead}</p>

        {page.sections.map((section) => (
          <section
            key={section.heading}
            aria-labelledby={toSlug(section.heading)}
            className="mt-section border-t border-line pt-section"
          >
            <h2 id={toSlug(section.heading)} className="text-d2 text-balance text-ink">
              {section.heading}
            </h2>
            {section.body?.map((paragraph) => (
              <p key={paragraph} className="mt-4 max-w-measure text-body leading-relaxed text-ink-2">
                {paragraph}
              </p>
            ))}
            {section.items?.length ? (
              <ul className="mt-5 grid max-w-measure gap-y-2.5">
                {section.items.map((line) => (
                  <li key={line} className="border-t border-line pt-2.5 text-body text-ink-2">
                    {line}
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}

        <section
          aria-labelledby="about-markets"
          className="mt-section border-t border-line pt-section"
        >
          <h2 id="about-markets" className="text-d2 text-balance text-ink">
            Where we work
          </h2>
          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
            {markets.map((market) => (
              <li key={market}>
                <Eyebrow>{market}</Eyebrow>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="about-cta" className="mt-section border-t border-line pt-section">
          <h2 id="about-cta" className="text-d2 text-balance text-ink">
            {footer.cta.title}
          </h2>
          <p className="mt-4 max-w-measure-tight text-lead text-ink-2">{footer.cta.body}</p>
          <div className="mt-7">
            <Button href={primaryCta.href}>{primaryCta.label}</Button>
          </div>
        </section>
      </div>
    </DocumentTemplate>
  );
}
