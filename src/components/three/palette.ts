import * as THREE from 'three';

/**
 * The scene's colours, read live from the page's CSS custom properties.
 *
 * Reading the tokens rather than duplicating hex values means the model can
 * never drift from design.md §1, and a theme change is picked up by re-reading
 * the same properties — which is how the prototype did it.
 */
/** The colour members of the palette — `shadow` is a number and excluded. */
export type PaletteColour =
  | 'model' | 'model2' | 'ink' | 'ground'
  | 'signal' | 'blueprint' | 'pine' | 'ochre' | 'plum' | 'rose';

export interface Palette {
  model: THREE.Color;
  model2: THREE.Color;
  ink: THREE.Color;
  ground: THREE.Color;
  signal: THREE.Color;
  blueprint: THREE.Color;
  pine: THREE.Color;
  ochre: THREE.Color;
  plum: THREE.Color;
  rose: THREE.Color;
  shadow: number;
}

const FALLBACK: Record<string, string> = {
  '--color-model': '#f7f8fb',
  '--color-model-2': '#d9dce7',
  '--color-ink': '#1a1c20',
  '--color-ground': '#eceef4',
  '--color-signal': '#ff5a1f',
  '--color-blueprint': '#3350f0',
  '--color-pine': '#10a37c',
  '--color-ochre': '#f4a40b',
  '--color-plum': '#8a55e8',
  '--color-rose': '#ec4d86',
};

function token(name: string): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || FALLBACK[name] || '#888888';
}

function colour(target: THREE.Color, name: string): THREE.Color {
  // No convertSRGBToLinear here. The prototype targets three r128, where colour
  // management was off and the conversion had to be explicit. From r152
  // THREE.ColorManagement is enabled by default and Color.set() already
  // converts a CSS string from sRGB to working space — doing it again darkens
  // and over-saturates every colour in the scene.
  return target.set(token(name));
}

export function createPalette(): Palette {
  return {
    model: new THREE.Color(), model2: new THREE.Color(), ink: new THREE.Color(),
    ground: new THREE.Color(), signal: new THREE.Color(), blueprint: new THREE.Color(),
    pine: new THREE.Color(), ochre: new THREE.Color(), plum: new THREE.Color(),
    rose: new THREE.Color(), shadow: 0.22,
  };
}

/** Refills a palette in place — no allocation, safe to call on theme change. */
export function readPalette(P: Palette) {
  colour(P.model, '--color-model');
  colour(P.model2, '--color-model-2');
  colour(P.ink, '--color-ink');
  colour(P.ground, '--color-ground');
  // The 3D accent (pulses, the missing piece, pegs, the part that runs) is the
  // company blue, not signal orange (owner, 2026-09-29: "change the orange to
  // blue that denotes the company"). Resting parts sit at 80% of their hue, so
  // the accent at 100% blueprint still reads as the one to notice. The key keeps
  // its name so scene code is unchanged; signal orange now stays in the UI only
  // for warnings.
  colour(P.signal, '--color-blueprint');
  colour(P.blueprint, '--color-blueprint');
  colour(P.pine, '--color-pine');
  colour(P.ochre, '--color-ochre');
  colour(P.plum, '--color-plum');
  colour(P.rose, '--color-rose');
  // The dark theme needs a heavier contact shadow to read at all.
  P.shadow = document.documentElement.dataset.theme === 'dark'
    || (!document.documentElement.dataset.theme
        && window.matchMedia('(prefers-color-scheme: dark)').matches)
    ? 0.55 : 0.22;
  return P;
}
