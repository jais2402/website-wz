import * as THREE from 'three';

/**
 * A rounded box, built as an extruded rounded square with a bevel.
 *
 * This is what gives the model its weight — a plain BoxGeometry reads as a
 * wireframe primitive, and the design calls for 3px radius on the geometry
 * (design.md §1.5). Built once and shared by every instance.
 */
export function roundedBox(r: number, seg: number): THREE.BufferGeometry {
  const s = 0.5 - r;
  const shape = new THREE.Shape();
  shape.absarc(s, -s, r, -Math.PI / 2, 0, false);
  shape.absarc(s, s, r, 0, Math.PI / 2, false);
  shape.absarc(-s, s, r, Math.PI / 2, Math.PI, false);
  shape.absarc(-s, -s, r, Math.PI, Math.PI * 1.5, false);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 1 - r * 2,
    bevelEnabled: true,
    bevelSegments: seg,
    steps: 1,
    bevelSize: r,
    bevelThickness: r,
    curveSegments: seg,
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
