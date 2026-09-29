'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/atoms';
import { BentoTile, DisciplineRow, HeadlineSplit } from '@/components/molecules';
import { IsoGlyph, type GlyphName } from '@/components/atoms';
import { slug } from '@/lib/slug';
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
  /** Bento only: the company mark shown in the centre tile with the 3D. */
  brand?: { wordmark: string; since?: string | number | undefined } | undefined;
  /** The unit after a row's count — "systems". From content. */
  countUnit?: string | undefined;
  /**
   * `sequence` (default): a sticky list that opens one row at a time as the
   * reader scrolls. `static`: every row open, no scroll track — hover still
   * lights the matching part of the model. The prototype's integration list is
   * static; build and range are sequences.
   */
  mode?: 'sequence' | 'static' | undefined;
  /**
   * Static mode only. `grid` lays the rows out two across on desktop — used for
   * the disciplines, whose 3D model is itself a 4×2 grid of modules, so the
   * list reads as the model's legend.
   */
  layout?: 'list' | 'grid' | 'bento' | undefined;
}

/** Scroll distance each row holds the screen for — the prototype's `--sh`. */
const TRACK_VH: Record<string, number> = { build: 34, range: 42 };

/**
 * Organism. A list of rows that drives the 3D highlight.
 *
 * In sequence mode the heading and list hold still in a block anchored at
 * 116px while one row opens as the reader reaches it; hover or focus opens any
 * row directly, and the next scroll step takes control back.
 *
 * **Below lg both modes are inert** — nothing sticks, every row is open, and
 * nothing depends on hover. Scroll-gated lists and hover-to-open panels were
 * the top abandonment cause on mobile across rounds 2 and 3 (~26 of 60 users).
 *
 * Which row is open is driven by IntersectionObserver against one sentinel per
 * row, not a scroll listener (architecture.md §5).
 */
