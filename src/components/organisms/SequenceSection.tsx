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
  body: string;
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
  const titleId = `${id}-title`;

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
          if (!Number.isNaN(index)) setOpenIndex(index);
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
        <div className="hidden lg:block lg:h-[calc((var(--items)+1)*44vh)]">
          {items.map((item, index) => (
            <div
              key={`sentinel-${item.title}`}
              ref={(node) => {
                sentinels.current[index] = node;
              }}
              data-index={index}
              aria-hidden="true"
              className="h-[44vh]"
            />
          ))}
        </div>

        <div className="lg:absolute lg:inset-0 lg:h-full">
          <div className="lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:justify-center lg:py-[clamp(96px,14vh,132px)]">
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
                  open={active === index}
                  onOpen={() => setPinned(index)}
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
