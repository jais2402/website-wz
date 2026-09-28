'use client';

import { cn } from '@/lib/cn';
import { Swatch } from '@/components/atoms';
import type { Hue } from '@/types/content';

export interface CaseTabsProps {
  items: Array<{ slug: string; n?: string | undefined; title: string; hue?: Hue | undefined }>;
  activeSlug: string;
  onSelect: (slug: string) => void;
}

/**
 * Molecule. Jump between case studies.
 *
 * A tablist with roving focus: arrow keys move between tabs, Enter/Space
 * selects. Buttons, not links — these switch a panel rather than navigate.
 * The deep-linkable version of each case lives at /work#slug.
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
    <div role="tablist" aria-label="Case studies" onKeyDown={onKeyDown} className="flex flex-wrap gap-2">
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
              'inline-flex min-h-10 items-center gap-2.5 rounded-[2px] border px-3.5 text-[13.5px]',
              'transition-colors duration-300 ease-[var(--ease-brand)]',
              active ? 'border-ink text-ink' : 'border-line text-ink-3 hover:border-line-2 hover:text-ink-2',
            )}
          >
            {item.hue ? <Swatch hue={item.hue} active={active} /> : null}
            {item.n ? <span className="font-mono text-[11px] tabular-nums">{item.n}</span> : null}
            {item.title}
          </button>
        );
      })}
    </div>
  );
}
