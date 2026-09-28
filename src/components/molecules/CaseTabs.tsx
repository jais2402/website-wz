'use client';

import { cn } from '@/lib/cn';
import { Swatch } from '@/components/atoms';
import type { Hue } from '@/types/content';

export interface CaseTabsProps {
  /**
   * `label` is the short form — "Singapore · Tourism" — not the case headline.
   * Four headlines will not sit on one row inside a half-width reading column,
   * and a wrapped tab strip stops reading as a strip.
   */
  items: Array<{ slug: string; label: string; hue?: Hue | undefined }>;
  activeSlug: string;
  onSelect: (slug: string) => void;
}

const HUE_BORDER: Record<Hue, string> = {
  blueprint: 'border-b-blueprint',
  pine: 'border-b-pine',
  ochre: 'border-b-ochre',
  plum: 'border-b-plum',
  rose: 'border-b-rose',
  signal: 'border-b-signal',
};

/**
 * Molecule. Jump between case studies.
 *
 * An underline strip sitting on a hairline, with the selected tab marked by a
 * 2px rule in its own case hue — not a boxed button, which fragments the row
 * and wraps badly at four items.
 *
 * A tablist with roving focus: arrow keys move between tabs. Buttons, not
 * links — these switch a panel rather than navigate. The deep-linkable version
 * of each case lives at /work#slug.
 */
export function CaseTabs({ items, activeSlug, onSelect }: CaseTabsProps) {
  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const index = items.findIndex((i) => i.slug === activeSlug);
    if (index < 0) return;
    const delta = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (!delta) return;
    event.preventDefault();
    const next = items[(index + delta + items.length) % items.length];
    if (next) onSelect(next.slug);
  }

  return (
    <div
      role="tablist"
      aria-label="Case studies"
      onKeyDown={onKeyDown}
      className="flex flex-wrap gap-x-6 border-b border-line"
    >
      {items.map((item) => {
        const active = item.slug === activeSlug;
        return (
          <button
            key={item.slug}
            role="tab"
            type="button"
            id={`tab-${item.slug}`}
            aria-selected={active}
            aria-controls={`panel-${item.slug}`}
            tabIndex={active ? 0 : -1}
            onClick={() => onSelect(item.slug)}
            className={cn(
              'group -mb-px flex min-h-11 items-center gap-2.5 border-b-2 border-transparent py-3',
              'text-left text-[15px] transition-colors duration-300 ease-[var(--ease-brand)]',
              active ? 'text-ink' : 'text-ink-2 hover:text-ink',
              active && item.hue ? HUE_BORDER[item.hue] : '',
            )}
          >
            {item.hue ? <Swatch hue={item.hue} active={active} className="size-2" /> : null}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
