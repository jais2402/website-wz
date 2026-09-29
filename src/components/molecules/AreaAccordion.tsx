import Link from 'next/link';
import { Swatch } from '@/components/atoms';
import type { Hue } from '@/types/content';

export interface AreaAccordionProps {
  title: string;
  /** A paragraph. */
  body?: string | undefined;
  /** Or a list of named systems — the range areas carry these instead of a body. */
  systems?: string[] | undefined;
  hue?: Hue | undefined;
  /** When the area or offering has a page of its own, the heading links to it. */
  href?: string | undefined;
  /** Anchor id. Public: footer links deep-link into these. */
  id?: string | undefined;
}

/**
 * Molecule. A titled block — integration rows, pricing points, and the
 * disciplines and range areas on /capabilities.
 *
 * Named "accordion" in the design inventory, built as a static block: at this
 * length collapsing costs a click and buys nothing, and an always-open block
 * cannot strand content behind an interaction on a phone.
 *
 * Renders a body, a systems list, or both. A block that renders neither is a
 * content mismatch — /capabilities once showed thirty systems as five bare
 * titles because range rows carry `systems`, not `body`.
 */
export function AreaAccordion({ title, body, systems, hue, id, href }: AreaAccordionProps) {
  return (
    <div id={id} className="border-t border-line py-4">
      <div className="flex items-baseline gap-2.5">
        {hue ? <Swatch hue={hue} active className="translate-y-[3px]" /> : null}
        <h3 className="text-title font-medium tracking-tight text-ink">
          {href ? (
            <Link
              href={href}
              className="bg-[linear-gradient(var(--color-ink),var(--color-ink))] bg-[length:0_1px] bg-left-bottom bg-no-repeat transition-[background-size] duration-200 ease-brand hover:bg-[length:100%_1px]"
            >
              {title}
            </Link>
          ) : (
            title
          )}
        </h3>
      </div>
      {body ? (
        <p className="mt-2 max-w-[48ch] text-small leading-relaxed text-ink-2">{body}</p>
      ) : null}
      {systems?.length ? (
        <ul className="mt-2.5 ml-5 grid gap-x-5 gap-y-1 sm:grid-cols-2">
          {systems.map((s) => (
            <li key={s} className="text-caption leading-relaxed text-ink-2">{s}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
