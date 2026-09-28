'use client';

import { cn } from '@/lib/cn';
import { Eyebrow, Swatch } from '@/components/atoms';
import type { Hue } from '@/types/content';

export interface DisciplineRowProps {
  n?: string | undefined;
  hue?: Hue | undefined;
  title: string;
  body: string;
  /** Desktop only. Below lg every row is open and this is ignored. */
  open: boolean;
  onOpen?: () => void;
}

/**
 * Molecule. One row of a sequence.
 *
 * Below lg the body is always rendered and the row is inert — no hover
 * dependency, no collapse. That is the mobile rule from context.md §3.4:
 * scroll-gated lists were the top abandonment cause on phones.
 *
 * Above lg the body reveals for the open row. It stays in the DOM either way,
 * so the content exists for search, for assistive tech, and with JS off.
 */
export function DisciplineRow({ n, hue, title, body, open, onOpen }: DisciplineRowProps) {
  return (
    <div
      className="border-t border-line py-4 lg:cursor-default"
      onMouseEnter={onOpen}
      onFocus={onOpen}
    >
      <div className="flex items-baseline gap-3">
        {hue ? <Swatch hue={hue} active={open} className="translate-y-[3px]" /> : null}
        {n ? <Eyebrow className="tabular-nums">{n}</Eyebrow> : null}
        <h3
          className={cn(
            'text-[17px] font-medium tracking-tight transition-colors duration-300 ease-[var(--ease-brand)]',
            'text-ink lg:text-ink-3',
            open && 'lg:text-ink',
          )}
        >
          {title}
        </h3>
      </div>
      <p
        className={cn(
          'max-w-[44ch] text-[14.5px] leading-relaxed text-ink-2',
          'mt-2',
          // Desktop: collapse to zero height when closed. Mobile: always open.
          'lg:grid lg:transition-[grid-template-rows,opacity] lg:duration-[550ms] lg:ease-[var(--ease-brand)]',
          open ? 'lg:opacity-100' : 'lg:opacity-0',
        )}
        style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
      >
        <span className="lg:overflow-hidden">{body}</span>
      </p>
    </div>
  );
}
