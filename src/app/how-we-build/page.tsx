import type { Metadata } from 'next';
import { content } from '@/lib/content';
import { howPage as page } from '@/lib/pages';
import { Button, Eyebrow } from '@/components/atoms';
import { HeadlineSplit, PageSectionBlock } from '@/components/molecules';
import { DocumentPage } from '@/components/templates';
import { slug as toSlug } from '@/lib/slug';

export const metadata: Metadata = {
  title: { absolute: page.title },
  description: page.description,
  alternates: { canonical: '/how-we-build' },
};

/**
 * The process, in full: Understand, Shape, Build, Run, and the three rules.
 *
 * The home page states the four stages; this page is where someone deciding
 * whether to start a conversation can read what each one actually involves and
 * what it produces. The stage names and their outputs are the same strings as
 * the home section, so the two cannot disagree.
 */
export default function HowWeBuildPage() {
  const primaryCta = content.hero.actions[0]!;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const principles = content.sections.find((s) => (s as any).id === 'principles') as any;

  return (
    <DocumentPage scene={{ scene: 'stages', glyph: 'automation' }}>
      <HeadlineSplit headline={page.headline} level="d1" as="h1" id="how-title" />
      <p className="mt-6 max-w-measure text-lead text-ink-2">{page.lead}</p>
      <p className="mt-4 max-w-measure text-body leading-relaxed text-ink-2">{page.intro}</p>

      {page.stages.map((stage, index) => (
        <section
          key={stage.name}
          aria-labelledby={toSlug(stage.name)}
          className="mt-section border-t border-line pt-section"
        >
          <Eyebrow>{String(index + 1).padStart(2, '0')}</Eyebrow>
          <h2 id={toSlug(stage.name)} className="mt-2 text-d2 text-balance text-ink">
            {stage.name}
          </h2>
          <p className="mt-4 max-w-measure text-body leading-relaxed text-ink-2">{stage.body}</p>
          <p className="mt-5 max-w-measure border-t border-line pt-3 text-small text-ink-3">
            <span className="font-mono text-micro uppercase tracking-[0.12em]">Output</span>
            <span className="mt-1 block text-body text-ink-2">{stage.output}</span>
          </p>
        </section>
      ))}

      {principles?.items?.length ? (
        <PageSectionBlock
          heading="Three rules, at every stage"
          body={[page.principlesIntro]}
          entries={principles.items.map((rule: { title: string; body: string; note?: string }) => ({
            name: rule.title,
            body: [rule.body, rule.note].filter(Boolean).join(' '),
          }))}
        />
      ) : null}

      <PageSectionBlock heading="Whatever the size of the job" body={[page.closing]} />

      <section aria-labelledby="how-cta" className="mt-section border-t border-line pt-section">
        <h2 id="how-cta" className="text-d2 text-balance text-ink">
          Start at Understand
        </h2>
        <p className="mt-4 max-w-measure-tight text-lead text-ink-2">
          Tell us what is not working and we will start with the process, not the technology.
        </p>
        <div className="mt-7">
          <Button href={primaryCta.href}>{primaryCta.label}</Button>
        </div>
      </section>
    </DocumentPage>
  );
}
