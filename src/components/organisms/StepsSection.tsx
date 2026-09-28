import { HeadlineSplit, StepBlock } from '@/components/molecules';
import { Section } from './Section';
import type { Headline, Hue, Side } from '@/types/content';

export interface StepsSectionProps {
  id: string;
  side?: Side | undefined;
  scene?: string | undefined;
  headline: Headline;
  lead?: string | undefined;
  items: Array<{
    n?: string | undefined;
    hue?: Hue | undefined;
    title: string;
    body: string;
    note?: string | undefined;
    output?: string | undefined;
  }>;
}

/**
 * Organism. Stages or principles, every one open at every width.
 * Deliberately not a sequence — these are read together, not one at a time.
 */
export function StepsSection({ id, side, scene, headline, lead, items }: StepsSectionProps) {
  const titleId = `${id}-title`;
  return (
    <Section id={id} side={side} scene={scene} labelledBy={titleId}>
      <HeadlineSplit headline={headline} id={titleId} />
      {lead ? <p className="mt-6 max-w-[52ch] text-lead text-ink-2">{lead}</p> : null}
      <div className="mt-9 grid gap-7 lg:grid-cols-2">
        {items.map((item) => (
          <StepBlock key={item.title} {...item} />
        ))}
      </div>
    </Section>
  );
}
