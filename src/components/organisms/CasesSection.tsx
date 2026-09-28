'use client';

import { useState } from 'react';
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

/**
 * Organism. The case studies, one panel at a time, tabs to jump.
 *
 * The deep-linkable version of every case lives at /work#slug — that is the
 * URL an influencer sends (context.md §5). This panel is the summary; it never
 * becomes the only place a case exists.
 */
export function CasesSection({ id, side, scene, headline, cases, actions }: CasesSectionProps) {
  const first = cases[0];
  const [activeSlug, setActiveSlug] = useState(first?.slug ?? '');
  const active = cases.find((c) => c.slug === activeSlug) ?? first;
  const titleId = `${id}-title`;

  if (!active) return null;

  return (
    <Section id={id} side={side} scene={scene} labelledBy={titleId}>
      <HeadlineSplit headline={headline} id={titleId} />

      <div className="mt-8">
        <CaseTabs
          items={cases.map((c) => ({
            slug: c.slug,
            label: [c.region, c.sector].filter(Boolean).join(' · '),
            hue: c.hue,
          }))}
          activeSlug={active.slug}
          onSelect={setActiveSlug}
        />
      </div>

      <div
        role="tabpanel"
        id={`panel-${active.slug}`}
        aria-labelledby={`tab-${active.slug}`}
        tabIndex={0}
        className="pt-7"
      >
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {active.hue ? <Swatch hue={active.hue} active /> : null}
          <Eyebrow>{[active.region, active.sector].filter(Boolean).join(' · ')}</Eyebrow>
        </div>

        <h3 className="mt-2.5 text-[clamp(24px,2vw,30px)] font-medium leading-[1.15] tracking-[-0.025em] text-ink">{active.title}</h3>

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
                className="rounded-full border border-line-2 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.06em] text-ink-2"
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
    </Section>
  );
}
