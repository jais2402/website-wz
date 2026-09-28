import type { Metric } from '@/types/content';

export interface ProofStripProps {
  items: Metric[];
}

/**
 * Molecule. Three measured outcomes under the hook.
 * Exists because the study put the first proof beat at screen 12; this moves
 * it to screen 5. See .claude/context.md §3.
 */
export function ProofStrip({ items }: ProofStripProps) {
  return (
    <dl className="mt-[clamp(34px,5vh,58px)] grid gap-0 border-t border-line-2 text-left sm:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="border-line px-0 py-4 sm:border-l sm:px-[22px] sm:py-0 sm:pt-5 sm:first:border-l-0 sm:first:pl-0"
        >
          <dt className="sr-only">{item.label}</dt>
          <dd>
            <p className="text-[clamp(24px,2.4vw,38px)] font-medium leading-none tracking-[-0.035em] tabular-nums">
              {item.value}
            </p>
            <p className="mt-2 text-[13px] leading-snug text-ink-3">{item.label}</p>
          </dd>
        </div>
      ))}
    </dl>
  );
}
