import { Button } from '@/components/atoms';
import { ProofStrip } from '@/components/molecules';
import { Section } from './Section';
import type { Link as ContentLink, Metric } from '@/types/content';

export interface StatementProofSectionProps {
  id: string;
  scene?: string | undefined;
  statement: { text: string; emphasis?: string | undefined };
  /**
   * Optional. Removed from the hook screen on 2026-09-28 at the owner's
   * request — restore by putting `proof` back on the section in
   * content/site.json and nothing else. See journal.md and context.md §3.
   */
  proof?: Metric[] | undefined;
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
      {/* The hook carries the screen: larger and tighter on desktop, capped at
          19ch so it breaks into three readable lines. */}
      <h2
        id={titleId}
        className="mx-auto text-statement text-balance font-medium text-ink lg:max-w-[19ch] lg:text-[clamp(40px,4.4vw,76px)] lg:leading-[1.03]"
      >
        {statement.text}
        {statement.emphasis ? (
          <em className="not-italic text-blueprint-t">{statement.emphasis}</em>
        ) : null}
      </h2>
      {/* Proof, when present, is narrower than the headline so the figures read
          as a row rather than drifting to the screen edges. */}
      {proof?.length ? (
        <div className="mx-auto max-w-[900px]">
          <ProofStrip items={proof} />
        </div>
      ) : null}
      {link ? (
        <div className="mx-auto mt-9 flex max-w-[900px] justify-center">
          <Button href={link.href} variant="secondary">
            {link.label}
          </Button>
        </div>
      ) : null}
    </Section>
  );
}
