import { Button, Eyebrow } from '@/components/atoms';
import { AreaAccordion, HeadlineSplit } from '@/components/molecules';
import { Section } from './Section';
import type { Headline, Hue, Link as ContentLink, Side } from '@/types/content';

export interface ProseSectionProps {
  id: string;
  side?: Side | undefined;
  scene?: string | undefined;
  eyebrow?: string | undefined;
  headline: Headline;
  lead?: string | undefined;
  /** Hue-tagged blocks — pricing stages, architecture pillars. */
  points?: Array<{ hue?: Hue | undefined; title: string; body: string }> | undefined;
  /** Plain named blocks with no hue. */
  pillars?: Array<{ title: string; body: string }> | undefined;
  /** A flat list of names — the stack layers. */
  layers?: string[] | undefined;
  trust?:
    | { title: string; items: Array<{ title: string; body: string }>; link?: ContentLink | undefined }
    | undefined;
  note?: string | undefined;
  link?: ContentLink | undefined;
}

/**
 * Organism. A prose block with optional supporting lists.
 *
 * Covers the pricing and tech sections: same shape, different slots filled.
 * Everything is optional and renders nothing when absent, so a section that
 * gains a list later needs no new component.
 */
export function ProseSection({
  id,
  side,
  scene,
  eyebrow,
  headline,
  lead,
  points,
  pillars,
  layers,
  trust,
  note,
  link,
}: ProseSectionProps) {
  const titleId = `${id}-title`;
  return (
    <Section id={id} side={side} scene={scene} labelledBy={titleId}>
      {eyebrow ? <Eyebrow className="mb-4">{eyebrow}</Eyebrow> : null}
      <HeadlineSplit headline={headline} id={titleId} />
      {lead ? <p className="mt-6 max-w-[52ch] text-lead text-ink-2">{lead}</p> : null}

      {points?.length ? (
        <div className="mt-9">
          {points.map((p) => (
            <AreaAccordion key={p.title} title={p.title} body={p.body} hue={p.hue} />
          ))}
        </div>
      ) : null}

      {layers?.length ? (
        <ul className="mt-9 flex flex-wrap gap-x-5 gap-y-2.5 border-t border-line pt-5">
          {layers.map((layer) => (
            <li key={layer} className="text-[14.5px] text-ink-2">
              {layer}
            </li>
          ))}
        </ul>
      ) : null}

      {pillars?.length ? (
        <div className="mt-9 grid gap-6 lg:grid-cols-2">
          {pillars.map((p) => (
            <div key={p.title} className="border-t border-line pt-4">
              <h3 className="text-[16.5px] font-medium tracking-tight text-ink">{p.title}</h3>
              <p className="mt-2 max-w-[46ch] text-[14.5px] leading-relaxed text-ink-2">{p.body}</p>
            </div>
          ))}
        </div>
      ) : null}

      {trust ? (
        <div className="mt-11">
          <h3 className="text-[19px] font-medium tracking-tight text-ink">{trust.title}</h3>
          <div className="mt-4">
            {trust.items.map((item) => (
              <AreaAccordion key={item.title} title={item.title} body={item.body} />
            ))}
          </div>
          {trust.link ? (
            <div className="mt-6">
              <Button href={trust.link.href} variant="secondary" size="small">
                {trust.link.label}
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}

      {note ? <p className="mt-7 max-w-[52ch] text-[14px] text-ink-3">{note}</p> : null}

      {link ? (
        <div className="mt-8">
          <Button href={link.href} variant="secondary">
            {link.label}
          </Button>
        </div>
      ) : null}
    </Section>
  );
}
