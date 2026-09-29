import * as THREE from 'three';
import { createPalette, readPalette } from './palette';
import { lineSegmentPositions, roundedBox } from './geometry';
import { N, NP, blank, buildState, smooth, type SceneState } from './states';
import { BOOST, SCENES, SCENE_ALIAS } from './scene-data';
import { CELL, LAND_CELLS } from './world';

/**
 * The stage: renderer, model, camera and the per-frame blend.
 *
 * Ported from the approved prototype, which is plain three.js. Kept imperative
 * on purpose — the scene is one object mutated every frame, and expressing that
 * declaratively would fight both the design and the no-allocation rule.
 *
 * Nothing here allocates per frame. All scratch objects are created at mount.
 */

export interface StageHandle {
  destroy(): void;
  /** Wake the loop — scroll, pointer, theme change. */
  poke(): void;
  setPaused(paused: boolean): void;
  setHighlight(scene: string, index: number): void;
}

const LABEL_COUNT = 12;

/** Signed difference b − a, wrapped to (−π, π] so rotation takes the short way. */
function shortestAngle(a: number, b: number): number {
  const TAU = Math.PI * 2;
  let d = (b - a) % TAU;
  if (d > Math.PI) d -= TAU;
  else if (d <= -Math.PI) d += TAU;
  return d;
}

/* Colour mixing in OKLab (Björn Ottosson). Inputs and output are linear-sRGB
   THREE.Colors, as the renderer holds them. */
function toOk(c: THREE.Color, o: number[]) {
  const l = Math.cbrt(0.4122214708 * c.r + 0.5363325363 * c.g + 0.0514459929 * c.b);
  const m = Math.cbrt(0.2119034982 * c.r + 0.6806995451 * c.g + 0.1073969566 * c.b);
  const s2 = Math.cbrt(0.0883024619 * c.r + 0.2817188376 * c.g + 0.6299787005 * c.b);
  o[0] = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s2;
  o[1] = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s2;
  o[2] = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s2;
}
function fromOk(L: number, A: number, B: number, out: THREE.Color) {
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s2 = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  return out.setRGB(
    Math.max(0, 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s2),
    Math.max(0, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s2),
    Math.max(0, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s2),
  );
}

