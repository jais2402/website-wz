import { Figure } from '@/components/atoms';

export interface MetricPairProps {
  value: number | string;
  suffix?: string | undefined;
  caption: string;
}

/**
 * Molecule. A figure with the sentence that makes it mean something.
 * A number with no caption is not proof — context.md §3.
 */
export function MetricPair({ value, suffix, caption }: MetricPairProps) {
  return (
    <div>
      <Figure value={value} suffix={suffix} />
      <p className="mt-3 max-w-[30ch] text-small leading-relaxed text-ink-2">{caption}</p>
    </div>
  );
}
