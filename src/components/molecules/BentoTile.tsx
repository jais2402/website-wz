import Link from 'next/link';
import { cn } from '@/lib/cn';
import type { Hue } from '@/types/content';

export type BentoSize = 'feature' | 'large' | 'regular' | 'slim';

export interface BentoTileProps {
  title: string;
  body: string;
  href: string;
  hue?: Hue | undefined;
  size: BentoSize;
  /** Lit from outside, e.g. the pointer is on this tile's part in the 3D. */
  highlighted?: boolean | undefined;
  onOpen?: ((point?: { x: number; y: number }) => void) | undefined;
}

// Static class strings per hue: Tailwind only generates classes it can see.
// The tint is the palette SURFACE value at low alpha behind ink text. A hue
// is never used as a text colour (design.md §1).
const TINT: Record<Hue, { rest: string; hover: string; on: string; bar: string }> = {
  blueprint: { rest: 'bg-blueprint/5', hover: 'hover:bg-blueprint/10 hover:border-blueprint/40', on: 'bg-blueprint/10 border-blueprint/40', bar: 'bg-blueprint' },
  pine: { rest: 'bg-pine/5', hover: 'hover:bg-pine/10 hover:border-pine/40', on: 'bg-pine/10 border-pine/40', bar: 'bg-pine' },
  ochre: { rest: 'bg-ochre/5', hover: 'hover:bg-ochre/10 hover:border-ochre/40', on: 'bg-ochre/10 border-ochre/40', bar: 'bg-ochre' },
  plum: { rest: 'bg-plum/5', hover: 'hover:bg-plum/10 hover:border-plum/40', on: 'bg-plum/10 border-plum/40', bar: 'bg-plum' },
  rose: { rest: 'bg-rose/5', hover: 'hover:bg-rose/10 hover:border-rose/40', on: 'bg-rose/10 border-rose/40', bar: 'bg-rose' },
  signal: { rest: 'bg-signal/5', hover: 'hover:bg-signal/10 hover:border-signal/40', on: 'bg-signal/10 border-signal/40', bar: 'bg-signal' },
};

const SIZE: Record<BentoSize, { tile: string; title: string; body: string }> = {
  feature: { tile: 'lg:col-span-2 p-7 lg:p-8', title: 'text-statement font-medium', body: 'mt-4 max-w-measure-tight text-body' },
  large: { tile: 'p-6 lg:min-h-44', title: 'text-subhead font-medium', body: 'mt-3 text-body' },
  regular: { tile: 'p-5', title: 'text-title font-medium', body: 'mt-2 text-small' },
  slim: { tile: 'lg:col-span-2 px-5 py-4 lg:flex lg:items-baseline lg:gap-5', title: 'text-title font-medium', body: 'mt-1 text-small lg:mt-0' },
};

/**
 * Molecule. One offering in the "What we build" bento.
 *
 * Size carries importance, so the grid is not a wall of equal cards: one
 * feature tile, a large pair, regular tiles, and a slim last strip. Each tile
 * is a link to its entry on /capabilities. Pointing at it or focusing it
 * lights its block in the 3D, via onOpen, the same channel the row list used.
 * Nothing is hidden or gated at any width (CLAUDE.md rule 5).
 */
export function BentoTile({ title, body, href, hue, size, highlighted, onOpen }: BentoTileProps) {
  const tint = hue && size !== 'slim' ? TINT[hue] : undefined;
  const s = SIZE[size];
  return (
    <Link
      href={href}
      onMouseMove={(e) => onOpen?.({ x: e.clientX, y: e.clientY })}
      onFocus={() => onOpen?.()}
      className={cn(
        'group relative block overflow-hidden rounded-hair border border-line',
        'transition-[background-color,border-color] duration-300 ease-brand',
        'focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blueprint',
        s.tile,
        tint ? (highlighted ? tint.on : tint.rest) : 'bg-transparent',
        tint ? tint.hover : 'hover:border-ink-3',
      )}
    >
      {tint ? (
        <span
          aria-hidden="true"
          className={cn('absolute inset-x-0 top-0 h-0.75 transition-opacity duration-300 ease-brand', tint.bar, highlighted ? 'opacity-100' : 'opacity-60 group-hover:opacity-100')}
        />
      ) : null}
      <h3 className={cn('tracking-tight text-ink text-balance', s.title)}>{title}</h3>
      <p className={cn('pr-8 leading-relaxed text-ink-2 text-pretty', s.body)}>{body}</p>
      <span
        aria-hidden="true"
        className="absolute bottom-4 right-5 text-ink-3 transition-[translate,color] duration-200 ease-brand group-hover:translate-x-1 group-hover:text-ink"
      >
        &#8594;
      </span>
    </Link>
  );
}