export function SequenceSection({
  id, side, scene, headline, items, link, countUnit, mode = 'sequence', layout = 'list', brand,
}: SequenceSectionProps) {
  const isStatic = mode === 'static';
  const [openIndex, setOpenIndex] = useState(0);
  const [pinned, setPinned] = useState<number | null>(null);
  const sentinels = useRef<Array<HTMLDivElement | null>>([]);
  const lastPointer = useRef<{ x: number; y: number } | null>(null);
  const titleId = `${id}-title`;
  const trackVh = TRACK_VH[id] ?? 44;

  /**
   * Pin a row to the pointer — but only for a real movement. Chromium can
   * dispatch a synthetic mousemove after a scroll to refresh hover state; it
   * carries the last real coordinates, and without this check it would re-pin
   * the row under a resting cursor on every scroll. Keyboard focus (no point)
   * always opens the row.
   */
  function pin(index: number, point?: { x: number; y: number }) {
    if (point) {
      const last = lastPointer.current;
      lastPointer.current = point;
      if (last && last.x === point.x && last.y === point.y) return;
    }
    setPinned(index);
  }

  useEffect(() => {
    if (isStatic) return;
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
          // Scroll takes control back from hover — the list is sticky, so it
          // does not move under a resting pointer.
          setPinned(null);
        }
      },
      { rootMargin: '-50% 0px -50% 0px', threshold: 0 },
    );
    for (const node of nodes) observer.observe(node);
    return () => observer.disconnect();
  }, [items.length, isStatic]);

  // Static lists light nothing until pointed at; sequences light the open row.
  const active = isStatic ? (pinned ?? -1) : (pinned ?? openIndex);

  useEffect(() => {
    if (!scene) return;
    setHighlight(scene, active);
    return () => setHighlight(scene, -1);
  }, [scene, active]);

  // Bento (build), full width: eight offerings around a 2×2 centre tile that
  // holds the live 3D (the model is centred in [data-stage-slot]) and the
  // company mark. The disciplines model IS the eight offerings, so pointing at
  // a tile lifts its block in the middle. Visual order: first row left/right,
  // second row left/right, then the bottom row across. Below lg, one column in
  // content order, and the centre tile (no 3D on phones) is omitted.
  // Eight places around the 2×2 centre, then a full-width row under them for
  // a ninth. The centre must stay clear for the model, so the ring is fixed.
  const PLACE = [
    'lg:col-start-1 lg:row-start-1', 'lg:col-start-4 lg:row-start-1',
    'lg:col-start-1 lg:row-start-2', 'lg:col-start-4 lg:row-start-2',
    'lg:col-start-1 lg:row-start-3', 'lg:col-start-2 lg:row-start-3',
    'lg:col-start-3 lg:row-start-3', 'lg:col-start-4 lg:row-start-3',
    'lg:col-span-4 lg:col-start-1 lg:row-start-4',
  ];
  // Drawing per offering, keyed by its anchor so reordering content keeps it.
  const GLYPH: Record<string, GlyphName> = {
    'custom-business-software': 'software', 'business-process-automation': 'automation',
    'system-integration': 'integration', 'data-and-reporting-systems': 'data',
    'customer-and-partner-platforms': 'platforms', 'cloud-hosting-support-and-maintenance': 'hosting',
    'ai-and-gen-ai-integrations': 'ai', websites: 'websites',
    'ecommerce-systems': 'ecommerce',
  };
  const bento = (
    <div
      // Hairlines as real borders: the centre cell must stay transparent so
      // the 3D behind the page shows through it.
      className="mt-10 grid border-l border-t border-line text-left lg:grid-cols-4"
      onMouseLeave={() => { setPinned(null); lastPointer.current = null; }}
      onBlur={() => setPinned(null)}
    >
      {items.map((item, index) => (
        <BentoTile
          key={item.title}
          hue={item.hue}
          title={item.title}
          body={item.body ?? ''}
          href={`/capabilities/${slug(item.title)}`}
          glyph={GLYPH[slug(item.title)] ?? 'software'}
          // Past the eight ring places the tile spans the width, so it reads as
          // a row rather than a gap-filler in a grid built around the centre.
          size={index < 8 ? 'regular' : 'slim'}
          className={PLACE[index] ?? ''}
          highlighted={active === index}
          onOpen={(point) => pin(index, point)}
        />
      ))}
      <div
        data-stage-slot=""
        aria-hidden="true"
        className="relative hidden border-b border-r border-line lg:col-span-2 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:flex lg:min-h-[28rem] lg:items-end lg:justify-center lg:pb-7"
      >
        {/* Stand-in for the live model: shown until a stage is live (has3d),
            and whenever it cannot be (no WebGL, no JS). Design review,
            2026-09-29: the centre was an empty hole without WebGL. */}
        <IsoGlyph
          name="disciplines"
          data-stage-fallback=""
          className="absolute left-1/2 top-[44%] h-44 w-auto -translate-x-1/2 -translate-y-1/2 text-ink-3 transition-opacity duration-700 ease-brand"
        />
        {brand ? (
          <span className="flex items-baseline gap-2.5">
            <b className="text-logo font-semibold tracking-[-0.045em] text-ink">{brand.wordmark}</b>
            {brand.since ? <span className="font-mono text-micro tracking-[0.12em] text-ink-3">SINCE {brand.since}</span> : null}
          </span>
        ) : null}
      </div>
    </div>
  );

  const rows = layout === 'bento' ? bento : (
    <div
      className={isStatic && layout === 'grid' ? 'mt-9 grid gap-x-8 sm:grid-cols-2' : 'mt-9'}
      onMouseLeave={() => { setPinned(null); lastPointer.current = null; }}
      onBlur={() => setPinned(null)}
    >
      {items.map((item, index) => (
        <DisciplineRow
          key={item.title}
          hue={item.hue}
          title={item.title}
          body={item.body}
          systems={item.systems}
          count={item.count}
          countUnit={countUnit}
          open={isStatic || active === index}
          highlighted={isStatic ? active === index : undefined}
          onOpen={(point) => pin(index, point)}
        />
      ))}
    </div>
  );

  const cta = link ? (
    <div className="mt-9">
      <Button href={link.href} variant="secondary">
        {link.label}
      </Button>
    </div>
  ) : null;

  if (isStatic) {
    return (
      <Section id={id} side={side} scene={scene} labelledBy={titleId}>
        <HeadlineSplit headline={headline} id={titleId} />
        {rows}
        {cta}
      </Section>
    );
  }

  return (
    <Section id={id} side={side} scene={scene} labelledBy={titleId} className="lg:pb-0">
      <div className="lg:relative">
        {/* Desktop track: one sentinel per row. Collapsed below lg. */}
        <div className="hidden lg:block">
          {items.map((item, index) => (
            <div
              key={`sentinel-${item.title}`}
              ref={(node) => { sentinels.current[index] = node; }}
              data-index={index}
              aria-hidden="true"
              style={{ height: `${trackVh}vh` }}
            />
          ))}
        </div>

        <div className="lg:absolute lg:inset-0 lg:h-full">
          {/* Anchored at 116px, like the prototype's `.seq-in` — not centred,
              which pushed the lower rows below the fold. */}
          <div className="lg:sticky lg:top-[116px]">
            <HeadlineSplit headline={headline} id={titleId} />
            {rows}
            {cta}
          </div>
        </div>
      </div>
    </Section>
  );
}
