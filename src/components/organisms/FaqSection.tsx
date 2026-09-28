import { FaqItem, HeadlineSplit } from '@/components/molecules';
import { Section } from './Section';
import type { Headline, Side } from '@/types/content';

export interface FaqSectionProps {
  id: string;
  side?: Side | undefined;
  scene?: string | undefined;
  headline: Headline;
  items: Array<{ q: string; a: string }>;
}

/**
 * Organism. The questions.
 *
 * Every answer is in the DOM whether or not its <details> is open — so the
 * content is extractable by search and AI answer engines, and readable with
 * JS off. See .claude/agents/geo-specialist.md.
 */
export function FaqSection({ id, side, scene, headline, items }: FaqSectionProps) {
  const titleId = `${id}-title`;
  return (
    <Section id={id} side={side} scene={scene} labelledBy={titleId}>
      <HeadlineSplit headline={headline} id={titleId} />
      <div className="mt-8">
        {items.map((item) => (
          <FaqItem key={item.q} q={item.q} a={item.a} />
        ))}
      </div>
    </Section>
  );
}
