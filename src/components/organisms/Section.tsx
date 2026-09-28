import { cn } from '@/lib/cn';
import { Reveal } from '@/components/atoms';
import type { ReactNode } from 'react';
import type { Side } from '@/types/content';

export interface SectionProps {
  id: string;
  side?: Side | undefined;
  scene?: string | undefined;
  labelledBy: string;
  children: ReactNode;
  className?: string;
}

/**
 * Organism primitive. The section shell every pattern sits in.
 *
 * Owns the split-canvas geometry from design.md §3: above lg the reading
 * column takes one half and the 3D stage the other, alternating side by
 * section. Below lg it is a single column — the stage collapses, because on a
 * phone the model is not the point.
 *
 * data-side and data-scene are read by the 3D system; they carry no styling
 * meaning of their own beyond the column placement below.
 */
export function Section({ id, side = 'l', scene, labelledBy, children, className }: SectionProps) {
  return (
    <section
      id={id}
      data-side={side}
      data-scene={scene}
      aria-labelledby={labelledBy}
      className={cn(
        // Section rhythm from the prototype: a floor height so the scene has
        // scroll travel to move through, and asymmetric padding — more above
        // than below, so a heading clears the sticky header.
        'relative min-h-[74vh] px-[max(24px,5.4vw)]',
        'pt-[clamp(100px,12vh,140px)] pb-[clamp(36px,5vh,72px)]',
        // A centred chapter owns a full screen: the reading column sits in the
        // upper half and the model is offset below it.
        side === 'c' && 'lg:min-h-screen',
        className,
      )}
    >
      <div
        data-body=""
        className={cn(
          'w-full',
          side === 'c'
            ? 'mx-auto max-w-[1100px] text-center'
            : 'lg:w-[calc(50vw-max(24px,5.4vw))]',
          side === 'r' && 'lg:ml-auto',
        )}
      >
        <Reveal>{children}</Reveal>
      </div>
    </section>
  );
}
