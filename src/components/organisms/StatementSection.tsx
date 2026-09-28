import { Button } from '@/components/atoms';
import { HeadlineSplit } from '@/components/molecules';
import { Section } from './Section';
import type { Headline, Link as ContentLink, Side } from '@/types/content';

export interface StatementSectionProps {
  id: string;
  side?: Side | undefined;
  scene?: string | undefined;
  headline: Headline;
  lead: string;
  link?: ContentLink | undefined;
}

/** Organism. A headline and one paragraph. One idea per screen. */
export function StatementSection({
  id,
  side,
  scene,
  headline,
  lead,
  link,
}: StatementSectionProps) {
  const titleId = `${id}-title`;
  return (
    <Section id={id} side={side} scene={scene} labelledBy={titleId}>
      <HeadlineSplit headline={headline} id={titleId} />
      <p className="mt-6 max-w-[52ch] text-lead text-ink-2">{lead}</p>
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
