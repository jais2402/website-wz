import { Button, Eyebrow, Swatch } from '@/components/atoms';
import { AreaAccordion, HeadlineSplit } from '@/components/molecules';
import { LayerList } from './LayerList';
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

  // A centred chapter (content sets `side: "c"`): the same full-screen statement
  // composition as the hook — large centred headline, one line of lead, the
  // points as a single row, then the note. The stage places the model in the
  // space below the text. Pricing uses this at the owner's request.
  if (side === 'c') {
    return (
      <Section
        id={id}
        side="c"
        scene={scene}
        labelledBy={titleId}
        className="lg:flex lg:min-h-screen lg:flex-col lg:justify-start lg:pt-[16vh]"
      >
        {eyebrow ? <Eyebrow className="mb-5">{eyebrow}</Eyebrow> : null}
        <HeadlineSplit
          headline={headline}
          id={titleId}
          className="mx-auto lg:max-w-[19ch] lg:text-[clamp(40px,4.4vw,76px)] lg:leading-[1.03]"
        />
        {lead ? (
          <p className="mx-auto mt-6 max-w-[52ch] text-lead text-ink-2">{lead}</p>
        ) : null}

        {layers?.length ? (
          // A centred list of names — the countries chapter.
          // No separator dots: a dot between items cannot know where the line
          // wraps, and one landed at the start of the second line. Spacing does
          // the separating instead.
          <LayerList
            layers={layers}
            scene={scene}
            className="mx-auto mt-10 flex max-w-[920px] flex-wrap justify-center gap-x-9 gap-y-3 text-[clamp(18px,1.6vw,24px)] tracking-tight"
            restClassName="text-ink-2"
          />
        ) : null}

        {points?.length ? (
          <ol className="mx-auto mt-10 grid max-w-[980px] gap-0 border-t border-line-2 text-left sm:grid-cols-3">
            {points.map((p) => (
              <li
                key={p.title}
                className="border-line py-5 sm:px-6 sm:first:pl-0 sm:[&+li]:border-l"
              >
                <div className="flex items-center gap-2.5">
                  {p.hue ? <Swatch hue={p.hue} active /> : null}
                  <h3 className="text-title font-medium tracking-tight text-ink">{p.title}</h3>
                </div>
                <p className="mt-2 text-small leading-relaxed text-ink-2">{p.body}</p>
              </li>
            ))}
          </ol>
        ) : null}

        {note ? (
          <p className="mx-auto mt-7 text-title font-medium text-ink">{note}</p>
        ) : null}

        {link ? (
          <div className="mt-8 flex justify-center">
            <Button href={link.href} variant="secondary" topic={link.topic}>
              {link.label}
            </Button>
          </div>
        ) : null}
      </Section>
    );
  }

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
        <LayerList layers={layers} scene={scene} />
      ) : null}

      {pillars?.length ? (
        <div className="mt-9 grid gap-6 lg:grid-cols-2">
          {pillars.map((p) => (
            <div key={p.title} className="border-t border-line pt-4">
              <h3 className="text-title font-medium tracking-tight text-ink">{p.title}</h3>
              <p className="mt-2 max-w-[46ch] text-small leading-relaxed text-ink-2">{p.body}</p>
            </div>
          ))}
        </div>
      ) : null}

      {trust ? (
        <div className="mt-11">
          <h3 className="text-subhead font-medium tracking-tight text-ink">{trust.title}</h3>
          <div className="mt-4">
            {trust.items.map((item) => (
              <AreaAccordion key={item.title} title={item.title} body={item.body} />
            ))}
          </div>
          {trust.link ? (
            <div className="mt-6">
              <Button href={trust.link.href} variant="secondary" size="small" topic={trust.link.topic}>
                {trust.link.label}
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}

      {note ? <p className="mt-7 max-w-[52ch] text-small text-ink-3">{note}</p> : null}

      {link ? (
        <div className="mt-8">
          <Button href={link.href} variant="secondary" topic={link.topic}>
            {link.label}
          </Button>
        </div>
      ) : null}
    </Section>
  );
}
