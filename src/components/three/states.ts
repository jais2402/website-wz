import * as THREE from 'three';
import { CASES, DISC, DISC_HEIGHT, INT, PROC, RANGE, REGIONS, SCENES, TECH, type SceneKey } from './scene-data';
import type { Palette, PaletteColour } from './palette';
import { COUNTRY_HUE, COUNTRY_POINTS, project } from './world';

/**
 * The fifteen scene states, ported from the approved prototype.
 *
 * Each is a pure function of (time, sub-step, highlight) that fills a
 * preallocated state object. No allocation per call beyond label objects, and
 * no React. The model is a diagram: every layout says something specific.
 */

export const N = 64;
export const NP = 16;

export interface SceneState {
  p: THREE.Vector3[];
  s: THREE.Vector3[];
  r: THREE.Vector3[];
  c: THREE.Color[];
  hub: { p: THREE.Vector3; s: THREE.Vector3; on: number };
  pp: THREE.Vector3[];
  ps: number[];
  lines: { foot: number; frame: number; cage: number; slot: number };
  yaw: number;
  look: number;
  dist: number;
  scale: number;
  labels: Array<{ t: string; p: THREE.Vector3; hot: boolean; left: boolean }>;
  lab: number;
  /**
   * Label layout. 0: a column beside the model, with leader lines. 1: each
   * label sits just outside its own part, pushed away from the model's
   * centre — for radial arrangements, where a column would draw every leader
   * across the model.
   */
  beside: number;
  /** The world map's height, 0–1 (regions only). */
  map: number;
  name: string;
  parts: string;
}

export function blank(): SceneState {
  const o: SceneState = {
    p: [], s: [], r: [], c: [],
    hub: { p: new THREE.Vector3(), s: new THREE.Vector3(1, 1, 1), on: 0 },
    pp: [], ps: [],
    lines: { foot: 0, frame: 0, cage: 0, slot: 0 },
    yaw: 0, look: 1, dist: 15, scale: 1,
    labels: [], lab: 0, beside: 0, map: 0, name: '', parts: '',
  };
  for (let i = 0; i < N; i += 1) {
    o.p.push(new THREE.Vector3());
    o.s.push(new THREE.Vector3());
    o.r.push(new THREE.Vector3());
    o.c.push(new THREE.Color());
  }
  for (let i = 0; i < NP; i += 1) { o.pp.push(new THREE.Vector3()); o.ps.push(0); }
  return o;
}

/* Seeded randomness — the scene is identical on every load. */
let seed = 11;
function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
const R: number[][] = [];
for (let i = 0; i < N; i += 1) R.push([rnd(), rnd(), rnd(), rnd(), rnd(), rnd()]);
const HOME: THREE.Vector3[] = [];
for (let i = 0; i < N; i += 1) HOME.push(new THREE.Vector3((R[i]![0]! - 0.5) * 3, 0, (R[i]![1]! - 0.5) * 3));

export function smooth(x: number) { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); }
function ease(x: number) { x = Math.min(1, Math.max(0, x)); return 1 - Math.pow(1 - x, 3); }

/** Labels appear only where the page invites you to point at something. */
// Build dropped its callout column on 2026-09-28: its eight labels fanned out
// with crossing leader lines, and the two-column list now carries each hue as a
// swatch, so the list is the legend.
const LABELLED: Partial<Record<SceneKey, 1>> = { range: 1, integration: 1, tech: 1 };

export const SCENE_TITLE: Record<SceneKey, string> = {
  hero: 'Workarounds', build: 'Eight disciplines', ai: 'Intelligence inside',
  moment: 'One system', principles: 'Simplify, scale, secure', range: 'The range',
  how: 'Understand to run', price: 'How we price', evidence: 'Built since 2012',
  work: 'Selected work', integration: 'Connected tools', tech: 'Architecture',
  faq: 'Questions', contact: 'Start a conversation',
  regions: 'Where we work',
};

