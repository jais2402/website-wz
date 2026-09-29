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

/**
 * A prism whose footprint is sampled around the unit square: flat top, flat
 * bottom, and `k` vertical side walls.
 *
 * The shape exists so the stage's shader can push each sample in and out **in
 * X/Z only**, which turns the square footprint into an irregular many-sided
 * outline — the Ghost Cube read the owner asked for (2026-09-30). Because a
 * sample's top and bottom copies share their X/Z, they always move together,
 * so every side wall stays a planar vertical quad and every edge stays a hard
 * crease. Pushed to zero the footprint is exactly the square again, so the
 * block resolves into a true cube.
 *
 * Non-indexed, so `flatShading` gives each facet its own normal.
 */
export function countryPrism(k = 16): THREE.BufferGeometry {
  const half = 0.5;
  // `k` points walking the square's perimeter, in order.
  const ring: Array<[number, number]> = [];
  for (let i = 0; i < k; i += 1) {
    const t = (i / k) * 4; // 0..4, one unit per side
    const side = Math.floor(t), f = t - side;
    const a = -half + f * 2 * half;
    if (side === 0) ring.push([a, -half]);
    else if (side === 1) ring.push([half, a]);
    else if (side === 2) ring.push([-a, half]);
    else ring.push([-half, -a]);
  }

  const pos: number[] = [];
  const tri = (ax: number, ay: number, az: number, bx: number, by: number, bz: number,
               cx: number, cy: number, cz: number) => { pos.push(ax, ay, az, bx, by, bz, cx, cy, cz); };

  for (let i = 0; i < k; i += 1) {
    const [x0, z0] = ring[i]!;
    const [x1, z1] = ring[(i + 1) % k]!;
    // Side wall, two triangles.
    tri(x0, -half, z0, x1, -half, z1, x1, half, z1);
    tri(x0, -half, z0, x1, half, z1, x0, half, z0);
    // Caps, fanned from the centre so the centre vertex never moves.
    tri(0, half, 0, x0, half, z0, x1, half, z1);
    tri(0, -half, 0, x1, -half, z1, x0, -half, z0);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geometry.computeVertexNormals();
  return geometry;
}
