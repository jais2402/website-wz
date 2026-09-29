import type { Metadata } from 'next';
import { content, footer } from '@/lib/content';
import { aboutPage } from '@/lib/pages';
import { Button, Eyebrow } from '@/components/atoms';
import { HeadlineSplit, PageSectionBlock } from '@/components/molecules';
import { DocumentPage } from '@/components/templates';

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
  const primaryCta = content.hero.actions[0]!;
  const { markets } = content.meta;

  return (
    <DocumentPage scene={{ scene: 'since2012', glyph: 'data' }}>
      <HeadlineSplit headline={page.headline} level="d1" as="h1" id="about-title" />
      <p className="mt-6 max-w-measure text-lead text-ink-2">{page.lead}</p>

      {page.sections.map((section) => (
        <PageSectionBlock key={section.heading} {...section} />
      ))}

      <section aria-labelledby="about-markets" className="mt-section border-t border-line pt-section">
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
    </DocumentPage>
  );
}
