export interface FaqItemProps {
  q: string;
  a: string;
  /** Starts open. Used for the candour answer (context.md §4), the highest
   *  trust-per-word line on the site, so it is read without a click. */
  open?: boolean | undefined;
}

/**
 * Molecule. One question.
 *
 * Native <details>/<summary>: keyboard-operable, screen-reader announced, and
 * the answer is in the DOM whether or not it is open — so it is extractable by
 * search and AI crawlers, and readable with JS off. No ARIA needed; the
 * platform already does this correctly.
 */
export function FaqItem({ q, a, open }: FaqItemProps) {
  return (
    <details open={open} className="group border-t border-line">
      <summary className="flex min-h-[52px] cursor-pointer list-none items-center justify-between gap-6 py-4 text-title text-ink [&::-webkit-details-marker]:hidden">
        {q}
        <span
          aria-hidden="true"
          className="flex-none font-mono text-body text-ink-3 transition-transform duration-300 ease-brand group-open:rotate-45"
        >
          +
        </span>
      </summary>
      <p className="max-w-measure pb-5 text-body leading-relaxed text-ink-2">{a}</p>
    </details>
  );
}
