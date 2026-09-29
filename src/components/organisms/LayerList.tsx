'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';
import { setHighlight } from '@/components/three/highlight';

export interface LayerListProps {
  layers: string[];
  /** The section's scene. Pointing at a name lights that layer in the model. */
  scene?: string | undefined;
  /** List layout. Defaults to the left-aligned row of small names. */
  className?: string | undefined;
  /** Colour for the names at rest. The name pointed at goes to full ink. */
  restClassName?: string | undefined;
}

/**
 * Organism (client). The stack layers as a flat list of names, each tied to its
 * plate in the scene.
 *
 * Hover is an enhancement, never the way in: every name is already on the page
 * as text, and the model is labelled with the same names (rule 4). Nothing opens
 * or hides, so phones lose nothing (rule 5).
 */
export function LayerList({
  layers,
  scene,
  className = 'mt-9 flex flex-wrap gap-x-5 gap-y-2.5 border-t border-line pt-5 text-small',
  restClassName = 'text-ink-2',
}: LayerListProps) {
  const [on, setOn] = useState(-1);

  useEffect(() => {
    if (scene) setHighlight(scene, on);
  }, [scene, on]);
  useEffect(() => () => { if (scene) setHighlight(scene, -1); }, [scene]);

  return (
    <ul
      className={className}
      onMouseLeave={() => setOn(-1)}
    >
      {layers.map((layer, i) => (
        <li
          key={layer}
          onMouseEnter={() => setOn(i)}
          className={cn(
            'transition-colors duration-200',
            on === i ? 'text-ink' : restClassName,
          )}
        >
          {layer}
        </li>
      ))}
    </ul>
  );
}