export function createStage(canvas: HTMLCanvasElement, callouts: HTMLElement, leads: SVGElement): StageHandle | null {
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Declared first: applyPalette() and resize() both poke during setup, and a
  // `let` further down would be in its temporal dead zone at that point.
  let lastPoke = 0;
  function poke() { lastPoke = performance.now(); }

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch {
    return null;
  }
  if (!renderer.getContext()) return null;

  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  // PBR Neutral, not ACES. ACES pulls bright saturated colours toward white,
  // which is what made the brand hues read as pastel even at 100% (owner,
  // 2026-09-29: "make the colours pop out more"). Neutral keeps hue and
  // saturation and only compresses the very top of the range.
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 0.92;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 120);

  // Intensities are the prototype's, multiplied by PI.
  //
  // The prototype targets three r128, where `useLegacyLights` was true and
  // ambient/hemisphere/directional irradiance was not divided by PI. That
  // default flipped in r155 and the option was removed, so the same numbers
  // render roughly a third as bright — which is why a direct port came out
  // dark and over-saturated instead of pale.
  const LEGACY_LIGHT_SCALE = Math.PI;

  const hemi = new THREE.HemisphereLight(0xffffff, 0xb8bab4, 0.72 * LEGACY_LIGHT_SCALE);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffffff, 1.25 * LEGACY_LIGHT_SCALE);
  key.position.set(7, 13, 6);
  key.castShadow = true;
  key.shadow.camera.left = -8; key.shadow.camera.right = 8;
  key.shadow.camera.top = 8; key.shadow.camera.bottom = -8;
  key.shadow.camera.near = 1; key.shadow.camera.far = 40;
  key.shadow.bias = -0.0006; key.shadow.normalBias = 0.02;
  scene.add(key, key.target);
  const fill = new THREE.DirectionalLight(0xffffff, 0.32 * LEGACY_LIGHT_SCALE);
  fill.position.set(-8, 4, 5);
  scene.add(fill);

  const groundMat = new THREE.ShadowMaterial({ opacity: 0.2 });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const group = new THREE.Group();
  scene.add(group);

  /* ── the model ─────────────────────────────────────── */
  const boxGeo = roundedBox(0.15, 4);
  const mat = new THREE.MeshStandardMaterial({ roughness: 0.82, metalness: 0 });
  const parts = new THREE.InstancedMesh(boxGeo, mat, N);
  parts.castShadow = true; parts.receiveShadow = true;
  parts.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  group.add(parts);

  const hubMat = new THREE.MeshStandardMaterial({ roughness: 0.7, metalness: 0 });
  const hub = new THREE.Mesh(roundedBox(0.16, 4), hubMat);
  hub.castShadow = true; hub.receiveShadow = true;
  group.add(hub);

  const pulseMat = new THREE.MeshBasicMaterial({ toneMapped: false });
  const pulses = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 14, 10), pulseMat, NP);
  pulses.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  group.add(pulses);

  function lineObj(segs: number[]) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(segs, 3));
    const m = new THREE.LineBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
    const l = new THREE.LineSegments(g, m);
    group.add(l);
    return l;
  }
  const segs = lineSegmentPositions();
  const foot = lineObj(segs.foot);
  const lattice = lineObj(segs.frame);
  const cage = lineObj(segs.cage);
  const slot = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(0.8, 0.8, 0.8)),
    new THREE.LineBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
  );
  slot.position.set(0.84, 0.42 + 1.68, 0.84);
  group.add(slot);
  const LINES = { foot, frame: lattice, cage, slot } as const;

  // The world map for the regions scene: one low tile per 5° land cell. It
  // rises out of the ground as the scene arrives (y-scale follows o.map) and
  // is hidden the rest of the time.
  const mapMat = new THREE.MeshStandardMaterial({ roughness: 0.9, metalness: 0 });
  const mapTiles = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), mapMat, LAND_CELLS.length);
  mapTiles.receiveShadow = true;
  {
    const tile = new THREE.Object3D();
    LAND_CELLS.forEach(([x, z], i) => {
      tile.position.set(x, 0.04, z);
      tile.scale.set(CELL * 0.8, 0.08, CELL * 0.8); tile.updateMatrix();
      mapTiles.setMatrixAt(i, tile.matrix);
    });
  }
  const mapGroup = new THREE.Group();
  mapGroup.add(mapTiles);
  mapGroup.visible = false;
  group.add(mapGroup);
  let mapCur = 0;

  /* ── palette ───────────────────────────────────────── */
  const P = readPalette(createPalette());
  function applyPalette() {
    readPalette(P);
    groundMat.opacity = P.shadow;
    hemi.groundColor.copy(P.ground);
    foot.material.color.copy(P.signal);
    lattice.material.color.copy(P.blueprint);
    cage.material.color.copy(P.pine);
    slot.material.color.copy(P.signal);
    pulseMat.color.copy(P.signal);
    state = buildState(P);
    poke();
  }
  let state = buildState(P);
  applyPalette();

  const themeObserver = new MutationObserver(applyPalette);
  themeObserver.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  const darkMq = window.matchMedia('(prefers-color-scheme: dark)');
  darkMq.addEventListener('change', applyPalette);

  /* ── page measurement ──────────────────────────────── */
  const SCI: Record<string, number> = {};
  SCENES.forEach((s, i) => { SCI[s] = i; });

  interface Anchor {
    top: number; h: number; sc: number;
    steps: Array<{ top: number; h: number }>;
    side: string; tl: number; tr: number; ox: number; oy: number; ss: number;
  }

  let W = 1, Hh = 1, mobile = false;
  let anchors: Anchor[] = [];
  const GUT: number[] = [];

  // The widest label in a scene decides how much room its annotation column needs.
  {
    const tmp = blank();
    for (let i = 0; i < SCENES.length; i += 1) {
      state(i, 0, 0, -1, tmp);
      let mw = 0;
      for (const l of tmp.labels) mw = Math.max(mw, l.t.length);
      GUT.push(mw && !tmp.beside ? Math.min(250, mw * 6.5 + 44) : 0);
    }
  }

  const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-scene]'));

  function measure() {
    const y0 = window.scrollY || window.pageYOffset;
    anchors = sections.map((s) => {
      const r = s.getBoundingClientRect();
      const steps = Array.from(s.querySelectorAll<HTMLElement>('[data-step]')).map((e) => {
        const b = e.getBoundingClientRect();
        return { top: b.top + y0, h: b.height };
      });
      const side = s.getAttribute('data-side') ?? 'l';
      const bodyEl = s.querySelector<HTMLElement>('[data-body]') ?? s.firstElementChild as HTMLElement;
      const bd = bodyEl.getBoundingClientRect();
      let tl = bd.left - 12, tr = bd.right + 12, ox = 0, oy = 0;
      const raw = s.getAttribute('data-scene') ?? 'workarounds';
      const sceneKey = SCENE_ALIAS[raw] ?? 'hero';
      let gu = mobile ? 0 : (GUT[SCI[sceneKey] ?? 0] ?? 0);
      if (!mobile) {
        if (side === 'l') ox = -(((tr + W - gu) / 2) - W / 2);
        else if (side === 'r') ox = W / 2 - (tl + gu) / 2;
        // A centred chapter: the model sits below the headline. The prototype
        // used -0.34 because the hook also carried three proof figures and a
        // CTA; with those removed the model landed at ~84% of the viewport and
        // was cut off by the fold. -0.13 (owner, 2026-09-28: "move the 3D up")
        // seats it directly under the headline and fully above the fold.
        else {
          // Centred chapter: the model sits in the space BELOW the text. The
          // offset is computed from where this section's text actually ends
          // (measured with the section's top at the top of the viewport), so
          // it holds for a one-line hook and a taller block alike, on any
          // screen height. It replaced fixed guesses (-0.34, -0.24, -0.13)
          // that each suited one section and one screen and no other.
          const bodyBottom = bd.bottom - r.top;
          // Never less than a quarter-screen below the text: a block taller than
          // the screen (pricing) put the model's centre ON its last line.
          const centre = Math.max(bodyBottom + Hh * 0.25, bodyBottom + Math.max(0, Hh - bodyBottom) * 0.53);
          oy = -(centre - Hh / 2);
          tl = tr = -1; gu = 0;
        }
      } else { oy = Hh * 0.17; }
      if (!mobile && side !== 'c') oy += Hh * 0.05;
      const stageW = mobile ? W : (side === 'l' ? W - tr - gu : (side === 'r' ? tl - gu : W));
      const boost = BOOST[s.id] ?? 1;
      let ss = mobile ? 1 : Math.max(0.42, Math.min(1.1, (stageW / W) / 0.45 * boost));
      // A section can name a slot for the model (the bento's centre tile). The
      // model is centred in that box and sized to it, and it rides with the page
      // like a centred chapter's model (side 'c').
      const slot = mobile ? null : s.querySelector<HTMLElement>('[data-stage-slot]');
      if (slot) {
        const sb = slot.getBoundingClientRect();
        ox = W / 2 - (sb.left + sb.width / 2);
        // Centre in the slot above its bottom 72px (the company mark sits there).
        const inner = Math.max(80, sb.height - 72);
        oy = -((sb.top - r.top + inner / 2) - Hh / 2);
        ss = Math.max(0.3, Math.min(1.1, Math.min(sb.width / W / 0.5, inner / Hh / 0.62) * boost));
        return { top: r.top + y0, h: r.height, sc: SCI[sceneKey] ?? 0, steps, side: 'c', tl: -1, tr: -1, ox, oy, ss };
      }
      return { top: r.top + y0, h: r.height, sc: SCI[sceneKey] ?? 0, steps, side, tl, tr, ox, oy, ss };
    });
  }

  function subOf(an: Anchor, probe: number) {
    const st = an.steps;
    if (!st.length) return 0;
    if (probe < st[0]!.top) return 0;
    for (let i = 0; i < st.length; i += 1) {
      const nextTop = i < st.length - 1 ? st[i + 1]!.top : st[i]!.top + st[i]!.h;
      if (probe < nextTop) return i + Math.min(0.999, (probe - st[i]!.top) / Math.max(1, nextTop - st[i]!.top));
    }
    return st.length - 0.001;
  }

  /* ── callouts ──────────────────────────────────────── */
  const NSV = 'http://www.w3.org/2000/svg';
  const cos: Array<{ el: HTMLElement; dot: HTMLElement; path: SVGPathElement; t: string; w: number }> = [];
  for (let i = 0; i < LABEL_COUNT; i += 1) {
    const el = document.createElement('div'); el.className = 'co'; callouts.appendChild(el);
    const dt = document.createElement('div'); dt.className = 'cd'; callouts.appendChild(dt);
    const pa = document.createElementNS(NSV, 'path') as SVGPathElement; leads.appendChild(pa);
    cos.push({ el, dot: dt, path: pa, t: '', w: 0 });
  }
  function hideCo(c: (typeof cos)[number]) {
    c.el.style.opacity = '0'; c.dot.style.opacity = '0'; c.path.style.opacity = '0';
  }

  /* ── loop state ────────────────────────────────────── */
  let paused = false, frozen = 0, clock = 0, lastLoop = 0, live = false;
  // Per-scene highlight. See three/highlight.ts for why it is not one slot.
  const highlights = new Map<string, number>();

  const A = blank(), cur = blank();
  const curQ: THREE.Quaternion[] = [];
  for (let i = 0; i < N; i += 1) curQ.push(new THREE.Quaternion());
  const dummy = new THREE.Object3D(), eu = new THREE.Euler();
  const qa = new THREE.Quaternion();
  const tv = new THREE.Vector3(), tc = new THREE.Color(), look = new THREE.Vector3();
  const camS = { yaw: 0, look: 1, dist: 15, scale: 1 };
  const lineCur = { foot: 0, frame: 0, cage: 0, slot: 0 };
  let hubOn = 0;
  const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
  let first = true, curOx = 0, curOy = 0, setOx = 1e9, setOy = 1e9, lastNow = 0;
  // ?debug3d exposes the smoothed placement for measurement (tests / tuning).
  const debug = typeof location !== 'undefined' && location.search.includes('debug3d');

  /*
   * Scroll picks the scene; time animates it (owner, 2026-09-29: "at any cost
   * the site is premium, it has to be as smooth as possible").
   *
   * The prototype scrubbed a blend between two scenes with scroll position.
   * Every wheel step then became a step in the morph, and a reader who paused
   * mid-way was left looking at a half-built shape. Now each section boundary
   * has one switch point. When the probe crosses it, the target becomes the
   * next scene, and everything glides there through a two-stage follow:
   * shape, colour (in OKLab), hub, lines, map, camera and placement. Two
   * first-order stages in series make an S-curve, easing in and out, so there
   * is no abrupt start and no dependence on how the reader scrolls.
   * Within-section progress (`sub`: steps, growth) is still read from scroll,
   * and it runs through the same filter.
   */
  const midP: THREE.Vector3[] = [], midS: THREE.Vector3[] = [], midQ: THREE.Quaternion[] = [];
  for (let i = 0; i < N; i += 1) { midP.push(new THREE.Vector3()); midS.push(new THREE.Vector3(1, 1, 1)); midQ.push(new THREE.Quaternion()); }
  const tgtLab = new Float32Array(3 * N), midLab = new Float32Array(3 * N), curLab = new Float32Array(3 * N);
  const okTmp = [0, 0, 0];
  const midHub = { p: new THREE.Vector3(), s: new THREE.Vector3(1, 1, 1), on: 0 };
  const camM = { yaw: 0, look: 1, dist: 15, scale: 1 };
  const lineMid = { foot: 0, frame: 0, cage: 0, slot: 0 };
  const pulseMid = new Float32Array(NP), pulseCur = new Float32Array(NP);
  let mapMid = 0, domIx = -1, switchedAt = 0;
  // Dissolve between scenes (owner, 2026-09-29 screen recording: flights and
  // morphs across the page read as chaos). shownIx is the scene on screen;
  // domIx is where the scroll is. On a change the model fades and eases back
  // (OUT), is placed, re-shaped and re-coloured while invisible, then fades up
  // and settles in (IN). Within-section progress still animates live.
  let shownIx = -1, phase: 'idle' | 'out' | 'in' = 'idle', phaseT0 = 0, fadeFrom = 1, opacity = 1, snapNext = false;
  const OUT_MS = 280, IN_MS = 560;

  /** Where the scene switches at boundary j (the top of section j). */
  function switchAt(j: number, Hv: number) {
    const centred = anchors[j - 1]!.side === 'c' || anchors[j]!.side === 'c';
    // Around a centred chapter, switch while its full-width headline is still
    // low on the screen, so the model is away before that headline is read.
    return anchors[j]!.top - (centred ? Hv * 0.3 : 0);
  }

  function frame(now: number) {
    const dt = lastNow ? Math.min(0.25, Math.max(0.001, (now - lastNow) / 1000)) : 0.016;
    lastNow = now;
    const t = reduce ? 0 : (paused ? frozen : clock) * 0.001;
    const probe = (window.scrollY || window.pageYOffset) + window.innerHeight * (mobile ? 0.3 : 0.5);
    const Hv = window.innerHeight;
    if (!anchors.length) return;

    // Dominant scene, with hysteresis: a switch needs the probe 4% of the
    // screen past the switch point, so resting on a boundary never flickers.
    let cand = 0;
    for (let j = 1; j < anchors.length; j += 1) if (probe >= switchAt(j, Hv)) cand = j;
    if (domIx < 0) { domIx = cand; switchedAt = now - 2000; }
    else if (cand !== domIx) {
      const j = cand > domIx ? domIx + 1 : domIx;
      if (Math.abs(cand - domIx) > 1 || Math.abs(probe - switchAt(j, Hv)) > Hv * 0.04) { domIx = cand; switchedAt = now; }
    }
    if (shownIx < 0 || reduce) { shownIx = domIx; }
    else if (domIx !== shownIx && phase !== 'out') { phase = 'out'; phaseT0 = now; fadeFrom = opacity; canvas.style.transition = 'none'; poke(); }
    let dissolve = 1;
    if (phase === 'out') {
      const p = Math.min(1, (now - phaseT0) / OUT_MS);
      opacity = fadeFrom * (1 - p * p);
      dissolve = 1 - 0.06 * p;
      if (p >= 1) { shownIx = domIx; snapNext = true; phase = 'in'; phaseT0 = now; switchedAt = now - 450; }
    } else if (phase === 'in') {
      const p = Math.min(1, (now - phaseT0) / IN_MS);
      const e = 1 - Math.pow(1 - p, 3);
      opacity = e; dissolve = 0.94 + 0.06 * e;
      if (p >= 1) phase = 'idle';
    } else opacity = 1;
    if (phase !== 'idle') { canvas.style.opacity = opacity.toFixed(3); poke(); }
    else if (canvas.style.opacity && canvas.style.opacity !== '1') canvas.style.opacity = '1';

    const an = anchors[shownIx]!;
    state(an.sc, t, subOf(an, probe), highlights.get(SCENES[an.sc] ?? '') ?? -1, A);

    // Two-stage follow for within-section motion. A new scene arrives
    // pre-settled (snapNext): it is placed while invisible, never flown in.
    const snap = first || reduce || snapNext;
    snapNext = false;
    const R = snap ? 1 : 1 - Math.exp(-dt * 5.5);
    first = false;

    for (let i = 0; i < N; i += 1) {
      midP[i]!.lerp(A.p[i]!, R); cur.p[i]!.lerp(midP[i]!, R);
      midS[i]!.lerp(A.s[i]!, R); cur.s[i]!.lerp(midS[i]!, R);
      qa.setFromEuler(eu.set(A.r[i]!.x, A.r[i]!.y, A.r[i]!.z));
      midQ[i]!.slerp(qa, R); curQ[i]!.slerp(midQ[i]!, R);
      // Colour moves in OKLab: perceptually even, no olive or lime mid-tones.
      toOk(A.c[i]!, okTmp);
      for (let k = 0; k < 3; k += 1) {
        const x = 3 * i + k;
        tgtLab[x] = okTmp[k]!;
        midLab[x] = snap ? tgtLab[x]! : midLab[x]! + (tgtLab[x]! - midLab[x]!) * R;
        curLab[x] = snap ? midLab[x]! : curLab[x]! + (midLab[x]! - curLab[x]!) * R;
      }
      fromOk(curLab[3 * i]!, curLab[3 * i + 1]!, curLab[3 * i + 2]!, tc);
      dummy.position.copy(cur.p[i]!); dummy.quaternion.copy(curQ[i]!);
      dummy.scale.copy(cur.s[i]!); dummy.updateMatrix();
      parts.setMatrixAt(i, dummy.matrix);
      parts.setColorAt(i, tc);
    }
    parts.instanceMatrix.needsUpdate = true;
    if (parts.instanceColor) parts.instanceColor.needsUpdate = true;

    midHub.on += (A.hub.on - midHub.on) * R; hubOn += (midHub.on - hubOn) * R;
    if (hubOn < 0.05) { midHub.p.copy(A.hub.p); cur.hub.p.copy(A.hub.p); }
    midHub.p.lerp(A.hub.p, R); cur.hub.p.lerp(midHub.p, R);
    midHub.s.lerp(A.hub.s, R); cur.hub.s.lerp(midHub.s, R);
    hub.position.copy(cur.hub.p);
    hub.scale.copy(cur.hub.s).multiplyScalar(Math.max(1e-4, hubOn));
    hubMat.color.copy(P.ink);

    for (let i = 0; i < NP; i += 1) {
      dummy.position.copy(A.pp[i]!);
      dummy.quaternion.identity();
      pulseMid[i] = pulseMid[i]! + (A.ps[i]! - pulseMid[i]!) * R;
      pulseCur[i] = pulseCur[i]! + (pulseMid[i]! - pulseCur[i]!) * R;
      dummy.scale.setScalar(Math.max(1e-4, pulseCur[i]!));
      dummy.updateMatrix();
      pulses.setMatrixAt(i, dummy.matrix);
    }
    pulses.instanceMatrix.needsUpdate = true;

    (Object.keys(LINES) as Array<keyof typeof LINES>).forEach((ln) => {
      lineMid[ln] += (A.lines[ln] - lineMid[ln]) * R;
      lineCur[ln] += (lineMid[ln] - lineCur[ln]) * R;
      (LINES[ln].material as THREE.LineBasicMaterial).opacity = lineCur[ln];
      LINES[ln].visible = lineCur[ln] > 0.01;
    });

    mapMid += (A.map - mapMid) * R; mapCur += (mapMid - mapCur) * R;
    mapGroup.visible = mapCur > 0.01;
    mapGroup.scale.set(1, Math.max(1e-4, mapCur), 1);
    mapMat.color.copy(P.model2).lerp(P.ink, 0.1);

    /* placement */
    // The model is placed in its half by offsetting the projection frustum,
    // not by moving the model, which would skew the perspective. A centred
    // chapter's model rides with its section like an image on the page, so it
    // stays under its own text arriving and leaving.
    const sy = window.scrollY || window.pageYOffset;
    const tox = an.ox;
    const toy = an.side === 'c' ? an.oy - Math.max(-Hh, Math.min(Hh, an.top - sy)) : an.oy;
    // Placement is exact, never filtered. An attached model must move with the
    // page like the text beside it; a filter made it trail the scroll and then
    // slide ~300px after the page stopped (owner: "on scroll the 3D models
    // should not jump"). Scene changes reposition while invisible (dissolve),
    // so there is no travel to smooth.
    curOx = tox; curOy = toy;
    if (Math.abs(curOx - setOx) > 0.4 || Math.abs(curOy - setOy) > 0.4) {
      setOx = curOx; setOy = curOy;
      camera.setViewOffset(W, Hh, curOx, curOy, W, Hh);
      camera.updateProjectionMatrix();
    }

    /* camera */
    const tScale = A.scale * (mobile ? 0.74 : an.ss);
    // Yaw follows the SHORTEST arc: the work carousel turns through −1.5π on
    // purpose, and a plain lerp out of it would swing almost a full turn.
    camM.yaw += shortestAngle(camM.yaw, A.yaw) * R; camS.yaw += shortestAngle(camS.yaw, camM.yaw) * R;
    camM.look += (A.look - camM.look) * R; camS.look += (camM.look - camS.look) * R;
    camM.dist += (A.dist - camM.dist) * R; camS.dist += (camM.dist - camS.dist) * R;
    camM.scale += (tScale - camM.scale) * R; camS.scale += (camM.scale - camS.scale) * R;
    group.rotation.y = camS.yaw;
    group.scale.setScalar(camS.scale * dissolve);

    const Km = 1 - Math.exp(-dt * 2.4);
    mouse.sx += (mouse.x - mouse.sx) * Km;
    mouse.sy += (mouse.y - mouse.sy) * Km;
    const az = 0.74 + mouse.sx * 0.1 + (reduce ? 0 : Math.sin(t * 0.06) * 0.03);
    const el2 = 0.5 - mouse.sy * 0.05;
    look.set(0, camS.look * camS.scale, 0);
    camera.position.set(
      look.x + camS.dist * Math.cos(el2) * Math.sin(az),
      look.y + camS.dist * Math.sin(el2),
      look.z + camS.dist * Math.cos(el2) * Math.cos(az),
    );
    camera.lookAt(look);

    group.updateMatrixWorld();
    if (debug) canvas.dataset.dbg = `${curOx.toFixed(2)},${curOy.toFixed(2)},${camS.scale.toFixed(4)},${camS.yaw.toFixed(4)},${opacity.toFixed(3)}`;

    renderer.render(scene, camera);
    // Labels step aside during a switch: out at once, back in once the model
    // has mostly arrived, so they never point at a part still in flight.
    const labelIn = reduce ? 1 : phase === 'out' ? 0 : smooth((now - switchedAt - 450) / 350);
    drawCallouts(A, A, 0, an, an, labelIn);
  }

  function drawCallouts(A2: SceneState, B2: SceneState, w: number, an: Anchor, bn: Anchor, fadeIn = 1) {
    const dom = w < 0.5 ? A2 : B2;
    const fade = (1 - 2 * Math.min(w, 1 - w)) * fadeIn;
    const ta = w < 0.5 ? an : bn;
    const vis: Array<{ co: (typeof cos)[number]; lb: SceneState['labels'][number]; ax: number; ay: number; y: number }> = [];
    let mnx = 1e9, mxx = -1e9, mtw = 0;

    for (let i = 0; i < cos.length; i += 1) {
      const co = cos[i]!, lb = dom.labels[i];
      if (!lb || mobile || ta.side === 'c') { hideCo(co); continue; }
      if (co.t !== lb.t) { co.t = lb.t; co.el.textContent = lb.t; co.w = co.el.offsetWidth; }
      tv.copy(lb.p).applyMatrix4(group.matrixWorld).project(camera);
      const sx = (tv.x + 1) / 2 * W, sy = (1 - tv.y) / 2 * Hh;
      if (sx < -160 || sx > W + 160 || sy < -160 || sy > Hh + 160) { hideCo(co); continue; }
      vis.push({ co, lb, ax: sx, ay: sy, y: sy });
      if (sx < mnx) mnx = sx;
      if (sx > mxx) mxx = sx;
      if (co.w > mtw) mtw = co.w;
    }

    if (dom.beside && vis.length) {
      // Beside mode: each label just outside its own part, pushed away from
      // the model's centre. No leaders — the label is next to what it names.
      tv.copy(dom.hub.p).applyMatrix4(group.matrixWorld).project(camera);
      const hx = (tv.x + 1) / 2 * W, hy = (1 - tv.y) / 2 * Hh;
      for (const v of vis) {
        const c2 = v.co, dx = v.ax - hx, dy = v.ay - hy;
        const clash = (x: number) => x < 10 || x + c2.w > W - 10 || (x < ta.tr && x + c2.w > ta.tl);
        let lx: number, ly: number;
        const side = Math.abs(dx) > Math.abs(dy) * 0.9;
        lx = dx > 0 ? v.ax + 14 : v.ax - 14 - c2.w;
        ly = v.ay - 9;
        // Beside the part when it points sideways and there is room; otherwise
        // a caption centred under (or over) it — never into the reading column.
        if (!side || clash(lx)) {
          lx = Math.max(10, Math.min(W - 10 - c2.w, v.ax - c2.w / 2));
          ly = dy < 0 && !side ? v.ay - 30 : v.ay + 16;
        }
        if (clash(lx)) { hideCo(c2); continue; }
        c2.el.style.transform = `translate(${lx.toFixed(1)}px,${ly.toFixed(1)}px)`;
        c2.el.style.opacity = (fade * (v.lb.hot ? 1 : 0.88)).toFixed(3);
        c2.el.classList.toggle('hot', v.lb.hot);
        c2.dot.style.opacity = '0';
        c2.path.style.opacity = '0';
      }
      return;
    }

    const right = ta.side !== 'r';
    const edge = right ? W - 22 - mtw : 22 + mtw;
    const colX = right ? Math.min(edge, Math.max(mxx + 70, edge - 140)) : Math.max(edge, Math.min(mnx - 70, edge + 140));
    const fit = vis.length > 0 && mtw < W * 0.3 && (right ? colX > ta.tr + 10 : colX < ta.tl - 10);

    if (vis.length) {
      vis.sort((p1, p2) => p1.ay - p2.ay);
      const G = 22, tp = 96, bt = Hh - 100;
      for (let j = 1; j < vis.length; j += 1) if (vis[j]!.y < vis[j - 1]!.y + G) vis[j]!.y = vis[j - 1]!.y + G;
      const over = vis[vis.length - 1]!.y - bt;
      if (over > 0) for (const v of vis) v.y -= over;
      if (vis[0]!.y < tp) {
        const under = tp - vis[0]!.y;
        for (const v of vis) v.y += under;
        for (let j = 1; j < vis.length; j += 1) if (vis[j]!.y < vis[j - 1]!.y + G) vis[j]!.y = vis[j - 1]!.y + G;
      }
    }

    for (const v of vis) {
      const c2 = v.co, ly = v.y;
      let lx: number, d: string, e1: number, e2: number;
      if (fit) {
        lx = right ? colX : colX - c2.w;
        e2 = right ? colX - 5 : colX + 5;
        e1 = right ? Math.min(v.ax + 18, e2) : Math.max(v.ax - 18, e2);
        d = `M${v.ax.toFixed(1)} ${v.ay.toFixed(1)}L${e1.toFixed(1)} ${ly.toFixed(1)}L${e2.toFixed(1)} ${ly.toFixed(1)}`;
      } else {
        let fl = !!v.lb.left;
        lx = fl ? v.ax - 24 - c2.w : v.ax + 24;
        if (lx < 10 || (lx < ta.tr && lx + c2.w > ta.tl)) { fl = !fl; lx = fl ? v.ax - 24 - c2.w : v.ax + 24; }
        if (lx < 10 || lx + c2.w > W - 10 || (lx < ta.tr && lx + c2.w > ta.tl)) { hideCo(c2); continue; }
        e2 = fl ? lx + c2.w + 4 : lx - 4;
        d = `M${v.ax.toFixed(1)} ${v.ay.toFixed(1)}L${e2.toFixed(1)} ${ly.toFixed(1)}`;
      }
      c2.el.style.transform = `translate(${lx.toFixed(1)}px,${(ly - 9).toFixed(1)}px)`;
      c2.dot.style.transform = `translate(${v.ax.toFixed(1)}px,${v.ay.toFixed(1)}px)`;
      c2.path.setAttribute('d', d);
      c2.el.style.opacity = (fade * (v.lb.hot ? 1 : 0.88)).toFixed(3);
      c2.dot.style.opacity = fade.toFixed(3);
      c2.path.style.opacity = (fade * (v.lb.hot ? 0.85 : 0.5)).toFixed(3);
      c2.el.classList.toggle('hot', v.lb.hot);
      c2.dot.classList.toggle('hot', v.lb.hot);
    }
  }

  /* ── sizing ────────────────────────────────────────── */
  const lowPower = (navigator.hardwareConcurrency ?? 8) <= 4
    || ((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8) <= 4;

  function resize() {
    W = window.innerWidth; Hh = window.innerHeight; mobile = W < 1000;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lowPower ? 1 : (mobile ? 1.25 : 1.5)));
    renderer.setSize(W, Hh, false);
    const sm = lowPower ? 512 : (mobile ? 768 : 1024);
    key.shadow.mapSize.set(sm, sm);
    if (key.shadow.map) { key.shadow.map.dispose(); key.shadow.map = null; }
    camera.aspect = W / Hh;
    camera.fov = mobile ? (W / Hh < 0.8 ? 34 : 30) : 26;
    setOx = setOy = 1e9; first = true;
    camera.updateProjectionMatrix();
    measure(); poke();
  }

  resize();

  const onResize = () => resize();
  const onLoad = () => measure();
  const onPointer = (e: PointerEvent) => { mouse.x = e.clientX / W - 0.5; mouse.y = e.clientY / Hh - 0.5; poke(); };
  const onScroll = () => poke();
  const onHover = () => poke();

  window.addEventListener('resize', onResize);
  window.addEventListener('load', onLoad);
  window.addEventListener('pointermove', onPointer, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true });
  document.addEventListener('mouseover', onHover);
  document.addEventListener('click', onHover);

  let ro: ResizeObserver | null = null;
  const main = document.querySelector('main');
  if ('ResizeObserver' in window && main) {
    let rt = 0;
    ro = new ResizeObserver(() => { clearTimeout(rt); rt = window.setTimeout(measure, 80); });
    ro.observe(main);
  }

  /* ── the loop ──────────────────────────────────────── */
  let raf = 0, lastDraw = 0, alive = true;
  if (reduce) {
    const draw = () => frame(0);
    const onScrollReduced = () => { raf = requestAnimationFrame(draw); };
    window.addEventListener('scroll', onScrollReduced, { passive: true });
    draw();
  } else {
    const loop = (now: number) => {
      if (!alive) return;
      // Rest after 6s without scroll, pointer, hover or resize: CLAUDE.md rule 4
      // (draw on demand). Paused rests after 2s. Any input wakes it. The scene
      // clock only advances while drawing, so pulses resume where they were
      // instead of jumping ahead by the idle time.
      const idle = now - lastPoke > (paused ? 2000 : 6000);
      if (!idle) clock += lastLoop ? Math.min(250, now - lastLoop) : 16;
      lastLoop = now;
      if (idle === live) { live = !idle; callouts.classList.toggle('live', live); }
      const minGap = lowPower ? 33 : 0;
      if (!idle && now - lastDraw >= minGap) { frame(now); lastDraw = now; }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
  }

  requestAnimationFrame(() => canvas.classList.add('ready'));

  return {
    destroy() {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('load', onLoad);
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('mouseover', onHover);
      document.removeEventListener('click', onHover);
      themeObserver.disconnect();
      darkMq.removeEventListener('change', applyPalette);
      ro?.disconnect();
      for (const c of cos) { c.el.remove(); c.dot.remove(); c.path.remove(); }
      boxGeo.dispose(); mat.dispose(); hubMat.dispose(); pulseMat.dispose();
      groundMat.dispose(); ground.geometry.dispose();
      parts.dispose(); pulses.dispose(); hub.geometry.dispose();
      for (const l of Object.values(LINES)) { l.geometry.dispose(); (l.material as THREE.Material).dispose(); }
      renderer.dispose();
    },
    poke,
    setPaused(p) { paused = p; frozen = clock; poke(); },
    setHighlight(sceneKey, index) { highlights.set(sceneKey, index); poke(); },
  };
}
