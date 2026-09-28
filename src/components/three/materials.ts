import * as THREE from 'three';

/**
 * Palette → linear-space colours, created once and pooled.
 *
 * Nothing here may allocate per frame. `read()` fills a caller-owned Color
 * rather than returning a new one.
 */

export type HueKey = 'blueprint' | 'pine' | 'ochre' | 'plum' | 'rose' | 'signal' | 'model' | 'model2';

const HEX_LIGHT: Record<HueKey, string> = {
  blueprint: '#3350f0',
  pine: '#10a37c',
  ochre: '#f4a40b',
  plum: '#8a55e8',
  rose: '#ec4d86',
  signal: '#ff5a1f',
  model: '#f7f8fb',
  model2: '#d9dce7',
};

const HEX_DARK: Record<HueKey, string> = {
  blueprint: '#7d90ff',
  pine: '#3fd1a4',
  ochre: '#ffc24d',
  plum: '#b590ff',
  rose: '#ff7aa8',
  signal: '#ff7a45',
  model: '#a7acba',
  model2: '#636a7c',
};

/** Pooled. Never hand these out — copy from them. */
const pool = {
  light: {} as Record<HueKey, THREE.Color>,
  dark: {} as Record<HueKey, THREE.Color>,
};

for (const key of Object.keys(HEX_LIGHT) as HueKey[]) {
  pool.light[key] = new THREE.Color(HEX_LIGHT[key]).convertSRGBToLinear();
  pool.dark[key] = new THREE.Color(HEX_DARK[key]).convertSRGBToLinear();
}

export function readHue(target: THREE.Color, key: HueKey, dark: boolean): THREE.Color {
  return target.copy(dark ? pool.dark[key] : pool.light[key]);
}

/** One geometry, one material, for the life of the page. */
let geometry: THREE.BufferGeometry | null = null;
let material: THREE.Material | null = null;

export function sharedGeometry(): THREE.BufferGeometry {
  // A rounded box at 3px-equivalent radius (design.md §1.5) — approximated with
  // a lightly segmented box, which keeps the vertex count trivial at N=64.
  geometry ??= new THREE.BoxGeometry(1, 1, 1, 2, 2, 2);
  return geometry;
}

export function sharedMaterial(): THREE.Material {
  material ??= new THREE.MeshStandardMaterial({
    roughness: 0.62,
    metalness: 0.04,
    flatShading: false,
  });
  return material;
}
