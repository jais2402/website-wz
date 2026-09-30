import * as THREE from 'three';

/**
 * A box with flat chamfered corners: machined, not moulded.
 *
 * The owner's references (2026-09-29) were a faceted twisty puzzle, a
 * Cybertruck and a cut-metal model kit — hard edges and flat planes, with the
 * light doing the work. The corner is cut straight rather than rounded, so
 * every corner is a facet that catches the key light instead of a smooth
 * gradient that swallows it.
 *
 * Built once and shared by every instance: one geometry, one InstancedMesh,
 * no extra draw calls (architecture.md §8). It also survives the non-uniform
 * per-axis scaling every scene relies on in `states.ts` — a notched or
 * asymmetric silhouette would visibly deform when stretched into a tall bar or
 * a flat plate, which is why those directions were rejected.
 *
 * `c` is the corner cut as a fraction of the side.
 */
export function chamferBox(c: number): THREE.BufferGeometry {
  const s = 0.5 - c;
  const shape = new THREE.Shape();
  shape.moveTo(-s, -0.5); shape.lineTo(s, -0.5); shape.lineTo(0.5, -s);
  shape.lineTo(0.5, s); shape.lineTo(s, 0.5); shape.lineTo(-s, 0.5);
  shape.lineTo(-0.5, s); shape.lineTo(-0.5, -s); shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 1 - c * 2,
    bevelEnabled: true,
    // One segment: the bevel is a single flat facet, never an arc.
    bevelSegments: 1,
    steps: 1,
    bevelSize: c,
    bevelThickness: c,
    curveSegments: 1,
  });
  geometry.center();
  geometry.computeVertexNormals();
  return geometry;
}

/** The drafting lines: a footprint, a lattice frame, a cage, and an empty slot. */
export function lineSegmentPositions() {
  // Footprint, with the overshoot a draughtsman leaves at each corner.
  const foot: number[] = [];
  const E = 1.4, O = 0.28, Y0 = 0.006;
  ([[-E - O, -E, E + O, -E], [-E - O, E, E + O, E], [-E, -E - O, -E, E + O], [E, -E - O, E, E + O]] as Array<number[]>)
    .forEach((a) => { foot.push(a[0]!, Y0, a[1]!, a[2]!, Y0, a[3]!); });
  [-0.42, 0.42].forEach((v) => { foot.push(v, Y0, -E, v, Y0, E, -E, Y0, v, E, Y0, v); });

  // The frame: a 3 x 3 x 3 lattice the modules drop into.
  const frame: number[] = [];
  const L = [-1.26, -0.42, 0.42, 1.26], H = [0, 0.84, 1.68, 2.52];
  L.forEach((x) => { L.forEach((z) => { frame.push(x, 0, z, x, 2.52, z); }); });
  H.forEach((y) => { L.forEach((v) => { frame.push(-1.26, y, v, 1.26, y, v, v, y, -1.26, v, y, 1.26); }); });

  // The cage that closes for "secure".
  const cage: number[] = [];
  const C = 1.36, CH = 5.12;
  ([[-C, -C], [C, -C], [C, C], [-C, C], [0, -C], [0, C], [-C, 0], [C, 0]] as Array<number[]>)
    .forEach((p) => { cage.push(p[0]!, 0, p[1]!, p[0]!, CH, p[1]!); });
  [0, 1.28, 2.56, 3.84, 5.12].forEach((y) => {
    cage.push(-C, y, -C, C, y, -C, C, y, -C, C, y, C, C, y, C, -C, y, C, -C, y, C, -C, y, -C);
  });

  return { foot, frame, cage };
}

/** `k` points walking the perimeter of the unit square, in order. */
function squareRing(k: number): Array<[number, number]> {
  const ring: Array<[number, number]> = [];
  for (let i = 0; i < k; i += 1) {
    const t = (i / k) * 4, side = Math.floor(t), f = t - side, a = -0.5 + f;
    if (side === 0) ring.push([a, -0.5]);
    else if (side === 1) ring.push([0.5, a]);
    else if (side === 2) ring.push([-a, 0.5]);
    else ring.push([-0.5, -a]);
  }
  return ring;
}

/** `k` points on a regular polygon of `sides`, walked in the same order. */
function polygonRing(k: number, sides: number, turn = 0): Array<[number, number]> {
  const ring: Array<[number, number]> = [];
  for (let i = 0; i < k; i += 1) {
    // Snap to the polygon's own corners so consecutive samples go collinear —
    // that is what makes a run of samples read as ONE straight edge.
    const a = Math.floor((i / k) * sides) / sides * Math.PI * 2 + turn;
    const b = (Math.floor((i / k) * sides) + 1) / sides * Math.PI * 2 + turn;
    const f = ((i / k) * sides) % 1;
    // Circumradius chosen so the polygon's width across flats is 1 — the same
    // as the cube it morphs into. Without this the pieces are narrower than
    // the cube and read as thin towers rather than blocks.
    const r = 0.5 / Math.cos(Math.PI / sides);
    ring.push([
      (Math.cos(a) * (1 - f) + Math.cos(b) * f) * r,
      (Math.sin(a) * (1 - f) + Math.sin(b) * f) * r,
    ]);
  }
  return ring;
}

