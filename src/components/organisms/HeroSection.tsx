import { Button, Eyebrow } from '@/components/atoms';
import { HeadlineSplit } from '@/components/molecules';
import type { Link as ContentLink, Headline } from '@/types/content';

export interface HeroSectionProps {
  headline: Headline;
  sub: string;
  caption?: string | undefined;
  actions: ContentLink[];
  facts?: Array<{ label: string; value: string }> | undefined;
  builtWith?: { label: string; items: string[] } | undefined;
}

/**
 * Organism. Owns its layout, not its data.
 * The five-second test lives or dies here: category noun in the first line,
 * the trigger in the second. Comprehension went 26% to 80% on this change.
 */
export function HeroSection({
  headline,
  sub,
  caption,
  actions,
  facts,
  builtWith,
}: HeroSectionProps) {
  return (
    <section
      id="hero"
      data-side="l"
      data-scene="workarounds"
      aria-labelledby="hero-title"
      className="relative min-h-[74vh] px-6 pt-[clamp(140px,19vh,210px)] pb-[clamp(36px,5vh,72px)] pl-[max(24px,5.4vw)]"
    >
      <div data-body="" className="w-full lg:w-[calc(50vw-max(24px,5.4vw))]">
        <HeadlineSplit headline={headline} level="d1" as="h1" id="hero-title" />
        <p className="mt-[26px] max-w-[50ch] text-[17.5px] leading-relaxed text-ink">{sub}</p>

        <div className="mt-9 flex flex-wrap gap-3">
          {actions.map((action) => (
            <Button key={action.href} href={action.href} variant={action.variant ?? 'primary'}>
              {action.label}
            </Button>
          ))}
        </div>

        {caption ? <p className="mt-5 text-[13.5px] text-ink-3">{caption}</p> : null}

        {facts?.length ? (
          <dl className="mt-[clamp(56px,9vh,96px)] grid grid-cols-[auto_auto_1fr] border-t border-line">
            {facts.map((fact) => (
              <div key={fact.label} className="border-line pr-7 pt-4 first:pl-0 [&+div]:border-l [&+div]:pl-7">
                <dt>
                  <Eyebrow>{fact.label}</Eyebrow>
                </dt>
                <dd className="mt-1.5 text-[17px] tabular-nums">{fact.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        {builtWith ? (
          <div className="mt-10 flex flex-wrap items-baseline gap-x-6 gap-y-2.5">
            <Eyebrow>{builtWith.label}</Eyebrow>
            {builtWith.items.map((item) => (
              <b key={item} className="text-[15px] font-medium text-ink-2">
                {item}
              </b>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
