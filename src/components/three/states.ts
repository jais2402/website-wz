import type { InstanceState, SceneKey, SceneState } from './types';

/**
 * One pure function per scene. No React, no side effects, no allocation beyond
 * the returned array — these run once per scene change, not per frame.
 *
 * N is fixed at 64. Every scene returns exactly N instances; an instance a
 * scene does not need is scaled to 0 rather than removed, so the
 * InstancedMesh never changes size and nothing is ever remounted.
 *
 * The model is a diagram (design.md §5). Each layout says something specific:
 * scattered parts for the workaround, a grid for the disciplines, a stack for
 * the architecture. It is never decoration.
 */

export const N = 64;

/** Deterministic pseudo-random, so the scene is identical on every load. */
function rand(seed: number): number {
  const x = Math.sin(seed * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

function blank(): InstanceState {
  return { x: 0, y: 0, z: 0, s: 0, rx: 0, ry: 0, hue: -1 };
}

function fill(build: (i: number) => InstanceState | null): InstanceState[] {
  const out: InstanceState[] = new Array(N);
  for (let i = 0; i < N; i += 1) out[i] = build(i) ?? blank();
  return out;
}

/** Scattered, misaligned, different sizes — the spreadsheets-and-threads state. */
function workarounds(): InstanceState[] {
  return fill((i) => {
    if (i >= 34) return null;
    return {
      x: (rand(i) - 0.5) * 5.6,
      y: (rand(i + 90) - 0.5) * 4.4,
      z: (rand(i + 180) - 0.5) * 2.2,
      s: 0.26 + rand(i + 270) * 0.42,
      rx: (rand(i + 360) - 0.5) * 0.9,
      ry: (rand(i + 450) - 0.5) * 1.2,
      // One signal piece only: the exception being fixed (design.md §5.2).
      hue: i === 7 ? 5 : -1,
    };
  });
}

/** An ordered grid — eight disciplines, each its own hue. */
function disciplines(): InstanceState[] {
  const cols = 4;
  return fill((i) => {
    if (i >= 32) return null;
    const col = i % cols;
    const row = Math.floor(i / cols);
    return {
      x: (col - (cols - 1) / 2) * 1.16,
      y: (3.5 - row) * 0.92,
      z: 0,
      s: 0.62,
      rx: 0,
      ry: 0,
      hue: row % 5,
    };
  });
}

/** A dense core with a light shell — intelligence inside the product. */
function intelligence(): InstanceState[] {
  return fill((i) => {
    if (i >= 40) return null;
    if (i < 8) {
      const a = (i / 8) * Math.PI * 2;
      return { x: Math.cos(a) * 0.5, y: Math.sin(a) * 0.5, z: 0, s: 0.5, rx: 0, ry: a, hue: 0 };
    }
    const a = ((i - 8) / 32) * Math.PI * 2;
    const r = 2.5 + rand(i) * 0.5;
    return {
      x: Math.cos(a) * r,
      y: Math.sin(a) * r * 0.66,
      z: (rand(i + 11) - 0.5) * 1.4,
      s: 0.3,
      rx: 0,
      ry: a,
      hue: -1,
    };
  });
}

/** Everything collapses into one aligned block — the single system. */
function onesystem(): InstanceState[] {
  return fill((i) => {
    if (i >= 27) return null;
    const x = i % 3;
    const y = Math.floor(i / 3) % 3;
    const z = Math.floor(i / 9);
    return {
      x: (x - 1) * 0.84,
      y: (y - 1) * 0.84,
      z: (z - 1) * 0.84,
      s: 0.78,
      rx: 0,
      ry: 0,
      hue: i === 13 ? 5 : -1,
    };
  });
}

/** Three stacked bands — simplify, scale, secure. */
function principles(): InstanceState[] {
  return fill((i) => {
    if (i >= 30) return null;
    const band = Math.floor(i / 10);
    const within = i % 10;
    return {
      x: (within - 4.5) * 0.56,
      y: (1 - band) * 1.5,
      z: 0,
      s: 0.5,
      rx: 0,
      ry: 0,
      hue: band,
    };
  });
}

/** A widening fan — the range from a small tool to a platform. */
function range(): InstanceState[] {
  return fill((i) => {
    if (i >= 36) return null;
    const step = Math.floor(i / 6);
    const within = i % 6;
    const spread = 0.4 + step * 0.34;
    return {
      x: (within - 2.5) * spread,
      y: (2.5 - step) * 0.92,
      z: 0,
      s: 0.34 + step * 0.06,
      rx: 0,
      ry: 0,
      hue: step % 5,
    };
  });
}

/** Four stages advancing left to right. */
function stages(): InstanceState[] {
  return fill((i) => {
    if (i >= 32) return null;
    const stage = Math.floor(i / 8);
    const within = i % 8;
    return {
      x: (stage - 1.5) * 1.5,
      y: (3.5 - within) * 0.44,
      z: 0,
      s: 0.42,
      rx: 0,
      ry: 0,
      hue: stage,
    };
  });
}

/** A measured column — scope, price and timeline agreed before the build. */
function price(): InstanceState[] {
  return fill((i) => {
    if (i >= 24) return null;
    const col = i % 3;
    const row = Math.floor(i / 3);
    return {
      x: (col - 1) * 1.0,
      y: (3.5 - row) * 0.66,
      z: 0,
      s: col === 1 ? 0.7 : 0.44,
      rx: 0,
      ry: 0,
      hue: col === 1 ? 0 : -1,
    };
  });
}

/** A long horizontal run — everything built since 2012, still running. */
function since2012(): InstanceState[] {
  return fill((i) => {
    if (i >= 48) return null;
    const row = Math.floor(i / 16);
    const col = i % 16;
    return {
      x: (col - 7.5) * 0.4,
      y: (1 - row) * 0.8,
      z: 0,
      s: 0.3,
      rx: 0,
      ry: 0,
      hue: i % 9 === 0 ? 1 : -1,
    };
  });
}

/** Four distinct clusters — the four case studies. */
function cases(): InstanceState[] {
  const centres = [
    [-1.7, 1.1],
    [1.7, 1.1],
    [-1.7, -1.1],
    [1.7, -1.1],
  ] as const;
  return fill((i) => {
    if (i >= 36) return null;
    const group = Math.floor(i / 9);
    const centre = centres[group]!;
    const within = i % 9;
    return {
      x: centre[0] + ((within % 3) - 1) * 0.46,
      y: centre[1] + (Math.floor(within / 3) - 1) * 0.46,
      z: 0,
      s: 0.42,
      rx: 0,
      ry: 0,
      hue: group,
    };
  });
}

/** A ring joined to a hub — systems connected to each other. */
function connected(): InstanceState[] {
  return fill((i) => {
    if (i >= 33) return null;
    if (i === 0) return { x: 0, y: 0, z: 0, s: 0.86, rx: 0, ry: 0, hue: 0 };
    const spoke = Math.floor((i - 1) / 4);
    const along = ((i - 1) % 4) + 1;
    const a = (spoke / 8) * Math.PI * 2;
    const r = along * 0.62;
    return {
      x: Math.cos(a) * r,
      y: Math.sin(a) * r,
      z: 0,
      s: 0.3,
      rx: 0,
      ry: a,
      hue: along === 4 ? spoke % 5 : -1,
    };
  });
}

/** Distinct layers stacked in depth — what a system is made of. */
function architecture(): InstanceState[] {
  return fill((i) => {
    if (i >= 45) return null;
    const layer = Math.floor(i / 9);
    const within = i % 9;
    return {
      x: ((within % 3) - 1) * 0.92,
      y: (2 - layer) * 0.78 + (Math.floor(within / 3) - 1) * 0.12,
      z: (Math.floor(within / 3) - 1) * 0.92,
      s: 0.56,
      rx: 0,
      ry: 0,
      hue: layer,
    };
  });
}

/** An open, even field — questions before you reach us. */
function questions(): InstanceState[] {
  return fill((i) => {
    if (i >= 28) return null;
    const col = i % 7;
    const row = Math.floor(i / 7);
    return {
      x: (col - 3) * 0.78,
      y: (1.5 - row) * 0.78,
      z: 0,
      s: 0.36,
      rx: 0,
      ry: 0,
      hue: -1,
    };
  });
}

/** A single piece, forward and alone — the start of a conversation. */
function start(): InstanceState[] {
  return fill((i) => {
    if (i === 0) return { x: 0, y: 0, z: 0.8, s: 1.15, rx: 0, ry: 0.5, hue: 5 };
    if (i >= 17) return null;
    const a = (i / 16) * Math.PI * 2;
    return {
      x: Math.cos(a) * 2.7,
      y: Math.sin(a) * 1.9,
      z: -0.6,
      s: 0.22,
      rx: 0,
      ry: 0,
      hue: -1,
    };
  });
}

const LAYOUTS: Record<SceneKey, () => InstanceState[]> = {
  workarounds,
  disciplines,
  intelligence,
  onesystem,
  principles,
  range,
  stages,
  price,
  since2012,
  cases,
  connected,
  architecture,
  questions,
  start,
};

/** Built once at module load — these never change, so never rebuild them. */
const CACHE = new Map<SceneKey, SceneState>();

/**
 * The stage is one half of the viewport, so the model is compressed
 * horizontally and pushed to the side opposite the reading column.
 *
 * design.md §5.4: the model never overlaps the reading column. At fov 34 and
 * z 9 the visible width is roughly 8.8 units on a 16:10 viewport, so a half is
 * ~2.2 either side of centre — hence the offset, and the squeeze that keeps the
 * widest layout inside it.
 */
const STAGE_OFFSET = 2.7;

/**
 * Half-width the model is allowed to occupy. The stage is half the viewport —
 * roughly 4.4 units at fov 34 / z 9 on a 16:10 screen. At offset 2.5 a half-width
 * of 1.45 puts the model's inner edge a full unit clear of the centre line, so it
 * cannot reach the reading column even at the extremes of the yaw drift.
 */
const MAX_HALF_WIDTH = 1.15;
const MAX_HALF_HEIGHT = 2.0;

/**
 * Fit a layout inside the stage.
 *
 * Layouts are written in whatever units read clearly (a fan, a grid, a run of
 * 16). Rather than hand-tuning each one and hoping, every layout is measured
 * once and scaled to fit. That makes "the model never overlaps the reading
 * column" (design.md §5.4) a property of the system, not of the author's care.
 */
function fitToStage(instances: InstanceState[]): InstanceState[] {
  // A unit cube's corner reaches s * sqrt(3)/2, not s/2 — and these rotate.
  const CORNER = 0.87;
  // Anything at positive z is nearer the camera and projects larger: at z 9 and
  // a local z of 1 that is about 1.13x. Measuring centres alone understates the
  // real extent, which is what let the model creep over the reading column.
  const PERSPECTIVE = 1.15;

  let maxX = 0;
  let maxY = 0;
  for (const i of instances) {
    if (i.s <= 0) continue;
    const reach = i.s * CORNER;
    maxX = Math.max(maxX, (Math.abs(i.x) + reach) * PERSPECTIVE);
    maxY = Math.max(maxY, (Math.abs(i.y) + reach) * PERSPECTIVE);
  }
  const scale = Math.min(
    maxX > 0 ? MAX_HALF_WIDTH / maxX : 1,
    maxY > 0 ? MAX_HALF_HEIGHT / maxY : 1,
    1,
  );
  if (scale >= 1) return instances;
  return instances.map((i) => ({
    ...i,
    x: i.x * scale,
    y: i.y * scale,
    z: i.z * scale,
    s: i.s * scale,
  }));
}

export function sceneState(key: SceneKey, side: 'l' | 'r' | 'c'): SceneState {
  let cached = CACHE.get(key);
  if (!cached) {
    cached = { instances: fitToStage((LAYOUTS[key] ?? workarounds)()), cameraX: 0 };
    CACHE.set(key, cached);
  }
  // Reading column left (side 'l') → model right, and the reverse.
  const cameraX = side === 'l' ? STAGE_OFFSET : side === 'r' ? -STAGE_OFFSET : 0;
  return { instances: cached.instances, cameraX };
}

export function isSceneKey(value: string | undefined): value is SceneKey {
  return !!value && value in LAYOUTS;
}
