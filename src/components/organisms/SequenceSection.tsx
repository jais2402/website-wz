'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/atoms';
import { DisciplineRow, HeadlineSplit } from '@/components/molecules';
import { Section } from './Section';
import { setHighlight } from '@/components/three/highlight';
import type { Headline, Hue, Link as ContentLink, Side } from '@/types/content';

export interface SequenceItem {
  n?: string | undefined;
  hue?: Hue | undefined;
  title: string;
  /** Disciplines and integration rows carry a paragraph. */
  body?: string | undefined;
  /** Range rows carry a list of systems and a count instead. */
  systems?: string[] | undefined;
  count?: number | undefined;
}

export interface SequenceSectionProps {
  id: string;
  side?: Side | undefined;
  scene?: string | undefined;
  headline: Headline;
  items: SequenceItem[];
  link?: ContentLink | undefined;
}

/**
 * Organism. A sticky sequence: the heading and list hold still while one item
 * opens as you reach it. Hover or focus opens any item directly.
 *
 * **Below lg this is inert** — the section is normal height, nothing sticks,
 * every item renders open, and nothing depends on hover. Scroll-gated lists
 * and hover-to-open panels were the top abandonment cause on mobile across
 * rounds 2 and 3 (~26 of 60 users). Both modes must be tested.
 *
 * Which item is open is driven by IntersectionObserver against one sentinel
 * per item, not by a scroll listener — architecture.md §5. The sentinels are
 * empty, aria-hidden, and exist only in the tall desktop track.
 */
const TRACK_VH: Record<string, number> = { build: 34, range: 42 };

export function SequenceSection({
  id,
  side,
  scene,
  headline,
  items,
  link,
}: SequenceSectionProps) {
  const [openIndex, setOpenIndex] = useState(0);
  /** Set by hover/focus; suppresses scroll-driven opening until the pointer leaves. */
  const [pinned, setPinned] = useState<number | null>(null);
  const sentinels = useRef<Array<HTMLDivElement | null>>([]);
  const lastPointer = useRef<{ x: number; y: number } | null>(null);

  /**
   * Pin a row to the pointer — but only for a real movement. Chromium can
   * dispatch a synthetic mousemove after a scroll to refresh hover state; it
   * carries the same coordinates as the last real one, and without this check
   * it would re-pin the row under a resting cursor on every scroll.
   * Keyboard focus (no point) always opens the row.
   */
  function pin(index: number, point?: { x: number; y: number }) {
    if (point) {
      const last = lastPointer.current;
      lastPointer.current = point;
      if (last && last.x === point.x && last.y === point.y) return;
    }
    setPinned(index);
  }
  const titleId = `${id}-title`;
  // Scroll distance each row holds the screen for — the prototype's per-section
  // `--sh`. Shorter lists move faster so the section does not outstay itself.
  const trackVh = TRACK_VH[id] ?? 44;

  useEffect(() => {
    // Desktop only: below lg the list is open and there is nothing to drive.
    if (!window.matchMedia('(min-width: 1000px)').matches) return;

    const nodes = sentinels.current.filter(Boolean) as HTMLDivElement[];
    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = Number((entry.target as HTMLElement).dataset.index);
          if (Number.isNaN(index)) continue;
          setOpenIndex(index);
          // Scroll takes control back from hover. The list is sticky, so it
          // does not move under a resting pointer — without this, whichever
          // row the cursor happened to rest on stayed pinned for the entire
          // section and scrolling could never advance it.
          setPinned(null);
        }
      },
      // A thin trigger band across the middle of the viewport.
      { rootMargin: '-50% 0px -50% 0px', threshold: 0 },
    );

    for (const node of nodes) observer.observe(node);
    return () => observer.disconnect();
  }, [items.length]);

  const active = pinned ?? openIndex;

  // The scene brings the pointed-at part to full hue and dims the rest.
  useEffect(() => {
    if (!scene) return;
    setHighlight(scene, active);
    return () => setHighlight(null, -1);
  }, [scene, active]);

  return (
    <Section
      id={id}
      side={side}
      scene={scene}
      labelledBy={titleId}
      className="lg:py-0"
    >
      {/* Desktop: a tall track so there is scroll distance for the sequence to
          advance through. Below lg it collapses to auto height. */}
      <div
        className="lg:relative"
        style={{ ['--items' as string]: items.length }}
      >
        <div className="hidden lg:block">
          {items.map((item, index) => (
            <div
              key={`sentinel-${item.title}`}
              ref={(node) => {
                sentinels.current[index] = node;
              }}
              data-index={index}
              aria-hidden="true"
              style={{ height: `${trackVh}vh` }}
            />
          ))}
        </div>

        <div className="lg:absolute lg:inset-0 lg:h-full">
          {/*
            Anchored, not centred — the prototype's `.seq-in { position: sticky;
            top: 116px }`. Centring an h-screen block pushed the bottom rows
            below the fold whenever an open row made the block taller than the
            viewport. 116px clears the 76px header with room to breathe.
          */}
          <div className="lg:sticky lg:top-[116px]">
            <HeadlineSplit headline={headline} id={titleId} />

            <div
              className="mt-9"
              onMouseLeave={() => setPinned(null)}
              onBlur={() => setPinned(null)}
            >
              {items.map((item, index) => (
                <DisciplineRow
                  key={item.title}
                  n={item.n}
                  hue={item.hue}
                  title={item.title}
                  body={item.body}
                  systems={item.systems}
                  count={item.count}
                  open={active === index}
                  onOpen={(point) => pin(index, point)}
                />
              ))}
            </div>

            {link ? (
              <div className="mt-9">
                <Button href={link.href} variant="secondary">
                  {link.label}
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </Section>
  );
}
