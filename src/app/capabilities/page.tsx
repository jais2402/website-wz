import type { Metadata } from 'next';
import { content, footer, pages } from '@/lib/content';
import { Button } from '@/components/atoms';
import { AreaAccordion, HeadlineSplit } from '@/components/molecules';
import { SiteFooter, SiteHeader } from '@/components/organisms';
import { DocumentTemplate } from '@/components/templates';

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
      header={<SiteHeader nav={nav.primary} cta={primaryCta} wordmark={content.meta.name} />}
      footer={
        <SiteFooter
          cta={footer.cta}
          columns={footer.columns}
          wordmark={footer.wordmark}
          base={footer.base}
          primaryCta={primaryCta}
        />
      }
    >
      <div className="mx-auto max-w-[1100px] px-[max(24px,5.4vw)] pb-[clamp(72px,9vh,110px)]">
        <HeadlineSplit headline={page.headline} level="d1" as="h1" id="capabilities-title" />
        {page.lead ? <p className="mt-6 max-w-[58ch] text-lead text-ink-2">{page.lead}</p> : null}

        {build ? (
          <section
            id="disciplines"
            aria-labelledby="disciplines-title"
            className="border-t border-line pt-[clamp(48px,7vh,80px)] mt-[clamp(48px,7vh,80px)]"
          >
            <h2 id="disciplines-title" className="text-d2 text-balance text-ink">
              {build.headline.lead} {build.headline.accent ?? ''}
            </h2>
            <div className="mt-7 grid gap-x-10 lg:grid-cols-2">
              {build.items.map((item: { title: string; body: string; hue?: string }) => (
                <AreaAccordion
                  key={item.title}
                  title={item.title}
                  body={item.body}
                  hue={item.hue as never}
                />
              ))}
            </div>
          </section>
        ) : null}

        {range ? (
          <section
            id="range"
            aria-labelledby="range-title"
            className="border-t border-line pt-[clamp(48px,7vh,80px)] mt-[clamp(48px,7vh,80px)]"
          >
            <h2 id="range-title" className="text-d2 text-balance text-ink">
              {range.headline.lead} {range.headline.accent ?? ''}
            </h2>
            {page.rangeIntro ? (
              <p className="mt-5 max-w-[58ch] text-lead text-ink-2">{page.rangeIntro}</p>
            ) : null}
            <div className="mt-7 grid gap-x-10 lg:grid-cols-2">
              {range.items.map((item: { title: string; body: string; hue?: string }) => (
                <AreaAccordion
                  key={item.title}
                  title={item.title}
                  body={item.body}
                  hue={item.hue as never}
                />
              ))}
            </div>
          </section>
        ) : null}

        {tech?.layers?.length ? (
          <section
            id="stack"
            aria-labelledby="stack-title"
            className="border-t border-line pt-[clamp(48px,7vh,80px)] mt-[clamp(48px,7vh,80px)]"
          >
            <h2 id="stack-title" className="text-d2 text-balance text-ink">
              What a system is made of
            </h2>
            {page.stackIntro ? (
              <p className="mt-5 max-w-[58ch] text-lead text-ink-2">{page.stackIntro}</p>
            ) : null}
            <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2.5">
              {tech.layers.map((layer: string) => (
                <li key={layer} className="text-[14.5px] text-ink-2">
                  {layer}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section
          aria-labelledby="capabilities-cta"
          className="border-t border-line pt-[clamp(48px,7vh,80px)] mt-[clamp(48px,7vh,80px)]"
        >
          <h2 id="capabilities-cta" className="text-d2 text-balance text-ink">
            {page.cta.title}
          </h2>
          <p className="mt-4 max-w-[52ch] text-lead text-ink-2">{page.cta.body}</p>
          <div className="mt-7">
            <Button href={page.cta.action.href}>{page.cta.action.label}</Button>
          </div>
        </section>
      </div>
    </DocumentTemplate>
  );
}
