import Link from 'next/link';
import { IsoGlyph, type GlyphName } from '@/components/atoms';
import { cn } from '@/lib/cn';
import type { Hue } from '@/types/content';

export type BentoSize = 'feature' | 'large' | 'regular' | 'slim';

export interface BentoTileProps {
  title: string;
  body: string;
  href: string;
  hue?: Hue | undefined;
  glyph: GlyphName;
  size: BentoSize;
  /** Lit from outside, e.g. the pointer is on this tile's part in the 3D. */
  highlighted?: boolean | undefined;
  onOpen?: ((point?: { x: number; y: number }) => void) | undefined;
  className?: string | undefined;
}

// Literal class strings: Tailwind only generates what it can see. The drawing
// takes the hue's contrast-safe TEXT value, and only on attention.
const INK: Record<Hue, { hover: string; on: string }> = {
  blueprint: { hover: 'group-hover:text-blueprint-t group-focus-visible:text-blueprint-t', on: 'text-blueprint-t' },
  pine: { hover: 'group-hover:text-pine-t group-focus-visible:text-pine-t', on: 'text-pine-t' },
  ochre: { hover: 'group-hover:text-ochre-t group-focus-visible:text-ochre-t', on: 'text-ochre-t' },
  plum: { hover: 'group-hover:text-plum-t group-focus-visible:text-plum-t', on: 'text-plum-t' },
  rose: { hover: 'group-hover:text-rose-t group-focus-visible:text-rose-t', on: 'text-rose-t' },
  signal: { hover: 'group-hover:text-signal-t group-focus-visible:text-signal-t', on: 'text-signal-t' },
};

const SIZE: Record<BentoSize, { tile: string; art: string; title: string; body: string }> = {
  feature: {
    tile: 'lg:col-span-2 grid gap-8 p-8 lg:grid-cols-[1fr_auto] lg:items-end',
    art: 'h-32 w-auto lg:order-2 lg:h-40',
    title: 'text-statement font-medium',
    body: 'mt-4 max-w-measure-tight text-body',
  },
  large: { tile: 'flex flex-col p-7', art: 'mb-10 h-24 w-auto self-start', title: 'text-subhead font-medium', body: 'mt-3 text-body' },
  regular: { tile: 'flex flex-col p-6', art: 'mb-7 h-14 w-auto self-start', title: 'text-title font-medium', body: 'mt-2 text-small' },
  slim: { tile: 'lg:col-span-2 flex items-center gap-5 px-6 py-5', art: 'h-7 w-auto flex-none', title: 'text-title font-medium', body: 'text-small' },
};

/**
 * Molecule. One offering in the "What we build" bento.
 *
 * Direction from leading product sites (2026-09-29): Linear's feature tiles
 * lead with a line-drawn isometric illustration; Vercel separates cells with
 * hairline rules instead of card chrome. So: no fills, no coloured borders, no
 * rounded cards. The illustration speaks the 3D model's block language. The
 * hue appears only on attention, as the drawing's colour, while the model
 * lifts the same part. Size carries importance. Nothing is gated at any
 * width (CLAUDE.md rule 5).
 */
export function BentoTile({ title, body, href, hue, glyph, size, highlighted, onOpen, className }: BentoTileProps) {
  const s = SIZE[size];
  const ink = hue ? INK[hue] : undefined;
  return (
    <Link
      href={href}
      onMouseMove={(e) => onOpen?.({ x: e.clientX, y: e.clientY })}
      onFocus={() => onOpen?.()}
      className={cn(
        'group relative border-b border-r border-line transition-colors duration-300 ease-brand hover:bg-raised',
        'focus-visible:z-10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blueprint',
        highlighted && 'bg-raised',
        s.tile,
        className,
      )}
    >
      <IsoGlyph
        name={glyph}
        className={cn(
          'transition-colors duration-300 ease-brand',
          highlighted && ink ? ink.on : 'text-ink-3',
          ink?.hover,
          s.art,
        )}
      />
      <div className={size === 'slim' ? 'flex flex-wrap items-baseline gap-x-5 gap-y-1' : undefined}>
        <h3 className={cn('tracking-tight text-ink text-balance', s.title)}>{title}</h3>
        <p className={cn('leading-relaxed text-ink-2 text-pretty', s.body)}>{body}</p>
      </div>
      <span
        aria-hidden="true"
        className="absolute right-6 top-6 text-ink-3 opacity-0 transition-[opacity,translate] duration-200 ease-brand group-hover:translate-x-0.5 group-hover:opacity-100 group-focus-visible:opacity-100"
      >
        &#8594;
      </span>
    </Link>
  );
}
