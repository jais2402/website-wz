import { Button } from '@/components/atoms';
import { ProofStrip } from '@/components/molecules';
import { Section } from './Section';
import type { Link as ContentLink, Metric } from '@/types/content';

export interface StatementProofSectionProps {
  id: string;
  scene?: string | undefined;
  statement: { text: string; emphasis?: string | undefined };
  proof: Metric[];
  link?: ContentLink | undefined;
}

/**
 * Organism. The hook, centred, with the three hardest numbers under it.
 *
 * The emphasised clause — "…the moment when the business outgrows the
 * workaround" — is the only sentence users reproduced verbatim a week later.
 * It is a measured brand asset: do not reword it without study-grade evidence
 * (context.md §4).
 */
export function StatementProofSection({
  id,
  scene,
  statement,
  proof,
  link,
}: StatementProofSectionProps) {
  const titleId = `${id}-title`;
  return (
    <Section id={id} side="c" scene={scene} labelledBy={titleId}>
      <h2 id={titleId} className="text-statement text-balance font-normal text-ink">
        {statement.text}
        {statement.emphasis ? (
          <em className="not-italic text-blueprint-t">{statement.emphasis}</em>
        ) : null}
      </h2>
      <ProofStrip items={proof} />
      {link ? (
        <div className="mt-9 flex justify-center">
          <Button href={link.href} variant="secondary">
            {link.label}
          </Button>
        </div>
      ) : null}
    </Section>
  );
}
