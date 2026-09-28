import { Eyebrow } from '@/components/atoms';

export interface FactRowProps {
  k: string;
  v: string;
}

/** Molecule. A label/value pair on a hairline. Used in the evidence table. */
export function FactRow({ k, v }: FactRowProps) {
  return (
    <div className="flex items-baseline justify-between gap-6 border-t border-line py-3.5">
      <dt>
        <Eyebrow>{k}</Eyebrow>
      </dt>
      <dd className="text-right text-[15px] text-ink">{v}</dd>
    </div>
  );
}
