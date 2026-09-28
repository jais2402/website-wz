import {
  CasesSection,
  ContactSection,
  FaqSection,
  FiguresSection,
  ProseSection,
  SequenceSection,
  StatementProofSection,
  StatementSection,
  StepsSection,
} from '@/components/organisms';
import type { CaseStudy, SiteContent } from '@/types/content';
import { toHue } from '@/lib/hue';

type SectionData = SiteContent['sections'][number];

/**
 * Sections whose `sequence` pattern renders as a static list — every row open,
 * no scroll track. The approved prototype builds integration as a plain list
 * (`.rows`), not a sticky sequence; making it scroll-gated added 1200px of
 * track and bled into the section below.
 */
const STATIC_LISTS = new Set(['integration']);

export interface SectionRendererProps {
  sections: SectionData[];
  cases: CaseStudy[];
}

/**
 * Template-level. Maps each section's `pattern` to its organism.
 *
 * This is the editability contract: to add, reorder or remove a section you
 * edit content/site.json and nothing else. Order on the page is array order in
 * the JSON. A new `pattern` value is the only thing that needs a code change,
 * and an unknown one fails loudly in dev rather than rendering nothing.
 *
 * Content enters at the page and flows down as props — this component receives
 * it, it does not read the content module. See standards.md §1.
 */
export function SectionRenderer({ sections, cases }: SectionRendererProps) {
  return (
    <>
      {sections.map((section) => {
        /* eslint-disable @typescript-eslint/no-explicit-any */
        const s = section as any;
        const common = { id: s.id, side: s.side, scene: s.scene };

        switch (s.pattern) {
          case 'sequence':
            return (
              <SequenceSection
                key={s.id}
                {...common}
                headline={s.headline}
                items={s.items.map((i: { hue?: string }) => ({ ...i, hue: toHue(i.hue) }))}
                link={s.link}
                countUnit={s.countUnit}
                mode={STATIC_LISTS.has(s.id) ? 'static' : 'sequence'}
              />
            );

          case 'statement':
            return (
              <StatementSection
                key={s.id}
                {...common}
                headline={s.headline}
                lead={s.lead}
                link={s.link}
              />
            );

          case 'statement-proof':
            return (
              <StatementProofSection
                key={s.id}
                id={s.id}
                scene={s.scene}
                statement={s.statement}
                proof={s.proof}
                link={s.link}
              />
            );

          case 'steps':
            return (
              <StepsSection
                key={s.id}
                {...common}
                headline={s.headline}
                lead={s.lead}
                outputLabel={s.outputLabel}
                items={s.items.map((i: { hue?: string }) => ({ ...i, hue: toHue(i.hue) }))}
              />
            );

          case 'prose':
            return (
              <ProseSection
                key={s.id}
                {...common}
                eyebrow={s.eyebrow}
                headline={s.headline}
                lead={s.lead}
                points={s.points?.map((p: { hue?: string }) => ({ ...p, hue: toHue(p.hue) }))}
                pillars={s.pillars}
                layers={s.layers}
                trust={s.trust}
                note={s.note}
                link={s.link}
              />
            );

          case 'figures':
            return (
              <FiguresSection
                key={s.id}
                {...common}
                headline={s.headline}
                figures={s.figures}
                rows={s.rows}
                link={s.link}
              />
            );

          case 'cases':
            return (
              <CasesSection
                key={s.id}
                {...common}
                headline={s.headline}
                cases={cases}
                actions={s.actions}
              />
            );

          case 'faq':
            return <FaqSection key={s.id} {...common} headline={s.headline} items={s.items} />;

          case 'form':
            return (
              <ContactSection
                key={s.id}
                {...common}
                headline={s.headline}
                topics={s.topics}
                fields={s.fields}
                submit={s.submit}
                promise={s.promise}
                note={s.note}
              />
            );

          default:
            if (process.env.NODE_ENV !== 'production') {
              throw new Error(
                `Unknown section pattern "${s.pattern}" on section "${s.id}". ` +
                  `Add a case to SectionRenderer, or fix content/site.json.`,
              );
            }
            return null;
        }
        /* eslint-enable @typescript-eslint/no-explicit-any */
      })}
    </>
  );
}
