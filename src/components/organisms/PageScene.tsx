'use client';

import { useEffect } from 'react';
import { IsoGlyph, type GlyphName } from '@/components/atoms';
import { setHighlight } from '@/components/three/highlight';

export interface PageSceneProps {
  /** The scene key as content/site.json names it, e.g. "disciplines". */
  scene: string;
  /** Which part of that scene this page is about; -1 for none. */
  highlight?: number | undefined;
  /** The still drawing shown until — or instead of — the model. */
  glyph: GlyphName;
}

/**
 * Organism. A band at the top of a document page that the 3D stage fills.
 *
 * The stage finds its scenes by walking the DOM for `[data-scene]`, so a page
 * gets a model by carrying one of these and nothing else: no second renderer,
 * no second three.js bundle. With a single scene on the page there is no
 * neighbour to blend toward, so the model simply sits in its slot — the
 * journey belongs to the home page, and repeating it here would be noise.
 *
 * `data-side="c"` makes the model ride with the page, so it scrolls away with
 * this band instead of hanging behind the text below (the canvas is fixed).
 * The band is hidden below lg: on a phone the model is not the point and the
 * chunk never loads (CLAUDE.md rule 5).
 *
 * The drawing inside is the DOM's copy of the same idea. It is visible until a
 * stage is live and whenever one cannot be — no WebGL, no JavaScript, reduced
 * data — which is the fourth fallback in architecture.md §4.
 */
export function PageScene({ scene, highlight, glyph }: PageSceneProps) {
  useEffect(() => {
    if (highlight === undefined) return;
    setHighlight(scene, highlight);
  }, [scene, highlight]);

  return (
    <section
      id={`scene-${scene}`}
      data-scene={scene}
      data-side="c"
      aria-hidden="true"
      className="pointer-events-none relative hidden lg:block lg:h-[34vh]"
    >
      {/* measure() reads the first child as the reading column; this band has
          no text, so it is an empty box at the top of the band. */}
      <div data-body="" className="h-0" />
      <div data-stage-slot="" className="absolute inset-x-0 bottom-0 top-0">
        <IsoGlyph
          name={glyph}
          data-stage-fallback=""
          className="absolute left-1/2 top-1/2 h-40 w-auto -translate-x-1/2 -translate-y-1/2 text-ink-3 transition-opacity duration-700 ease-brand"
        />
      </div>
    </section>
  );
}
