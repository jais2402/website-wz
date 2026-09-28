import { Button } from '@/components/atoms';
import { FactRow, HeadlineSplit, MetricPair } from '@/components/molecules';
import { Section } from './Section';
import type { Headline, Link as ContentLink, Side } from '@/types/content';

export interface FiguresSectionProps {
  id: string;
  side?: Side | undefined;
  scene?: string | undefined;
  headline: Headline;
  figures: Array<{ value: number | string; suffix?: string | undefined; caption: string }>;
  rows?: Array<{ k: string; v: string }> | undefined;
  link?: ContentLink | undefined;
}

/**
 * Organism. Big numbers plus the reference table under them.
 *
 * Ordering constraint from design.md §7: never place a count directly beside a
 * founding year — the two read as arithmetic and users subtract them. The
 * figures grid and the fact rows are kept apart for that reason.
 */
export function FiguresSection({
  id,
  side,
  scene,
  headline,
  figures,
  rows,
  link,
}: FiguresSectionProps) {
  const titleId = `${id}-title`;
  return (
    <Section id={id} side={side} scene={scene} labelledBy={titleId}>
      <HeadlineSplit headline={headline} id={titleId} />

      <div className="mt-10 grid gap-9 sm:grid-cols-2">
        {figures.map((f) => (
          <MetricPair key={f.caption} value={f.value} suffix={f.suffix} caption={f.caption} />
        ))}
      </div>

      {rows?.length ? (
        <dl className="mt-11">
          {rows.map((row) => (
            <FactRow key={row.k} k={row.k} v={row.v} />
          ))}
        </dl>
      ) : null}

      {link ? (
        <div className="mt-8">
          <Button href={link.href} variant="secondary">
            {link.label}
          </Button>
        </div>
      ) : null}
    </Section>
  );
}