export function buildState(P: Palette) {
  /**
   * Colour. The owner asked for the design colours on the blocks, with less
   * pastel and less white (2026-09-29). That followed "bright" (same day),
   * "pastel" (2026-09-28), and the prototype's near-white.
   *
   * Every hue share a scene asks for maps through s → min(0.8, 0.5 + 1.2·s).
   * A resting part shows 80% of its brand hue (owner, 2026-09-29: "reduce the
   * color little bit down so that it is 80%"). A part dimmed because the
   * reader points at another keeps about 62% (0.1 → 62%). The part pointed at
   * goes to 100%, so it stands above the 80% rest. Parts are no longer filled with the white model
   * material; each takes a brand hue. Attention now comes mostly from the lift
   * and the label of the part pointed at, not from draining the others to
   * white. See design.md §5.1.
   */
  const REST_FLOOR = 0.5;
  const REST_GAIN = 1.2;
  const REST_CAP = 0.8;
  const restShare = (share: number) => Math.min(REST_CAP, REST_FLOOR + share * REST_GAIN);

  // Signal is NOT in the resting rotation. It is the scarcity token — one per
  // screen, placed on purpose — and lifting the rest colours would otherwise
  // spread orange across every scene that cycles hues.
  const MIX = ['blueprint', 'pine', 'ochre', 'plum', 'rose'] as const;
  const hueOf = (h: string): THREE.Color => P[h as PaletteColour] ?? P.blueprint;
  /** `k` is how far toward the model material; the hue share is 1 − k. */
  const dimmed = (c: THREE.Color, k: number) => c.clone().lerp(P.model, 1 - restShare(1 - k));
  /** `k` is the hue share. */
  const tint = (i: number, k: number) =>
    P[MIX[i % MIX.length]!].clone().lerp(P.model, 1 - restShare(k));

  function put(o: SceneState, i: number, x: number, y: number, z: number,
               sx: number, sy: number, sz: number, c: THREE.Color,
               ry?: number, rx?: number, rz?: number) {
    o.p[i]!.set(x, y, z); o.s[i]!.set(sx, sy, sz); o.c[i]!.copy(c);
    o.r[i]!.set(rx ?? 0, ry ?? 0, rz ?? 0);
  }
  function hideFrom(o: SceneState, k: number) {
    for (let i = k; i < N; i += 1) {
      o.p[i]!.copy(HOME[i]!); o.s[i]!.set(1e-4, 1e-4, 1e-4);
      o.c[i]!.copy(P.model); o.r[i]!.set(0, 0, 0);
    }
  }
  function label(o: SceneState, t: string, x: number, y: number, z: number, hot?: boolean, left?: boolean) {
    if (!o.lab) return;
    o.labels.push({ t, p: new THREE.Vector3(x, y, z), hot: !!hot, left: !!left });
  }
  /** The 3x3x3 block: one system, twenty-seven modules. */
  function monolith(o: SceneState, skip: boolean) {
    let k = 0;
    for (let gy = 0; gy < 3; gy += 1) for (let gz = 0; gz < 3; gz += 1) for (let gx = 0; gx < 3; gx += 1) {
      const corner = gx === 2 && gy === 2 && gz === 2;
      if (corner && skip) {
        o.p[k]!.set(0.84, 3, 0.84); o.s[k]!.set(1e-4, 1e-4, 1e-4);
        o.c[k]!.copy(P.model); o.r[k]!.set(0, 0, 0); k += 1; continue;
      }
      put(o, k, (gx - 1) * 0.84, 0.42 + gy * 0.84, (gz - 1) * 0.84, 0.8, 0.8, 0.8,
        corner ? P.signal : tint(gx * 3 + gy + gz * 2, 0.6));
      k += 1;
    }
    return k;
  }

  return function state(ix: number, t: number, sub: number, hl: number, o: SceneState) {
    const keyName = SCENES[ix]!;
    o.labels.length = 0;
    o.lab = LABELLED[keyName] ? 1 : 0;
    o.beside = 0;
    o.map = 0;
    o.hub.on = 0; o.hub.p.set(0, 0.5, 0); o.hub.s.set(1, 1, 1);
    o.lines.foot = o.lines.frame = o.lines.cage = o.lines.slot = 0;
    for (let j = 0; j < NP; j += 1) { o.ps[j] = 0; o.pp[j]!.set(0, 0, 0); }
    o.yaw = 0; o.look = 1; o.dist = 15; o.scale = 1;
    o.name = SCENE_TITLE[keyName]; o.parts = '';
    let k = 0; let i: number; let a: number; let j: number;

    switch (keyName) {
      case 'hero': {
        // Loose parts: stacked sheets, a detached block, tilted plates, scatter.
        for (i = 0; i < 7; i += 1)
          put(o, k++, -1.15 + (R[i]![0]! - 0.5) * 0.18, 0.03 + i * 0.066, 0.25 + (R[i]![1]! - 0.5) * 0.16,
            1.36, 0.05, 0.96, tint(i, 0.55), (R[i]![2]! - 0.5) * 0.42);
        put(o, k++, 1.25, 0.36, -0.55, 0.92, 0.72, 0.72, tint(3, 0.8), 0.32);
        for (i = 0; i < 3; i += 1)
          put(o, k++, 0.52 + i * 0.05, 0.5, -0.2 + i * 0.1, 1.2, 0.05, 0.9, tint(i + 4, 0.55), 0.32, 0, 0.62);
        const scat: Array<[number, number]> = [[2.1, 0.6], [1.5, -1.8], [-2.0, -1.3], [0.3, 1.9], [-1.9, 1.5], [2.3, 1.6]];
        scat.forEach((q, n) => {
          const s = 0.34 + R[k]![3]! * 0.42;
          put(o, k++, q[0], s / 2, q[1], s, s * (0.7 + R[k]![4]! * 0.6), s, tint(n, 0.88), R[k]![2]! * 3);
        });
        label(o, 'Spreadsheets', -1.1, 0.5, 0.75);
        label(o, 'Messages and manual steps', 1.25, 1.05, -0.55);
        o.look = 0.5; o.dist = 16.5; o.yaw = 0.2 + Math.sin(t * 0.08) * 0.05;
        o.parts = `${k} loose parts`;
        break;
      }

      case 'build': {
        for (i = 0; i < 8; i += 1) {
          const cx = ((i % 4) - 1.5) * 1.55, cz = (Math.floor(i / 4) - 0.5) * 1.62, h = DISC_HEIGHT[i]!;
          const lift = hl === i ? 0.38 : 0;
          const full = hueOf(DISC[i]?.hue ?? 'blueprint');
          const cc = hl === i ? full : dimmed(full, hl >= 0 ? 0.9 : 0.55);
          put(o, k++, cx, h / 2 + lift, cz, 1.16, h, 1.16, cc);
          label(o, DISC[i]?.short ?? '', cx, h + lift + 0.12, cz, hl === i);
        }
        o.look = 0.75; o.dist = 16.5; o.yaw = -0.18; o.parts = '8 modules';
        break;
      }

      case 'ai': {
        // Work flows through the model; exceptions divert to a person.
        o.hub.on = 1; o.hub.p.set(0, 0.95, 0); o.hub.s.set(0.9, 1.9, 1.8);
        for (i = 0; i < 20; i += 1) {
          const u = (i / 20 + t * 0.028) % 1;
          const x = -5 + u * 10;
          let sz = 0.44, z: number, ry: number, c2: THREE.Color;
          if (x < 0) { z = (R[i]![0]! - 0.5) * 1.0; ry = (R[i]![1]! - 0.5) * 1.3; c2 = tint(i, 0.35); }
          else if (i % 6 === 0) { z = 1.3; ry = 0; c2 = P.ochre; }
          else { z = 0; ry = 0; c2 = P.blueprint; }
          sz *= smooth((Math.abs(x) - 0.45) / 0.35);
          put(o, k++, x, sz / 2, z, sz, sz, sz, c2, ry);
        }
        label(o, 'Repeated judgement', -3.8, 0.75, 0);
        label(o, 'Model', 0, 2.1, 0, true);
        label(o, 'Handled', 3.8, 0.75, 0);
        label(o, 'Exceptions to a person', 3.6, 0.75, 1.3);
        o.look = 0.4; o.dist = 22; o.yaw = -0.12; o.parts = 'Model and a person';
        break;
      }

      case 'moment': case 'faq': {
        k = monolith(o, false);
        if (keyName === 'faq') {
          for (j = 0; j < 3; j += 1) {
            o.pp[j]!.set((j - 1) * 0.84, 2.62, -0.84 + j * 0.84);
            o.ps[j] = 0.07 * (0.6 + 0.4 * Math.sin(t * 2.4 + j * 2));
          }
          o.parts = '27 modules, running';
        } else o.parts = '27 modules, one system';
        // A bounded sway, not a spin. The prototype used t * 0.045, which
        // accumulates without limit — after a minute the block had turned
        // ~160°, and blending into the next scene whipped it round.
        // design.md §5.5 asks for slow yaw and sub-degree drift.
        o.look = 1.2; o.dist = keyName === 'moment' ? 20 : 16;
        o.yaw = 0.35 + Math.sin(t * 0.12) * 0.12;
        break;
      }

      case 'principles': {
        // It grows, then a cage closes around it.
        const grow = smooth((sub - 0.75) / 0.5), sec = smooth((sub - 1.75) / 0.5);
        for (let gy2 = 0; gy2 < 4; gy2 += 1) for (let gz2 = 0; gz2 < 2; gz2 += 1) for (let gx2 = 0; gx2 < 2; gx2 += 1) {
          const up = gy2 >= 2, g = up ? grow : 1;
          const c3 = up ? dimmed(P.blueprint, 0.25 + sec * 0.25) : P.pine.clone().lerp(P.model, 1 - REST_CAP);
          // The new layers GROW UP out of the top of the base (owner,
          // 2026-09-28: "start from the bottom"). The prototype dropped them in
          // from 1.6 above; here each starts inside the top base layer and
          // rises into place as it scales up — the building grows upward.
          const y = 0.6 + gy2 * 1.26 - (up ? (gy2 - 1) * 1.26 * (1 - g) : 0);
          put(o, k++, (gx2 - 0.5) * 1.24, y, (gz2 - 0.5) * 1.24,
            1.18 * Math.max(g, 1e-4), 1.18 * Math.max(g, 1e-4), 1.18 * Math.max(g, 1e-4), c3);
        }
        o.lines.cage = sec;
        const pn = (PROC.length ? ['Simplify', 'Scale', 'Secure'] : ['Simplify', 'Scale', 'Secure'])[Math.min(2, Math.floor(sub))]!;
        label(o, pn, 1.36, 2.6 + grow * 2.6, 1.36, true);
        o.name = pn;
        o.parts = grow > 0.5 ? (sec > 0.5 ? '16 modules, secured' : '16 modules') : '8 modules';
        o.look = 1.2 + grow * 1.45; o.dist = 15.5 + grow * 5.5; o.yaw = -0.1;
        break;
      }

      case 'range': {
        for (let row = 0; row < 5; row += 1) {
          const rc = hueOf(RANGE[row]?.hue ?? 'blueprint');
          for (let cl = 0; cl < 6; cl += 1) {
            const lf = hl === row ? 0.34 : 0;
            const c4 = hl === row ? rc : dimmed(rc, hl >= 0 ? 0.9 : 0.8);
            put(o, k++, (cl - 2.5) * 0.78,
              0.3 + lf + (hl === row ? Math.sin(t * 3 + cl * 0.7) * 0.04 : 0),
              (row - 2) * 0.9, 0.6, 0.6, 0.6, c4);
          }
          // The label follows the row's LIFT. The prototype anchored it at a
          // fixed y of 0.3, so when a row rose to show it was selected, its dot
          // stayed behind and pointed at the row underneath. x sits on the
          // right face of the last cube: (5 - 2.5) * 0.78 + 0.3 = 2.25.
          const rowLift = hl === row ? 0.34 : 0;
          label(o, RANGE[row]?.title ?? '', 2.26, 0.3 + rowLift, (row - 2) * 0.9, hl === row);
        }
        o.look = 0.3; o.dist = 16.5; o.yaw = 0.74; o.scale = 0.74; o.parts = '30 systems in 5 areas';
        break;
      }

      case 'how': {
        // The build itself: footprint drawn, frame raised, modules placed, pegs
        // pulled, then it runs.
        const st = Math.min(3, Math.floor(sub));
        o.lines.foot = sub < 1 ? smooth(sub / 0.35) : (sub < 3 ? 0.4 : 0.4 * (1 - smooth((sub - 3) / 0.4)));
        o.lines.frame = sub < 1 ? 0 : (sub < 2 ? smooth((sub - 1) / 0.35)
          : (sub < 3 ? 1 - 0.55 * smooth((sub - 2) / 0.6) : 0.45 * (1 - smooth((sub - 3) / 0.4))));
        const f = Math.min(27, Math.max(0, (sub - 2) * 30));
        for (let by = 0; by < 3; by += 1) for (let bz = 0; bz < 3; bz += 1) for (let bx = 0; bx < 3; bx += 1) {
          const loc = ease(f - k);
          const run = sub >= 3 && (k === 4 || k === 13 || k === 22);
          // Each module rises out of the footprint into its place (owner,
          // 2026-09-28: "start from the bottom"). The prototype dropped them in
          // from 2.4 above. Order is unchanged — k runs bottom layer first — so
          // the block now assembles upward from the ground.
          const home = 0.42 + by * 0.84;
          put(o, k, (bx - 1) * 0.84, home * loc, (bz - 1) * 0.84,
            0.8 * Math.max(loc, 1e-4), 0.8 * Math.max(loc, 1e-4), 0.8 * Math.max(loc, 1e-4),
            run ? P.signal : tint(bx * 3 + by + bz * 2, 0.6));
          k += 1;
        }
        const peg = 1 - smooth((sub - 1.6) / 0.4);
        ([[-1.4, -1.4], [1.4, -1.4], [1.4, 1.4], [-1.4, 1.4]] as Array<[number, number]>).forEach((q) => {
          put(o, k++, q[0], 0.16 * peg, q[1], 0.1 * Math.max(peg, 1e-4), 0.32 * Math.max(peg, 1e-4), 0.1 * Math.max(peg, 1e-4), P.signal);
        });
        if (sub >= 3) for (j = 0; j < 3; j += 1) {
          o.pp[j]!.set((j - 1) * 0.84, 2.62, -0.84 + j * 0.84);
          o.ps[j] = 0.07 * smooth((sub - 3) / 0.3) * (0.6 + 0.4 * Math.sin(t * 2.4 + j * 2));
        }
        label(o, PROC[st]?.output ?? '', 1.3, 2.75, 1.3, true);
        o.name = PROC[st]?.title ?? ''; o.parts = `Stage ${st + 1} of 4`;
        // The camera aims higher while only the footprint is on the ground, so
        // the base sits lower in the frame (owner, 2026-09-29: "the base has
        // to start a little bit below"). It eases down as the block rises,
        // and the finished block ends lower than before (1.25, was 1.0).
        o.look = 1.85 - 0.6 * smooth((sub - 1.8) / 1.2); o.dist = 16; o.yaw = -0.08;
        break;
      }

      case 'price': {
        k = monolith(o, false);
        o.lines.frame = 0.6; o.lines.foot = 0.4;
        o.look = 1.0; o.dist = 16.8; o.yaw = 0.3 + Math.sin(t * 0.09) * 0.04;
        o.parts = 'Scope, price, timeline';
        break;
      }

      case 'evidence': {
        let tall = 0, tallIx = 0;
        for (i = 0; i < 20; i += 1) {
          const ex = ((i % 5) - 2) * 1.02, ez = (Math.floor(i / 5) - 1.5) * 1.02;
          let th = 0.45 + Math.pow(R[i]![2]!, 1.6) * 2.4;
          if (i === 7) th = 2.9;
          if (th > tall) { tall = th; tallIx = i; }
          put(o, k++, ex, th / 2, ez, 0.78, th, 0.78,
            i === 7 ? P.signal : tint(i, 0.6));
        }
        label(o, '20+ systems since 2012', ((tallIx % 5) - 2) * 1.02, tall + 0.15, (Math.floor(tallIx / 5) - 1.5) * 1.02, true);
        // Bounded, as above. Was 0.4 + t * 0.025.
        o.look = 0.9; o.dist = 19.5; o.yaw = 0.4 + Math.sin(t * 0.1) * 0.1;
        o.scale = 0.9; o.parts = '20+ systems';
        break;
      }

      case 'work': {
        // Four cases on a carousel; the active one turns to face you.
        const act = Math.min(3, Math.floor(sub)), fr = sub - act;
        const turn = act + (act < 3 ? smooth((fr - 0.72) / 0.28) : 0);
        for (let cs2 = 0; cs2 < 4; cs2 += 1) {
          a = Math.PI / 4 + cs2 * Math.PI / 2;
          const px = Math.sin(a) * 1.5, pz = Math.cos(a) * 1.5;
          const on = cs2 === act, lift2 = on ? 0.2 : 0;
          const hc = hueOf(CASES[cs2]?.hue ?? 'blueprint');
          const mc = on ? hc : dimmed(hc, 0.6);
          put(o, k++, px, 0.08 + lift2, pz, 1.7, 0.16, 1.7, hc.clone().lerp(P.model, on ? 0 : 0.28), -a);
          const top = 0.16 + lift2;
          const ca = Math.cos(-a), sa = Math.sin(-a);
          const place = (lx: number, ly: number, lz: number, sx: number, sy: number, sz: number) => {
            put(o, k++, px + lx * ca + lz * sa, top + ly, pz - lx * sa + lz * ca, sx, sy, sz, mc, -a);
          };
          if (cs2 === 0) { place(0, 0.14, -0.42, 1.3, 0.28, 0.32); place(0, 0.14, 0, 1.3, 0.28, 0.32); place(0, 0.14, 0.42, 1.3, 0.28, 0.32); }
          else if (cs2 === 1) { for (j = 0; j < 6; j += 1) place(((j % 3) - 1) * 0.44, 0.18 + Math.floor(j / 3) * 0.4, 0, 0.36, 0.36, 0.36); }
          else if (cs2 === 2) { place(0, 0.25, 0, 0.9, 0.5, 0.9); place(0, 0.75, 0, 0.66, 0.5, 0.66); place(0, 1.25, 0, 0.44, 0.5, 0.44); }
          else { for (j = 0; j < 9; j += 1) place(((j % 3) - 1) * 0.42, 0.14, (Math.floor(j / 3) - 1) * 0.42, 0.28, 0.28, 0.28); }
          if (on) label(o, `${CASES[cs2]?.region ?? ''} · ${CASES[cs2]?.sector ?? ''}`, px, top + 1.55, pz, true);
        }
        o.yaw = -turn * Math.PI / 2; o.look = 0.55; o.dist = 14;
        o.name = CASES[act]?.sector ?? ''; o.parts = `Case ${act + 1} of 4`;
        break;
      }

      case 'integration': {
        // A hub with five connected groups; pulses travel the connectors.
        o.hub.on = 1; o.hub.p.set(0, 0.56, 0); o.hub.s.set(1.12, 1.12, 1.12);
        for (let g5 = 0; g5 < 5; g5 += 1) {
          a = (g5 / 5) * Math.PI * 2 + 0.4;
          const r3 = 2.7, sx5 = Math.sin(a) * r3, sz5 = Math.cos(a) * r3;
          const gcf = hueOf(INT[g5]?.hue ?? 'blueprint');
          const gc = hl === g5 ? gcf : dimmed(gcf, hl >= 0 ? 0.85 : 0.42);
          const ul = hl === g5 ? 0.25 : 0;
          put(o, k++, sx5, 0.35 + ul, sz5, 0.7, 0.7, 0.7, gc, -a);
          put(o, k++, sx5 + Math.cos(a) * 0.55, 0.19 + ul, sz5 - Math.sin(a) * 0.55, 0.38, 0.38, 0.38, gc, -a);
          put(o, k++, sx5, 0.89 + ul, sz5, 0.38, 0.38, 0.38, gc, -a);
          const pl = r3 - 0.56 - 0.35;
          put(o, k++, Math.sin(a) * (0.56 + pl / 2), 0.1, Math.cos(a) * (0.56 + pl / 2), pl, 0.07, 0.07, P.model2, a - Math.PI / 2);
          for (j = 0; j < 2; j += 1) {
            const q = (t * 0.32 + j * 0.5 + g5 * 0.13) % 1, d2 = 0.56 + q * pl;
            o.pp[g5 * 2 + j]!.set(Math.sin(a) * d2, 0.1, Math.cos(a) * d2);
            o.ps[g5 * 2 + j] = 0.075;
          }
          // Anchored just outboard of the group, so the label sits beside it.
          const ro = r3 + 0.62;
          label(o, INT[g5]?.title ?? '', Math.sin(a) * ro, 0.25 + ul, Math.cos(a) * ro, hl === g5);
        }
        // Bounded, as above. Was t * 0.03. The pulses travelling the
        // connectors already carry the motion; the hub does not need to turn.
        o.beside = 1;
        o.look = 0.4; o.dist = 16.5; o.yaw = 0.3 + Math.sin(t * 0.1) * 0.12;
        o.parts = '5 connected groups';
        break;
      }

      case 'tech': {
        // The nine layers the section names, top to bottom, as an exploded
        // stack: thin plates with air between them, so each reads as a layer
        // and carries its label. The one the reader points at slides out in
        // full hue.
        const n = Math.max(1, Math.min(9, TECH.length || 9));
        for (i = 0; i < n; i += 1) {
          const ly2 = 0.12 + (n - 1 - i) * 0.46, sl = hl === i ? 0.7 : 0;
          const lc = hl === i ? hueOf(MIX[i % MIX.length]!) : tint(i, hl >= 0 ? 0.12 : 0.62);
          put(o, k++, sl, ly2, 0, 2.4, 0.2, 2.4, lc);
          label(o, TECH[i] ?? '', sl + 1.2, ly2, 1.2, hl === i);
        }
        o.look = 1.9; o.dist = 19; o.yaw = -0.32; o.parts = `${n} layers`;
        break;
      }

      case 'regions': {
        // The countries served, each a block standing on a world map. The
        // land is a separate low-relief tile layer (stage.ts, `o.map`). The
        // markers share one height on purpose: different heights on a map
        // read as a quantity per country, and there is none to show.
        // Pointing at a name in the list lifts its block.
        o.map = 1;
        REGIONS.forEach((name, n) => {
          const pt = COUNTRY_POINTS[name];
          if (!pt) return;
          const [x, z] = project(pt[0], pt[1]);
          const up = hl === n ? 0.35 : 0;
          const hue = COUNTRY_HUE[name] ?? MIX[n % MIX.length]!;
          const c = hl === n ? hueOf(hue) : hueOf(hue).clone().lerp(P.model, hl >= 0 ? 0.38 : 1 - REST_CAP);
          put(o, k++, x, 0.02 + (0.62 + up) / 2, z, 0.12, 0.62 + up, 0.12, c);
        });
        o.look = 0.2; o.dist = 16; o.yaw = 0.74 + Math.sin(t * 0.1) * 0.04;
        o.parts = `${REGIONS.length} countries`;
        break;
      }

      case 'contact': {
        // One piece missing, hovering, and the slot it belongs in.
        k = monolith(o, true);
        const bob = Math.sin(t * 0.9) * 0.04;
        put(o, k++, 1.6, 3.0 + bob, 1.6, 0.8, 0.8, 0.8, P.signal, 0.35, 0, 0);
        o.lines.slot = 0.75;
        o.look = 1.45; o.dist = 16; o.yaw = 0.05; o.parts = 'One piece missing';
        break;
      }
    }
    hideFrom(o, k);
    return o;
  };
}
