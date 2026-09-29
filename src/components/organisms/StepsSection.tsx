'use client';

import { useEffect, useRef, useState } from 'react';
import { HeadlineSplit, StepBlock } from '@/components/molecules';
import { Section } from './Section';
import type { Headline, Hue, Side } from '@/types/content';

export interface StepsSectionProps {
  id: string;
  side?: Side | undefined;
  scene?: string | undefined;
  headline: Headline;
  lead?: string | undefined;
  outputLabel?: string | undefined;
  items: Array<{
    n?: string | undefined;
    hue?: Hue | undefined;
    title: string;
    body: string;
    note?: string | undefined;
    output?: string | undefined;
  }>;
}

/**
 * Organism. Stages or principles, every one open at every width.
 *
 * Stacked, not a grid: the 3D stage measures each [data-step] to know how far
 * through the stages the reader is — that drives the modules dropping into the
 * frame and the cage closing. In a two-column grid the steps share a row, the
 * progress jumps, and the assembly never plays. The vh gap gives each step its
 * own scroll travel.
 *
 * The step in view carries a rule in its hue, found with an IntersectionObserver
 * against the same mid-viewport line the stage uses.
 */
export function StepsSection({
  id, side, scene, headline, lead, outputLabel, items,
}: StepsSectionProps) {
  const [now, setNow] = useState(-1);
  const list = useRef<HTMLDivElement>(null);
  const titleId = `${id}-title`;

  useEffect(() => {
    const steps = Array.from(list.current?.querySelectorAll<HTMLElement>('[data-step]') ?? []);
    if (!steps.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setNow(steps.indexOf(entry.target as HTMLElement));
        }
      },
      { rootMargin: '-50% 0px -50% 0px', threshold: 0 },
    );
    for (const s of steps) observer.observe(s);
    return () => observer.disconnect();
  }, [items.length]);

  return (
    <Section id={id} side={side} scene={scene} labelledBy={titleId}>
      <HeadlineSplit headline={headline} id={titleId} />
      {lead ? <p className="mt-6 max-w-measure text-lead text-ink-2">{lead}</p> : null}
      <div ref={list} className="mt-9 lg:[&>*]:mb-[6vh] lg:[&>*:last-child]:mb-0">
        {items.map((item, index) => (
          <StepBlock
            key={item.title}
            {...item}
            total={item.n ? items.length : undefined}
            outputLabel={outputLabel}
            now={now === index}
          />
        ))}
      </div>
    </Section>
  );
}
