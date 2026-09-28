'use client';

import { cn } from '@/lib/cn';
import { Swatch } from '@/components/atoms';
import type { Hue } from '@/types/content';

export interface DisciplineRowProps {
  n?: string | undefined;
  hue?: Hue | undefined;
  title: string;
  /** A paragraph — the disciplines and integration rows. */
  body?: string | undefined;
  /** A list of named systems — the range rows carry these instead of a body. */
  systems?: string[] | undefined;
  /** How many systems the row covers, shown at the end of the title line. */
  count?: number | undefined;
  /** The unit after the count — "systems". From content, never hard-coded. */
  countUnit?: string | undefined;
  /** Desktop only. Below lg every row is open and this is ignored. */
  open: boolean;
  /**
   * For static lists, where every row is open: whether this row is the one
   * pointed at. Drives the swatch and title emphasis. Omit for sequences, where
   * `open` does that job.
   */
  highlighted?: boolean | undefined;
  /** `point` is present for pointer moves and absent for keyboard focus. */
  onOpen?: (point?: { x: number; y: number }) => void;
}

/**
 * Molecule. One row of a sequence.
 *
 * A row reveals either a paragraph or a list of systems, depending on what the
 * content gives it. The range rows carry `systems` and a `count`; the
 * disciplines carry `body`. A row that renders neither is a content mismatch,
 * and looked exactly like a broken layout when it happened.
 *
 * Below lg the revealed content is always rendered and the row is inert — no
 * hover dependency, no collapse. That is the mobile rule from context.md §3.4:
 * scroll-gated lists were the top abandonment cause on phones.
 *
 * Above lg it reveals for the open row. It stays in the DOM either way, so the
 * content exists for search, for assistive tech, and with JS off.
 */
export function DisciplineRow({
  hue, title, body, systems, count, countUnit, open, highlighted, onOpen,
}: DisciplineRowProps) {
  const emphasised = highlighted ?? open;
  return (
    <div
      data-step=""
      className="border-t border-line py-4 lg:cursor-default"
      // Pin on pointer MOVEMENT, not mouseenter. The list is sticky, so it does
      // not slide under a resting cursor while the reader scrolls — a
      // mouseenter pin would hold whichever row the pointer happened to rest
      // on for the whole section. Moving the pointer is a deliberate act;
      // resting it is not. Keyboard focus still opens the row directly.
      onMouseMove={(e) => onOpen?.({ x: e.clientX, y: e.clientY })}
      onFocus={() => onOpen?.()}
    >
      <div className="flex items-baseline gap-3">
        {/* No numeric prefix: the prototype's rows carry a swatch and a title
            only. `n` stays in the content for other uses. */}
        {hue ? <Swatch hue={hue} active={emphasised} className="translate-y-[3px]" /> : null}
        <h3
          className={cn(
            'text-[17px] font-medium tracking-tight transition-colors duration-300 ease-[var(--ease-brand)]',
            'text-ink lg:text-ink-3',
            (emphasised || highlighted === false) && 'lg:text-ink',
          )}
        >
          {title}
        </h3>
        {count ? (
          <span className="ml-auto font-mono text-[10px] tabular-nums text-ink-3">
            {countUnit ? `${count} ${countUnit}` : count}
          </span>
        ) : null}
      </div>

      <div
        className={cn(
          'mt-2',
          // Desktop: collapse to zero height when closed. Mobile: always open.
          'lg:grid lg:transition-[grid-template-rows,opacity] lg:duration-[550ms] lg:ease-[var(--ease-brand)]',
          open ? 'lg:opacity-100' : 'lg:opacity-0',
        )}
        style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
      >
        <div className="lg:overflow-hidden">
          {body ? (
            <p className="max-w-[44ch] text-[14.5px] leading-relaxed text-ink-2">{body}</p>
          ) : null}
          {systems?.length ? (
            <ul className="ml-6 grid gap-x-5 gap-y-1 sm:grid-cols-2">
              {systems.map((system) => (
                <li key={system} className="text-[13.5px] leading-relaxed text-ink-2">
                  {system}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  );
}
