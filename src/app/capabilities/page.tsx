import type { Metadata } from 'next';
import { content, footer, pages, contactFacts } from '@/lib/content';
import { Button } from '@/components/atoms';
import { AreaAccordion, HeadlineSplit } from '@/components/molecules';
import { SiteFooter, SiteHeader } from '@/components/organisms';
import { DocumentTemplate } from '@/components/templates';
import { toHue } from '@/lib/hue';
import { slug } from '@/lib/slug';

const page = pages.capabilities;

export const metadata: Metadata = {
  // site.json already carries the full title ("Work · Wezigns"), so bypass the
  // layout's "%s · Wezigns" template rather than doubling the suffix.
  title: { absolute: page.title },
  description: page.description,
  alternates: { canonical: '/capabilities' },
};

/**
 * The deep page for What we build and The range — the URL a gatekeeper is
 * sent when they ask what the company actually does.
 *
 * It reuses the `build` and `range` sections from content/site.json rather
 * than duplicating them, so the two pages can never drift apart.
 */
export default function CapabilitiesPage() {
  const { sections, nav, hero } = content;
  const primaryCta = hero.actions[0]!;

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const build = sections.find((s) => (s as any).id === 'build') as any;
  const range = sections.find((s) => (s as any).id === 'range') as any;
  const tech = sections.find((s) => (s as any).id === 'tech') as any;
  /* eslint-enable @typescript-eslint/no-explicit-any */

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
      <div className="mx-auto max-w-centre px-gutter pb-[clamp(72px,9vh,110px)]">
        <HeadlineSplit headline={page.headline} level="d1" as="h1" id="capabilities-title" />
        {page.lead ? <p className="mt-6 max-w-measure text-lead text-ink-2">{page.lead}</p> : null}

        {build ? (
          <section
            id="disciplines"
            aria-labelledby="disciplines-title"
            className="border-t border-line pt-section mt-section"
          >
            <h2 id="disciplines-title" className="text-d2 text-balance text-ink">
              {build.headline.lead} {build.headline.accent ?? ''}
            </h2>
            <div className="mt-7 grid gap-x-10 lg:grid-cols-2">
              {build.items.map((item: { title: string; body: string; detail?: string; hue?: string }) => (
                <AreaAccordion
                  key={item.title}
                  id={slug(item.title)}
                  title={item.title}
                  href={`/capabilities/${slug(item.title)}`}
                  // The home bento carries the short line; this page the full one.
                  body={item.detail ?? item.body}
                  hue={toHue(item.hue)}
                />
              ))}
            </div>
          </section>
        ) : null}

        {range ? (
          <section
            id="range"
            aria-labelledby="range-title"
            className="border-t border-line pt-section mt-section"
          >
            <h2 id="range-title" className="text-d2 text-balance text-ink">
              {range.headline.lead} {range.headline.accent ?? ''}
            </h2>
            {page.rangeIntro ? (
              <p className="mt-5 max-w-measure text-lead text-ink-2">{page.rangeIntro}</p>
            ) : null}
            <div className="mt-7 grid gap-x-10 lg:grid-cols-2">
              {range.items.map((item: { title: string; systems?: string[]; hue?: string }) => (
                <AreaAccordion
                  key={item.title}
                  id={slug(item.title)}
                  title={item.title}
                  href={`/systems/${slug(item.title)}`}
                  systems={item.systems}
                  hue={toHue(item.hue)}
                />
              ))}
            </div>
          </section>
        ) : null}

        {tech?.layers?.length ? (
          <section
            id="stack"
            aria-labelledby="stack-title"
            className="border-t border-line pt-section mt-section"
          >
            <h2 id="stack-title" className="text-d2 text-balance text-ink">
              What a system is made of
            </h2>
            {page.stackIntro ? (
              <p className="mt-5 max-w-measure text-lead text-ink-2">{page.stackIntro}</p>
            ) : null}
            <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2.5">
              {tech.layers.map((layer: string) => (
                <li key={layer} className="text-small text-ink-2">
                  {layer}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section
          aria-labelledby="capabilities-cta"
          className="border-t border-line pt-section mt-section"
        >
          <h2 id="capabilities-cta" className="text-d2 text-balance text-ink">
            {page.cta.title}
          </h2>
          <p className="mt-4 max-w-measure-tight text-lead text-ink-2">{page.cta.body}</p>
          <div className="mt-7">
            <Button href={page.cta.action.href}>{page.cta.action.label}</Button>
          </div>
        </section>
      </div>
    </DocumentTemplate>
  );
}
