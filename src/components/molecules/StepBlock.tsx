import { Eyebrow, Swatch } from '@/components/atoms';
import type { Hue } from '@/types/content';

export interface StepBlockProps {
  n?: string | undefined;
  hue?: Hue | undefined;
  title: string;
  body: string;
  note?: string | undefined;
  output?: string | undefined;
}

/**
 * Molecule. One stage or principle. Always open — this is not a sequence,
 * so nothing here is gated on scroll or hover at any width.
 */
export function StepBlock({ n, hue, title, body, note, output }: StepBlockProps) {
  return (
    <div data-step="" className="border-t border-line pt-5">
      <div className="flex items-center gap-2.5">
        {hue ? <Swatch hue={hue} active /> : null}
        {n ? <Eyebrow>{n}</Eyebrow> : null}
      </div>
      <h3 className="mt-3 text-[19px] font-medium tracking-tight text-ink">{title}</h3>
      <p className="mt-2 max-w-[46ch] text-[15px] leading-relaxed text-ink-2">{body}</p>
      {note ? <p className="mt-2.5 max-w-[46ch] text-[14px] text-ink-3">{note}</p> : null}
      {output ? (
        <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-3">
          {output}
        </p>
      ) : null}
    </div>
  );
}
