'use client';

import { useEffect, useRef, useState } from 'react';
import { Button, Eyebrow, Swatch } from '@/components/atoms';
import { CaseTabs, HeadlineSplit } from '@/components/molecules';
import { Section } from './Section';
import type { CaseStudy, Headline, Link as ContentLink, Side } from '@/types/content';

export interface CasesSectionProps {
  id: string;
  side?: Side | undefined;
  scene?: string | undefined;
  headline: Headline;
  cases: CaseStudy[];
  actions?: ContentLink[] | undefined;
}

/** Scroll distance each case holds the screen for, on desktop. From the prototype. */
const CASE_TRACK_VH = 54;

/**
 * Organism. The case studies: scroll advances the case, tabs jump to one.
 *
 * On desktop the heading, tabs and panel hold still in a sticky block while the
 * reader scrolls a tall track — one segment per case. Each segment carries a
 * `[data-step]`, which does two jobs at once: an IntersectionObserver reads it
 * to switch the panel, and the 3D stage measures it to turn the carousel. The
 * panel and the model are therefore always showing the same case.
 *
 * A tab jumps by scrolling to that case's segment rather than just swapping the
 * panel — otherwise the model would keep showing the case the scroll is on.
 *
 * **Below lg there is no track** and nothing is scroll-gated: the tabs switch
 * the panel directly (context.md §3.4).
 *
 * The deep-linkable version of every case lives at /work#slug — the URL an
 * influencer sends. This panel is the summary; it is never the only place a
 * case exists.
 */
export function CasesSection({ id, side, scene, headline, cases, actions }: CasesSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const sentinels = useRef<Array<HTMLDivElement | null>>([]);
  const desktop = useRef(false);
  const titleId = `${id}-title`;

  useEffect(() => {
    const wide = window.matchMedia('(min-width: 1000px)');
    desktop.current = wide.matches;
    if (!wide.matches) return;

    const nodes = sentinels.current.filter(Boolean) as HTMLDivElement[];
    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = Number((entry.target as HTMLElement).dataset.index);
          if (!Number.isNaN(index)) setActiveIndex(index);
        }
      },
      // A thin trigger band across the middle of the viewport — the same probe
      // line the 3D stage uses, so the panel and the carousel switch together.
      { rootMargin: '-50% 0px -50% 0px', threshold: 0 },
    );
    for (const node of nodes) observer.observe(node);
    return () => observer.disconnect();
  }, [cases.length]);

  function jumpTo(slug: string) {
    const index = cases.findIndex((c) => c.slug === slug);
    if (index < 0) return;
    const node = sentinels.current[index];
    if (desktop.current && node) {
      // Land the probe line just inside this case's segment.
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const top = node.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.5 + 2;
      window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
    }
    setActiveIndex(index);
  }

  const active = cases[activeIndex] ?? cases[0];
  if (!active) return null;

  return (
    <Section id={id} side={side} scene={scene} labelledBy={titleId} className="lg:pb-0">
      <div className="lg:relative" style={{ ['--cases' as string]: cases.length }}>
        {/* Desktop track: one segment per case. Collapsed below lg. */}
        <div className="hidden lg:block" aria-hidden="true">
          {cases.map((c, index) => (
            <div
              key={`seg-${c.slug}`}
              ref={(node) => { sentinels.current[index] = node; }}
              data-step=""
              data-index={index}
              style={{ height: `${CASE_TRACK_VH}vh` }}
            />
          ))}
        </div>

        <div className="lg:absolute lg:inset-0">
          {/* Anchored at 116px like the sequences — see SequenceSection. */}
          <div className="lg:sticky lg:top-[116px]">
            <HeadlineSplit headline={headline} id={titleId} />

            <div className="mt-8">
              <CaseTabs
                items={cases.map((c) => ({
                  slug: c.slug,
                  label: [c.region, c.sector].filter(Boolean).join(' · '),
                  hue: c.hue,
                }))}
                activeSlug={active.slug}
                onSelect={jumpTo}
              />
            </div>

            <div
              key={active.slug}
              role="tabpanel"
              id={`panel-${active.slug}`}
              aria-labelledby={`tab-${active.slug}`}
              tabIndex={0}
              className="pt-7 motion-safe:animate-[case-in_0.4s_var(--ease-brand)]"
            >
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                {active.hue ? <Swatch hue={active.hue} active /> : null}
                <Eyebrow>{[active.region, active.sector].filter(Boolean).join(' · ')}</Eyebrow>
              </div>

              <h3 className="mt-2.5 text-[clamp(24px,2vw,30px)] font-medium leading-[1.15] tracking-[-0.025em] text-ink">
                {active.title}
              </h3>

              {active.body.map((paragraph) => (
                <p key={paragraph} className="mt-3 max-w-[58ch] text-[17px] leading-relaxed text-ink-2">
                  {paragraph}
                </p>
              ))}

              {active.metrics?.length ? (
                <dl className="mt-6 grid grid-cols-2 border-t border-line">
                  {active.metrics.map((metric) => (
                    <div key={metric.label} className="border-line pr-4 pt-3.5 [&+div]:border-l [&+div]:pl-4">
                      <dd className="text-[24px] font-medium tabular-nums tracking-tight text-ink">
                        {metric.value}
                      </dd>
                      <dt className="mt-1 text-[13.5px] text-ink-3">{metric.label}</dt>
                    </div>
                  ))}
                </dl>
              ) : null}

              {active.tags?.length ? (
                <ul className="mt-6 flex flex-wrap gap-1.5">
                  {active.tags.map((tag) => (
                    <li
                      key={tag}
                      className="rounded-full border border-line-2 px-2.5 py-1 font-mono text-[10px] tracking-[0.06em] text-ink-2"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            {actions?.length ? (
              <div className="mt-9 flex flex-wrap gap-3">
                {actions.map((action) => (
                  <Button key={action.href} href={action.href} variant={action.variant ?? 'secondary'}>
                    {action.label}
                  </Button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </Section>
  );
}
