import type { Metadata } from 'next';
import { content, pages } from '@/lib/content';
import { Button, Eyebrow, JsonLd, Swatch } from '@/components/atoms';
import { HeadlineSplit, MetricPair } from '@/components/molecules';
import { DocumentPage } from '@/components/templates';
import { caseStudySchema } from '@/lib/structured-data';

const page = pages.work;

export const metadata: Metadata = {
  // site.json already carries the full title ("Work · Wezigns"), so bypass the
  // layout's "%s · Wezigns" template rather than doubling the suffix.
  title: { absolute: page.title },
  description: page.description,
  alternates: { canonical: '/work' },
};

/**
 * The link an influencer sends. One anchor per case (/work#safety-training).
 *
 * Anchor ids come straight from `slug` in content/site.json and are public
 * URLs — renaming one breaks every link already shared (seo-specialist).
 * Case order is array order in the JSON; the India case is first by decision.
 */
export default function WorkPage() {
  const { cases } = content;

  return (
    <>
    <JsonLd schema={caseStudySchema()} />
    <DocumentPage scene={{ scene: 'cases', glyph: 'platforms' }}>
        <HeadlineSplit headline={page.headline} level="d1" as="h1" id="work-title" />
        {page.lead ? <p className="mt-6 max-w-measure text-lead text-ink-2">{page.lead}</p> : null}

        {cases.map((c) => (
          <article
            key={c.slug}
            id={c.slug}
            aria-labelledby={`${c.slug}-title`}
            className="border-t border-line py-section"
          >
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              {c.hue ? <Swatch hue={c.hue} active /> : null}
              <Eyebrow>{[c.n, c.region, c.sector].filter(Boolean).join(' · ')}</Eyebrow>
            </div>

            <h2
              id={`${c.slug}-title`}
              className="mt-4 text-[clamp(26px,3vw,44px)] font-medium tracking-tight text-ink"
            >
              {c.title}
            </h2>

            {c.body.map((paragraph) => (
              <p key={paragraph} className="mt-4 max-w-measure text-lead text-ink-2">
                {paragraph}
              </p>
            ))}

            {c.metrics?.length ? (
              <div className="mt-9 grid gap-8 sm:grid-cols-2">
                {c.metrics.map((m) => (
                  <MetricPair key={m.label} value={m.value} caption={m.label} />
                ))}
              </div>
            ) : null}

            {c.tags?.length ? (
              <ul className="mt-7 flex flex-wrap gap-x-4 gap-y-2">
                {c.tags.map((tag) => (
                  <li
                    key={tag}
                    className="font-mono text-fine uppercase tracking-[0.1em] text-ink-3"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            ) : null}
          </article>
        ))}

        <section aria-labelledby="work-cta" className="border-t border-line pt-section">
          <h2 id="work-cta" className="text-d2 text-balance text-ink">
            {page.cta.title}
          </h2>
          <p className="mt-4 max-w-measure-tight text-lead text-ink-2">{page.cta.body}</p>
          <div className="mt-7">
            <Button href={page.cta.action.href}>{page.cta.action.label}</Button>
          </div>
        </section>
    </DocumentPage>
    </>
  );
}
