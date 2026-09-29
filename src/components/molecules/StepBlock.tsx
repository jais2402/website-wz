import { cn } from '@/lib/cn';
import type { Hue } from '@/types/content';

export interface StepBlockProps {
  n?: string | undefined;
  /** Total number of steps, for the "01 / 04" counter. */
  total?: number | undefined;
  hue?: Hue | undefined;
  title: string;
  body: string;
  note?: string | undefined;
  output?: string | undefined;
  /** The label before the output line — "Output". From content. */
  outputLabel?: string | undefined;
  /** The step currently in view. It carries a 2px rule in its hue. */
  now?: boolean | undefined;
}

const HUE_RULE: Record<Hue, string> = {
  blueprint: 'border-t-blueprint',
  pine: 'border-t-pine',
  ochre: 'border-t-ochre',
  plum: 'border-t-plum',
  rose: 'border-t-rose',
  signal: 'border-t-signal',
};

/**
 * Molecule. One stage or principle. Always open — nothing here is gated on
 * scroll or hover at any width.
 *
 * Parity with the prototype: no colour chip. The hue appears only as a 2px rule
 * across the top of the step in view — "a coloured rule marks the one in view"
 * — and the stages carry an "01 / 04" counter and a labelled output line.
 *
 * `[data-step]` is an interface, not decoration: the 3D stage measures these to
 * know how far through the stages the reader is. Do not re-lay them out in a
 * grid — that is what once stopped the build assembly from playing.
 */
export function StepBlock({
  n, total, hue, title, body, note, output, outputLabel, now,
}: StepBlockProps) {
  return (
    <div
      data-step=""
      className={cn(
        'pb-9 transition-[border-color] duration-[400ms] ease-brand',
        now && hue ? cn('border-t-2 pt-[27px]', HUE_RULE[hue]) : 'border-t border-line pt-7',
      )}
    >
      {n ? (
        <p className="font-mono text-fine tabular-nums text-ink-3">
          {total ? `${n} / ${String(total).padStart(2, '0')}` : n}
        </p>
      ) : null}
      <h3 className="mt-2 text-[clamp(20px,1.7vw,26px)] font-medium leading-[1.15] tracking-[-0.025em] text-ink">
        {title}
      </h3>
      <p className="mt-3 max-w-measure text-body leading-relaxed text-ink-2">{body}</p>
      {note ? <p className="mt-4 max-w-measure text-small text-ink">{note}</p> : null}
      {output ? (
        <p className="mt-4 flex items-baseline gap-3 text-small text-ink">
          {outputLabel ? (
            <span className="flex-none font-mono text-micro uppercase tracking-[0.1em] text-ink-3">
              {outputLabel}
            </span>
          ) : null}
          {output}
        </p>
      ) : null}
    </div>
  );
}
