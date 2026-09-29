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
      const ss = mobile ? 1 : Math.max(0.42, Math.min(1.1, (stageW / W) / 0.45 * boost));
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
  let paused = false, frozen = 0;
  // Per-scene highlight. See three/highlight.ts for why it is not one slot.
  const highlights = new Map<string, number>();

  const A = blank(), B = blank(), cur = blank();
  const curQ: THREE.Quaternion[] = [];
  for (let i = 0; i < N; i += 1) curQ.push(new THREE.Quaternion());
  const dummy = new THREE.Object3D(), eu = new THREE.Euler();
  const qa = new THREE.Quaternion(), qb = new THREE.Quaternion();
  const tv = new THREE.Vector3(), ts = new THREE.Vector3(), tc = new THREE.Color(), look = new THREE.Vector3();
  const camS = { yaw: 0, look: 1, dist: 15, scale: 1 };
  const lineCur = { foot: 0, frame: 0, cage: 0, slot: 0 };
  let hubOn = 0;
  const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
  let first = true, curOx = 0, curOy = 0, setOx = 1e9, setOy = 1e9, lastNow = 0;

  function frame(now: number) {
    const dt = lastNow ? Math.min(0.25, Math.max(0.001, (now - lastNow) / 1000)) : 0.016;
    lastNow = now;
    const t = reduce ? 0 : (paused ? frozen : now) * 0.001;
    const probe = (window.scrollY || window.pageYOffset) + window.innerHeight * (mobile ? 0.3 : 0.5);
    const Hv = window.innerHeight;

    // Which two scenes are blending, and how far. Each boundary has a window
    // around the next section's top. Between two side scenes it is ±0.22 of
    // the viewport, the prototype's value. When a centred chapter is on either
    // side, the window opens early, as soon as the next section's top enters
    // the bottom of the screen. A centred model sits low, exactly where the
    // next heading arrives, so it has to move before that heading is readable.
    let ia = 0, ib = 0, w = 0;
    for (let s = 0; s < anchors.length; s += 1) if (probe >= anchors[s]!.top) ia = s;
    ib = ia;
    for (let j = 1; j < anchors.length; j += 1) {
      const bnd = anchors[j]!.top;
      const centred = anchors[j - 1]!.side === 'c' || anchors[j]!.side === 'c';
      const lo = bnd - Hv * (centred ? 0.45 : 0.22), hi = bnd + Hv * (centred ? 0.12 : 0.22);
      if (probe > lo && probe < hi) { ia = j - 1; ib = j; w = smooth((probe - lo) / (hi - lo)); break; }
    }
    const an = anchors[ia], bn = anchors[ib];
    if (!an || !bn) return;
    // Placement and size lead the shape blend. The next section's text is
    // already on screen when the blend starts, so the model must leave the
    // reading column early. Following w, a centred model was still in the
    // middle of the page when the next heading arrived beside it. It now
    // reaches the new half by w = 0.45 and finishes changing shape after.
    // Only around a centred chapter. Between two side scenes the model
    // crosses from one half to the other, where early placement put it onto
    // the outgoing text; there it keeps following w, as in the prototype.
    const nearCentre = an.side === 'c' || bn.side === 'c';
    const wp = !nearCentre ? w : w <= 0 ? 0 : w >= 1 ? 1 : smooth(Math.min(1, w / 0.45));

    const hlA = highlights.get(SCENES[an.sc] ?? '') ?? -1;
    const hlB = highlights.get(SCENES[bn.sc] ?? '') ?? -1;
    state(an.sc, t, subOf(an, probe), hlA, A);
    state(bn.sc, t, subOf(bn, probe), hlB, B);
    const K = (first || reduce) ? 1 : 1 - Math.exp(-dt * 5.2);
    const Kc = (first || reduce) ? 1 : 1 - Math.exp(-dt * 9);
    first = false;

    for (let i = 0; i < N; i += 1) {
      tv.copy(A.p[i]!).lerp(B.p[i]!, w);
      ts.copy(A.s[i]!).lerp(B.s[i]!, w);
      qa.setFromEuler(eu.set(A.r[i]!.x, A.r[i]!.y, A.r[i]!.z));
      qb.setFromEuler(eu.set(B.r[i]!.x, B.r[i]!.y, B.r[i]!.z));
      qa.slerp(qb, w);
      // Colour follows whichever scene dominates and eases over in time. It
      // is not mixed by scroll: an RGB mix of pink and green is olive, and a
      // hue-wheel mix is lime and cyan, and a reader who stops mid-scroll
      // would be left looking at either. Now every resting frame shows real
      // palette colours.
      tc.copy(w < 0.5 ? A.c[i]! : B.c[i]!);
      cur.p[i]!.lerp(tv, K); cur.s[i]!.lerp(ts, K);
      curQ[i]!.slerp(qa, K); cur.c[i]!.lerp(tc, Kc);
      dummy.position.copy(cur.p[i]!); dummy.quaternion.copy(curQ[i]!);
      dummy.scale.copy(cur.s[i]!); dummy.updateMatrix();
      parts.setMatrixAt(i, dummy.matrix);
      parts.setColorAt(i, cur.c[i]!);
    }
    parts.instanceMatrix.needsUpdate = true;
    if (parts.instanceColor) parts.instanceColor.needsUpdate = true;

    const wh = smooth((w - 0.4) / 0.3);
    const ho = A.hub.on * (1 - wh) + B.hub.on * wh;
    hubOn += (ho - hubOn) * K;
    if (A.hub.on === 0 && B.hub.on > 0) tv.copy(B.hub.p);
    else if (B.hub.on === 0 && A.hub.on > 0) tv.copy(A.hub.p);
    else tv.copy(A.hub.p).lerp(B.hub.p, w);
    cur.hub.p.lerp(tv, hubOn < 0.05 ? 1 : K);
    ts.copy(A.hub.s).lerp(B.hub.s, w);
    cur.hub.s.lerp(ts, K);
    hub.position.copy(cur.hub.p);
    hub.scale.copy(cur.hub.s).multiplyScalar(Math.max(1e-4, hubOn));
    hubMat.color.copy(P.ink);

    for (let i = 0; i < NP; i += 1) {
      const ps = A.ps[i]! * (1 - w) + B.ps[i]! * w;
      dummy.position.copy(w < 0.5 ? A.pp[i]! : B.pp[i]!);
      dummy.quaternion.identity();
      dummy.scale.setScalar(Math.max(1e-4, ps));
      dummy.updateMatrix();
      pulses.setMatrixAt(i, dummy.matrix);
    }
    pulses.instanceMatrix.needsUpdate = true;

    (Object.keys(LINES) as Array<keyof typeof LINES>).forEach((ln) => {
      const lo = A.lines[ln] * (1 - w) + B.lines[ln] * w;
      lineCur[ln] += (lo - lineCur[ln]) * K;
      (LINES[ln].material as THREE.LineBasicMaterial).opacity = lineCur[ln];
      LINES[ln].visible = lineCur[ln] > 0.01;
    });

    mapCur += ((A.map * (1 - w) + B.map * w) - mapCur) * K;
    mapGroup.visible = mapCur > 0.01;
    mapGroup.scale.set(1, Math.max(1e-4, mapCur), 1);
    mapMat.color.copy(P.model2).lerp(P.ink, 0.1);

    /* camera */
    // Yaw is blended and damped along the SHORTEST arc. The work scene turns
    // its carousel through -1.5π on purpose; a plain lerp out of it into a
    // scene near 0 would swing the model almost a full turn the long way.
    const yaw = A.yaw + shortestAngle(A.yaw, B.yaw) * w;
    camS.yaw += shortestAngle(camS.yaw, yaw) * K;
    camS.look += ((A.look * (1 - w) + B.look * w) - camS.look) * K;
    camS.dist += ((A.dist * (1 - w) + B.dist * w) - camS.dist) * K;
    camS.scale += (((A.scale * (1 - w) + B.scale * w) * (mobile ? 0.74 : (an.ss * (1 - wp) + bn.ss * wp))) - camS.scale) * K;
    group.rotation.y = camS.yaw;
    group.scale.setScalar(camS.scale);

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

    // The model is placed in its half by offsetting the projection frustum —
    // not by moving the model, which would skew the perspective.
    // A centred chapter's model travels with its section, like an image on
    // the page. Its oy is measured with the section at the top of the
    // viewport; while the section is lower (arriving) or higher (leaving), the
    // model is shifted by the same amount. So it always sits under its own
    // text and never meets a full-width headline, arriving or leaving.
    const sy = window.scrollY || window.pageYOffset;
    const oyOf = (a: Anchor) => (a.side === 'c'
      ? a.oy - Math.max(-Hh, Math.min(Hh, a.top - sy))
      : a.oy);
    let tox: number, toy: number;
    if (bn.side === 'c' && an.side !== 'c') {
      // Entering a centred chapter. Stay in the side half until the
      // full-width headline is close, then hand over to the model that rides
      // up under that headline. Leaving early emptied the side half while its
      // text was still being read.
      const wl = smooth((w - 0.55) / 0.45);
      tox = an.ox * (1 - wl) + bn.ox * wl;
      toy = an.oy * (1 - wl) + oyOf(bn) * wl;
    } else if (an.side === 'c' && bn.side !== 'c') {
      // Leaving a centred chapter. Move to the new half early, but never above
      // the bottom of the centred text that is still scrolling away. Its own
      // attached position marks that line, and the lower of the two wins.
      tox = an.ox * (1 - wp) + bn.ox * wp;
      toy = Math.min(oyOf(an) * (1 - wp) + bn.oy * wp, oyOf(an));
    } else {
      tox = an.ox * (1 - wp) + bn.ox * wp;
      toy = oyOf(an) * (1 - wp) + oyOf(bn) * wp;
    }
    const Kp = (first || reduce) ? 1 : 1 - Math.exp(-dt * 3.2);
    // y follows faster than x: it tracks the page while scrolling.
    const Ky = (first || reduce) ? 1 : 1 - Math.exp(-dt * 14);
    curOx += (tox - curOx) * Kp; curOy += (toy - curOy) * Ky;
    if (Math.abs(curOx - setOx) > 0.4 || Math.abs(curOy - setOy) > 0.4) {
      setOx = curOx; setOy = curOy;
      camera.setViewOffset(W, Hh, curOx, curOy, W, Hh);
      camera.updateProjectionMatrix();
    }
    group.updateMatrixWorld();

    renderer.render(scene, camera);
    drawCallouts(A, B, w, an, bn);
  }

  function drawCallouts(A2: SceneState, B2: SceneState, w: number, an: Anchor, bn: Anchor) {
    const dom = w < 0.5 ? A2 : B2;
    const fade = 1 - 2 * Math.min(w, 1 - w);
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
      const idle = paused && now - lastPoke > 2000;
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
    setPaused(p) { paused = p; frozen = performance.now(); poke(); },
    setHighlight(sceneKey, index) { highlights.set(sceneKey, index); poke(); },
  };
}
