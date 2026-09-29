import { slug as toSlug } from '@/lib/slug';

export interface PageSectionBlockProps {
  heading: string;
  body?: string[] | undefined;
  items?: string[] | undefined;
  /** Name + one line each, for pages that list systems. */
  entries?: Array<{ name: string; body: string }> | undefined;
}

/**
 * Molecule. One ruled block of prose on a document page: a heading, then
 * paragraphs, a plain list, or a list of named things with a line each.
 *
 * The heading's id comes from its text, so every block on every sub-page is
 * linkable without anyone maintaining a table of anchors.
 */
export function PageSectionBlock({ heading, body, items, entries }: PageSectionBlockProps) {
  const id = toSlug(heading);
  return (
    <section aria-labelledby={id} className="mt-section border-t border-line pt-section">
      <h2 id={id} className="text-d2 text-balance text-ink">
        {heading}
      </h2>
      {body?.map((paragraph) => (
        <p key={paragraph} className="mt-4 max-w-measure text-body leading-relaxed text-ink-2">
          {paragraph}
        </p>
      ))}
      {items?.length ? (
        <ul className="mt-5 grid max-w-measure gap-y-2.5">
          {items.map((line) => (
            <li key={line} className="border-t border-line pt-2.5 text-body text-ink-2">
              {line}
            </li>
          ))}
        </ul>
      ) : null}
      {entries?.length ? (
        <dl className="mt-6 grid gap-x-10 gap-y-6 sm:grid-cols-2">
          {entries.map((entry) => (
            <div key={entry.name} id={toSlug(entry.name)} className="border-t border-line pt-3">
              <dt className="text-title font-medium text-ink">{entry.name}</dt>
              <dd className="mt-1.5 text-small leading-relaxed text-ink-2">{entry.body}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </section>
  );
}
