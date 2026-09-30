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
        // Section rhythm: a floor height so the scene has scroll travel to
        // move through, and asymmetric padding — more above than below, so a
        // heading clears the sticky header.
        //
        // Tightened 2026-09-30 (owner: "the site feels like a void since it is
        // very plain"). The page was not badly styled, it was SPARSE: a column
        // of text, a model, and most of a 74vh screen empty. The floor is 62vh
        // and the padding roughly a quarter smaller, which is enough travel for
        // the scene and closes the emptiness the owner was reacting to.
        'relative min-h-[62vh] px-gutter',
        'pt-[clamp(76px,9vh,112px)] pb-[clamp(28px,4vh,56px)]',
        // A centred chapter owns a full screen: the reading column sits in the
        // upper half and the model is offset below it.
        side === 'c' && 'lg:min-h-[88vh]',
        className,
      )}
    >
      <div
        data-body=""
        className={cn(
          'w-full',
          side === 'c'
            ? 'mx-auto max-w-centre text-center'
            : 'lg:w-[calc(50vw-var(--spacing-gutter))]',
          side === 'r' && 'lg:ml-auto',
        )}
      >
        <Reveal>{children}</Reveal>
      </div>
    </section>
  );
}
