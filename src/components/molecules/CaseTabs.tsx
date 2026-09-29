'use client';

import { useEffect, useRef } from 'react';
import { useAnimate } from 'motion/react-mini';
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

const HUE_VAR: Record<Hue, string> = {
  blueprint: 'var(--color-blueprint)',
  pine: 'var(--color-pine)',
  ochre: 'var(--color-ochre)',
  plum: 'var(--color-plum)',
  rose: 'var(--color-rose)',
  signal: 'var(--color-signal)',
};

/**
 * Molecule. Jump between case studies.
 *
 * An underline strip on a hairline. One indicator glides between tabs in the
 * active case's hue — Motion's WAAPI build (`motion/react-mini`) animating
 * transform only: translate for position, scaleX on a 1px bar for width, so no
 * layout property is ever animated (design.md §6). Works across the strip's
 * wrap onto two rows, because it reads each tab's own offset.
 *
 * A tablist with roving focus: arrow keys move between tabs. Buttons, not
 * links — these switch a panel rather than navigate. The deep-linkable version
 * of each case lives at /work#slug.
 */
export function CaseTabs({ items, activeSlug, onSelect }: CaseTabsProps) {
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const bar = useRef<HTMLSpanElement>(null);
  const first = useRef(true);

  useEffect(() => {
    const list = scope.current;
    const indicator = bar.current;
    if (!list || !indicator) return;

    function place(instant: boolean) {
      const tab = list!.querySelector<HTMLElement>(`[data-slug="${activeSlug}"]`);
      if (!tab) return;
      const x = tab.offsetLeft;
      const y = tab.offsetTop + tab.offsetHeight - 2;
      const w = Math.max(1, tab.offsetWidth);
      const target = `translate(${x}px, ${y}px) scaleX(${w})`;
      const hue = items.find((i) => i.slug === activeSlug)?.hue;
      indicator!.style.backgroundColor = hue ? HUE_VAR[hue] : 'var(--color-ink)';
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (instant || reduce) {
        indicator!.style.transform = target;
        return;
      }
      void animate(indicator!, { transform: target }, { duration: 0.45, ease: [0.22, 0.61, 0.36, 1] });
    }

    place(first.current);
    first.current = false;
    const onResize = () => place(true);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [activeSlug, animate, items, scope]);

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
      ref={scope}
      role="tablist"
      aria-label="Case studies"
      onKeyDown={onKeyDown}
      className="relative flex flex-wrap gap-x-6 border-b border-line"
    >
      {items.map((item) => {
        const active = item.slug === activeSlug;
        return (
          <button
            key={item.slug}
            role="tab"
            type="button"
            data-slug={item.slug}
            id={`tab-${item.slug}`}
            aria-selected={active}
            aria-controls={`panel-${item.slug}`}
            tabIndex={active ? 0 : -1}
            onClick={() => onSelect(item.slug)}
            className={cn(
              'flex min-h-11 items-center gap-2.5 py-3 text-left text-body',
              'transition-colors duration-300 ease-[var(--ease-brand)]',
              active ? 'text-ink' : 'text-ink-2 hover:text-ink',
            )}
          >
            {item.hue ? <Swatch hue={item.hue} active={active} className="size-2" /> : null}
            {item.label}
          </button>
        );
      })}
      {/* The gliding indicator: a 1px bar, scaled to the tab's width. */}
      <span
        ref={bar}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 h-0.5 w-px origin-left bg-ink transition-[background-color] duration-300"
      />
    </div>
  );
}
