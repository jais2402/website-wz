export interface FaqItemProps {
  q: string;
  a: string;
}

/**
 * Molecule. One question.
 *
 * Native <details>/<summary>: keyboard-operable, screen-reader announced, and
 * the answer is in the DOM whether or not it is open — so it is extractable by
 * search and AI crawlers, and readable with JS off. No ARIA needed; the
 * platform already does this correctly.
 */
export function FaqItem({ q, a }: FaqItemProps) {
  return (
    <details className="group border-t border-line">
      <summary className="flex min-h-[52px] cursor-pointer list-none items-center justify-between gap-6 py-4 text-[16px] text-ink [&::-webkit-details-marker]:hidden">
        {q}
        <span
          aria-hidden="true"
          className="flex-none font-mono text-[15px] text-ink-3 transition-transform duration-300 ease-[var(--ease-brand)] group-open:rotate-45"
        >
          +
        </span>
      </summary>
      <p className="max-w-[58ch] pb-5 text-[15px] leading-relaxed text-ink-2">{a}</p>
    </details>
  );
}
