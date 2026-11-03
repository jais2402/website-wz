import type { ReactNode } from 'react'

/**
 * Small code-drawn glyphs for the sub-pages' text-only lists, in the site's thread language: a light frame
 * (`g-base`), one accent shape (`g-line`), a thread that flows while its section is on screen (`g-thread`) and a
 * glowing knot (`g-knot`). Styles in pages.css. Decorative only: always aria-hidden.
 */
const GLYPHS = {
  // About: why small businesses work with us
  fit: (
    <>
      <rect className="g-base" x="7" y="7" width="34" height="34" rx="9" />
      <circle className="g-line" cx="24" cy="20" r="5" />
      <path className="g-line" d="M15 35c1.5-5 5-7.5 9-7.5s7.5 2.5 9 7.5" />
      <path className="g-thread" d="M41 13 C46 13 46 4 41 2" />
      <circle className="g-knot" cx="41" cy="13" r="2.6" />
    </>
  ),
  price: (
    <>
      <path className="g-base" d="M24 6 H40 a2 2 0 0 1 2 2 V24 L24 42 L6 24 Z" />
      <path className="g-line" d="M17 25 l5 5 9-10" />
      <path className="g-thread" d="M35 13 C30 4 18 4 10 10" />
      <circle className="g-knot" cx="35" cy="13" r="2.6" />
    </>
  ),
  stages: (
    <>
      <rect className="g-base" x="6" y="30" width="10" height="12" rx="2.5" />
      <rect className="g-base" x="19" y="21" width="10" height="21" rx="2.5" />
      <rect className="g-line" x="32" y="10" width="10" height="32" rx="2.5" />
      <path className="g-thread" d="M11 26 C14 18 20 18 24 16 S33 8 37 5" />
      <circle className="g-knot" cx="37" cy="5" r="2.6" />
    </>
  ),
  // How we work
  understand: (
    <>
      <circle className="g-base" cx="12" cy="12" r="3" />
      <circle className="g-base" cx="36" cy="10" r="3" />
      <circle className="g-base" cx="10" cy="36" r="3" />
      <path className="g-thread" d="M12 12 L21 21 M36 10 L25 19 M10 36 L19 27" />
      <circle className="g-line" cx="24" cy="24" r="8" />
      <path className="g-line" d="M30 30 L41 41" />
      <circle className="g-knot" cx="24" cy="24" r="2.6" />
    </>
  ),
  shape: (
    <>
      <rect className="g-base" x="6" y="6" width="36" height="36" rx="5" />
      <path className="g-base" d="M6 18 H42 M6 30 H42 M18 6 V42 M30 6 V42" />
      <path className="g-line" d="M12 36 L18 24 L26 28 L36 12" />
      <circle className="g-knot" cx="36" cy="12" r="2.6" />
    </>
  ),
  build: (
    <>
      <rect className="g-base" x="6" y="30" width="16" height="12" rx="2.5" />
      <rect className="g-base" x="26" y="30" width="16" height="12" rx="2.5" />
      <rect className="g-line" x="16" y="13" width="16" height="12" rx="2.5" />
      <path className="g-thread" d="M24 13 V4" />
      <circle className="g-knot" cx="24" cy="4" r="2.6" />
    </>
  ),
  run: (
    <>
      <rect className="g-base" x="5" y="9" width="38" height="28" rx="5" />
      <path className="g-base" d="M17 42 H31" />
      <path className="g-line" d="M10 24 H17 L20 17 L25 31 L28 22 L30 24 H38" />
      <circle className="g-knot" cx="38" cy="24" r="2.6" />
    </>
  ),
  // Pricing: what sets the price
  scope: (
    <>
      <circle className="g-base" cx="24" cy="24" r="18" />
      <circle className="g-base" cx="24" cy="24" r="11" />
      <circle className="g-line" cx="24" cy="24" r="4.5" />
      <path className="g-thread" d="M24 24 L42 6" />
      <circle className="g-knot" cx="24" cy="24" r="2.2" />
    </>
  ),
  integrations: (
    <>
      <rect className="g-base" x="4" y="6" width="12" height="10" rx="2.5" />
      <rect className="g-base" x="4" y="32" width="12" height="10" rx="2.5" />
      <rect className="g-base" x="32" y="19" width="12" height="10" rx="2.5" />
      <path className="g-thread" d="M16 11 C24 11 22 24 32 24 M16 37 C24 37 22 24 32 24" />
      <circle className="g-knot" cx="24" cy="24" r="2.6" />
    </>
  ),
  change: (
    <>
      <path className="g-base" d="M10 30 a15 15 0 0 1 24-17" />
      <path className="g-line" d="M38 18 a15 15 0 0 1-24 17" />
      <path className="g-line" d="M29 9 L35 13 L31 19" />
      <path className="g-thread" d="M17 26 L22 31 L31 21" />
      <circle className="g-knot" cx="14" cy="35" r="2.6" />
    </>
  ),
  // Technology: the stack groups, in `stack` order
  front: (
    <>
      <rect className="g-base" x="4" y="8" width="40" height="32" rx="5" />
      <path className="g-base" d="M4 16 H44" />
      <rect className="g-line" x="10" y="22" width="14" height="12" rx="2" />
      <path className="g-thread" d="M28 24 H38 M28 30 H35" />
      <circle className="g-knot" cx="9" cy="12" r="1.8" />
    </>
  ),
  back: (
    <>
      <path className="g-line" d="M16 8 C10 8 12 20 7 24 C12 28 10 40 16 40" />
      <path className="g-line" d="M32 8 C38 8 36 20 41 24 C36 28 38 40 32 40" />
      <path className="g-thread" d="M19 24 H29" />
      <circle className="g-knot" cx="24" cy="24" r="2.6" />
    </>
  ),
  mobile: (
    <>
      <rect className="g-base" x="13" y="4" width="22" height="40" rx="5" />
      <path className="g-base" d="M20 39 H28" />
      <rect className="g-line" x="17" y="11" width="14" height="10" rx="2" />
      <path className="g-thread" d="M17 26 H31 M17 31 H27" />
      <circle className="g-knot" cx="31" cy="11" r="2" />
    </>
  ),
  data: (
    <>
      <ellipse className="g-line" cx="24" cy="11" rx="15" ry="5" />
      <path className="g-base" d="M9 11 V37 c0 3 7 5 15 5 s15-2 15-5 V11" />
      <path className="g-thread" d="M9 20 c0 3 7 5 15 5 s15-2 15-5 M9 29 c0 3 7 5 15 5 s15-2 15-5" />
      <circle className="g-knot" cx="24" cy="25" r="2.2" />
    </>
  ),
  ai: (
    <>
      <path className="g-line" d="M24 6 C25 17 31 23 42 24 C31 25 25 31 24 42 C23 31 17 25 6 24 C17 23 23 17 24 6 Z" />
      <path className="g-thread" d="M36 6 L39 9 M9 39 L12 36" />
      <circle className="g-knot" cx="24" cy="24" r="2.6" />
    </>
  ),
  cloud: (
    <>
      <path className="g-line" d="M14 34 a8 8 0 0 1-1-15.9 A11 11 0 0 1 34 15 a8.5 8.5 0 0 1 1 19 Z" />
      <path className="g-thread" d="M18 40 V34 M24 44 V34 M30 40 V34" />
      <circle className="g-knot" cx="24" cy="25" r="2.6" />
    </>
  ),
  commerce: (
    <>
      <path className="g-base" d="M9 16 H39 L36 42 H12 Z" />
      <path className="g-line" d="M17 20 V13 a7 7 0 0 1 14 0 V20" />
      <path className="g-thread" d="M17 31 L22 35 L31 27" />
      <circle className="g-knot" cx="31" cy="20" r="2" />
    </>
  ),
  payments: (
    <>
      <rect className="g-base" x="4" y="11" width="32" height="22" rx="4" />
      <path className="g-base" d="M4 18 H36" />
      <rect className="g-line" x="9" y="24" width="9" height="5" rx="1.5" />
      <path className="g-thread" d="M30 38 C38 38 44 34 44 26" />
      <circle className="g-knot" cx="44" cy="26" r="2.6" />
    </>
  ),
} satisfies Record<string, ReactNode>

export type GlyphName = keyof typeof GLYPHS

/** One glyph, or nothing when the list has more items than glyphs. */
export function Glyph({ name, className = '' }: { name: GlyphName | undefined; className?: string }) {
  if (!name) return null
  return (
    <svg className={`pg-glyph ${className}`} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      {GLYPHS[name]}
    </svg>
  )
}
