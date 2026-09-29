import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { content, pages } from '@/lib/content';
import { capabilityPages } from '@/lib/pages';
import { Button, Eyebrow, JsonLd } from '@/components/atoms';
import { HeadlineSplit, PageSectionBlock } from '@/components/molecules';
import { DocumentPage } from '@/components/templates';
import { serviceSchema } from '@/lib/structured-data';
import { slug as toSlug } from '@/lib/slug';
import { GLYPH_BY_SLUG } from '@/lib/glyphs';

/**
 * One page per kind of system: /capabilities/ecommerce-systems/ and so on.
 *
 * Why these exist as routes rather than anchors: an anchor cannot be the
 * answer to "who builds ecommerce order systems" — a search engine or an AI
 * answer engine needs a page with one subject to cite. Each page carries one
 * offering, its own title and description, and a Service entity in JSON-LD.
 *
 * The slug is generated from the offering's title by the same `slug()` the
 * home bento and the /capabilities accordion use, so the three can never
 * drift apart. Changing an offering's title changes a public URL.
 */


/** The offering this page is about, from the single `build` section. */
function offering(slug: string) {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const build = content.sections.find((s) => (s as any).id === 'build') as any;
  return build?.items?.find((item: { title: string }) => toSlug(item.title) === slug);
}

export function generateStaticParams() {
  return Object.keys(capabilityPages).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = capabilityPages[slug];
  if (!page) return {};
  return {
    // The content file carries the full title, so bypass the layout's
    // "%s · Wezigns" template rather than doubling the suffix.
    title: { absolute: page.title },
    description: page.description,
    alternates: { canonical: `/capabilities/${slug}` },
  };
}

export default async function CapabilityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = capabilityPages[slug];
  const item = offering(slug);
  if (!page) notFound();

  const primaryCta = content.hero.actions[0]!;
  // A case study in the same territory, when one exists. Never invented: this
  // is a link to work already published on /work.
  const related = content.cases.find((c) => page.relatedCase === c.slug);
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const build = content.sections.find((s) => (s as any).id === 'build') as any;
  // The model shows the whole field of offerings with this one lifted, so the
  // page says where it sits among the nine as well as what it is.
  const index = (build?.items ?? []).findIndex((i: { title: string }) => toSlug(i.title) === slug);

  return (
    <>
      <JsonLd schema={serviceSchema(slug, page.title, page.lead)} />
      <DocumentPage scene={{ scene: 'disciplines', highlight: index, glyph: GLYPH_BY_SLUG[slug] ?? 'software' }}>
        {/* Where this page sits. One level, so it stays a sentence rather than
            a chrome element. */}
        <nav aria-label="Breadcrumb">
          <Link
            href="/capabilities"
            className="inline-flex min-h-10 items-center text-caption text-ink-3 transition-colors duration-300 ease-brand hover:text-ink"
          >
            &#8592; All capabilities
          </Link>
        </nav>

        <HeadlineSplit headline={page.headline} level="d1" as="h1" id="capability-title" />
        <p className="mt-6 max-w-measure text-lead text-ink-2">{page.lead}</p>

        {page.sections.map((section) => (
          <PageSectionBlock key={section.heading} {...section} />
        ))}

        {related ? (
          <section aria-labelledby="capability-case" className="mt-section border-t border-line pt-section">
            <Eyebrow>A system like this</Eyebrow>
            <h2 id="capability-case" className="mt-2 text-d2 text-balance text-ink">
              {related.title}
            </h2>
            <p className="mt-4 max-w-measure text-body leading-relaxed text-ink-2">{related.body[0]}</p>
            <div className="mt-6">
              <Button href={`/work#${related.slug}`} variant="secondary">
                Read the case
              </Button>
            </div>
          </section>
        ) : null}

        <section aria-labelledby="capability-cta" className="mt-section border-t border-line pt-section">
          <h2 id="capability-cta" className="text-d2 text-balance text-ink">
            {item ? `Is ${item.title.toLowerCase()} what you need?` : 'Not sure this is what you need?'}
          </h2>
          <p className="mt-4 max-w-measure-tight text-lead text-ink-2">{pages.capabilities.cta.body}</p>
          <div className="mt-7">
            <Button href={primaryCta.href}>{primaryCta.label}</Button>
          </div>
        </section>
      </DocumentPage>
    </>
  );
}
