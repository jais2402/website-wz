import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { content } from '@/lib/content';
import { areaPages } from '@/lib/pages';
import { Button, JsonLd } from '@/components/atoms';
import { HeadlineSplit, PageSectionBlock } from '@/components/molecules';
import { DocumentPage } from '@/components/templates';
import { serviceSchema } from '@/lib/structured-data';
import { slug as toSlug } from '@/lib/slug';

/**
 * One page per area of the range: /systems/operations-supply-chain/ and so on.
 *
 * The range is thirty named systems in five areas. As one list on the home
 * page it answers "do they build my kind of system?" only for someone already
 * reading; as five pages it can also answer the question someone types into a
 * search box, or asks an assistant, before they have heard of the company.
 *
 * The system names are the ones already in content/site.json, verbatim and in
 * order — they are public anchors on this page and on /capabilities.
 */

export function generateStaticParams() {
  return Object.keys(areaPages).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = areaPages[slug];
  if (!page) return {};
  return {
    title: { absolute: page.title },
    description: page.description,
    alternates: { canonical: `/systems/${slug}` },
  };
}

export default async function AreaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = areaPages[slug];
  if (!page) notFound();

  const primaryCta = content.hero.actions[0]!;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const range = content.sections.find((s) => (s as any).id === 'range') as any;
  // The other four areas, so no page is a dead end.
  const others = (range?.items ?? []).filter(
    (item: { title: string }) => toSlug(item.title) !== slug,
  );
  const index = (range?.items ?? []).findIndex((i: { title: string }) => toSlug(i.title) === slug);

  return (
    <>
      <JsonLd schema={serviceSchema(slug, page.title, page.lead, 'systems')} />
      <DocumentPage scene={{ scene: 'range', highlight: index, glyph: 'platforms' }}>
        <nav aria-label="Breadcrumb">
          <Link
            href="/capabilities#range"
            className="inline-flex min-h-10 items-center text-caption text-ink-3 transition-colors duration-300 ease-brand hover:text-ink"
          >
            &#8592; The whole range
          </Link>
        </nav>

        <HeadlineSplit headline={page.headline} level="d1" as="h1" id="area-title" />
        <p className="mt-6 max-w-measure text-lead text-ink-2">{page.lead}</p>

        <PageSectionBlock heading="Why these end up as spreadsheets" body={[page.intro]} />
        <PageSectionBlock heading="The systems in this area" entries={page.systems} />
        <PageSectionBlock heading="They have to talk to each other" body={[page.closing]} />

        {others.length ? (
          <section aria-labelledby="area-others" className="mt-section border-t border-line pt-section">
            <h2 id="area-others" className="text-d2 text-balance text-ink">
              The other areas
            </h2>
            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
              {others.map((item: { title: string }) => (
                <li key={item.title}>
                  <Link
                    href={`/systems/${toSlug(item.title)}`}
                    className="inline-flex min-h-10 items-center text-body text-ink-2 underline decoration-line-2 underline-offset-4 transition-colors duration-300 ease-brand hover:text-ink"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section aria-labelledby="area-cta" className="mt-section border-t border-line pt-section">
          <h2 id="area-cta" className="text-d2 text-balance text-ink">
            Which of these is slowing you down?
          </h2>
          <p className="mt-4 max-w-measure-tight text-lead text-ink-2">
            Tell us what is not working and we will say which kind of system fits — or tell you
            honestly if custom software is the wrong answer.
          </p>
          <div className="mt-7">
            <Button href={primaryCta.href}>{primaryCta.label}</Button>
          </div>
        </section>
      </DocumentPage>
    </>
  );
}