/**
 * A prism built from `from`, carrying `to` as a morph target.
 *
 * Both rings have the same length, so the topology is identical and the shader
 * can simply mix between them: at 0 the block is its own irregular shape, at 1
 * it is an exact cube. Only X/Z differ between the two rings — a sample's top
 * and bottom vertices share their X/Z, so they always move together, every side
 * wall stays a planar vertical quad, and the caps keep their Y. Nothing bends,
 * nothing tilts; the shape changes but every face stays flat.
 */
function morphPrism(from: Array<[number, number]>, to: Array<[number, number]>): THREE.BufferGeometry {
  const k = from.length, h = 0.5;
  const pos: number[] = [], tgt: number[] = [];
  const push = (a: number[], x: number, y: number, z: number) => { a.push(x, y, z); };
  for (let i = 0; i < k; i += 1) {
    const j = (i + 1) % k;
    const [x0, z0] = from[i]!, [x1, z1] = from[j]!;
    const [u0, v0] = to[i]!, [u1, v1] = to[j]!;
    // Side wall. Wound so the outward face is the front one — with the ring
    // walked counter-clockwise in XZ, that is the reverse of the obvious order.
    push(pos, x0, -h, z0); push(pos, x1, h, z1); push(pos, x1, -h, z1);
    push(tgt, u0, -h, v0); push(tgt, u1, h, v1); push(tgt, u1, -h, v1);
    push(pos, x0, -h, z0); push(pos, x0, h, z0); push(pos, x1, h, z1);
    push(tgt, u0, -h, v0); push(tgt, u0, h, v0); push(tgt, u1, h, v1);
    // Caps, fanned from a centre that never moves.
    push(pos, 0, h, 0); push(pos, x1, h, z1); push(pos, x0, h, z0);
    push(tgt, 0, h, 0); push(tgt, u1, h, v1); push(tgt, u0, h, v0);
    push(pos, 0, -h, 0); push(pos, x0, -h, z0); push(pos, x1, -h, z1);
    push(tgt, 0, -h, 0); push(tgt, u0, -h, v0); push(tgt, u1, -h, v1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('aTarget', new THREE.Float32BufferAttribute(tgt, 3));
  g.computeVertexNormals();
  return g;
}

/**
 * A prism with `sides` vertical walls, a flat top and a flat bottom.
 *
 * Part of the shape set (see `SHAPES`): a hexagonal or octagonal piece reads
 * as a different machined part from a chamfered box while staying in the same
 * family — every face flat, every edge a hard crease, nothing tilted.
 */
export function regularPrism(sides: number): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  for (let i = 0; i < sides; i += 1) {
    const a = (i / sides) * Math.PI * 2 + Math.PI / sides;
    const x = Math.cos(a) * 0.5, y = Math.sin(a) * 0.5;
    if (i === 0) shape.moveTo(x, y); else shape.lineTo(x, y);
  }
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 1, bevelEnabled: false, steps: 1, curveSegments: 1,
  });
  geometry.center();
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * The shapes the blocks are drawn from, and the cube each one resolves into.
 *
 * **Why more than one.** The model used to share a single geometry, on the rule
 * "one InstancedMesh" in architecture.md §8. That rule protected the draw-call
 * budget — and the ceiling is 100 per frame while the scene uses about seven.
 * One extra mesh per shape costs one draw call, so four shapes take it to
 * roughly ten: still "low tens", exactly as the budget describes.
 *
 * **The journey.** Each shape carries the cube as a morph target, so the same
 * piece that starts as a hexagon, an octagon or a jagged outline ends as an
 * exact cube — a Ghost Cube resolving. The shapes are DESIGNED, not random
 * noise: earlier attempts perturbed one shape per vertex and read as damaged
 * rather than machined. Every face stays flat and every edge hard throughout,
 * because only X/Z differ between a shape and its target.
 */
const RING = 16;

export const SHAPES: Array<() => THREE.BufferGeometry> = [
  () => morphPrism(polygonRing(RING, 5, 0.3), squareRing(RING)),
  () => morphPrism(polygonRing(RING, 6, 0.2), squareRing(RING)),
  () => morphPrism(polygonRing(RING, 8, 0), squareRing(RING)),
  // A square turned 45°: it resolves by rotating true, not by changing its
  // number of sides — a different kind of "settling" among the polygons.
  () => morphPrism(polygonRing(RING, 4, Math.PI / 4), squareRing(RING)),
];
