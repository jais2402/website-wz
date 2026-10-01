import type * as Three from 'three';

export type NarrativeVariant =
  | 'construction'
  | 'flow'
  | 'automation'
  | 'hosting'
  | 'ai'
  | 'training'
  | 'tourism'
  | 'people'
  | 'revenue'
  | 'operations'
  | 'finance'
  | 'industry'
  | 'conversation'
  | 'questions';

/** Sculptural metaphors with their own geometry and component choreography. */
export function createNarrativeModel(
  T: typeof Three,
  variant: NarrativeVariant,
  root: Three.Group,
  blue: Three.MeshPhysicalMaterial,
  pearl: Three.MeshPhysicalMaterial,
  geometries: Three.BufferGeometry<Three.NormalOrGLBufferAttributes>[],
  materials: Three.Material[],
) {
  const track = <G extends Three.BufferGeometry>(geometry: G): G => {
    geometries.push(geometry);
    return geometry;
  };
  const tint = (hex: number) => {
    const material = blue.clone();
    material.color.setHex(hex);
    materials.push(material);
    return material;
  };
  const teal = tint(0x218b7a),
    amber = tint(0xc58b32),
    violet = tint(0x6c5bd6);
  const accents = [blue, teal, amber, violet, blue];
  const mesh = (
    geometry: Three.BufferGeometry,
    material: Three.Material,
    parent: Three.Object3D = root,
  ) => {
    const object = new T.Mesh(geometry, material);
    object.castShadow = true;
    object.receiveShadow = true;
    parent.add(object);
    return object;
  };
  const rounded = (w: number, h: number, d: number) => {
    const shape = new T.Shape(),
      x = w / 2,
      y = h / 2,
      r = Math.min(w, h) * 0.09;
    shape.moveTo(-x + r, -y);
    shape.lineTo(x - r, -y);
    shape.quadraticCurveTo(x, -y, x, -y + r);
    shape.lineTo(x, y - r);
    shape.quadraticCurveTo(x, y, x - r, y);
    shape.lineTo(-x + r, y);
    shape.quadraticCurveTo(-x, y, -x, y - r);
    shape.lineTo(-x, -y + r);
    shape.quadraticCurveTo(-x, -y, -x + r, -y);
    const geometry = new T.ExtrudeGeometry(shape, {
      depth: d,
      bevelEnabled: true,
      bevelSize: 0.025,
      bevelThickness: 0.025,
      bevelSegments: 3,
      curveSegments: 8,
    });
    geometry.center();
    return track(geometry);
  };
  const tube = (points: Three.Vector3[], radius = 0.035, material: Three.Material = pearl) => {
    const curve = new T.CatmullRomCurve3(points);
    mesh(track(new T.TubeGeometry(curve, 48, radius, 8, false)), material);
    return curve;
  };
  const torus = (
    radius: number,
    thickness: number,
    material: Three.Material,
    parent: Three.Object3D = root,
  ) => mesh(track(new T.TorusGeometry(radius, thickness, 10, 64)), material, parent);
  const sphere = track(new T.SphereGeometry(0.11, 16, 12));
  const signals: { object: Three.Mesh; path: Three.CatmullRomCurve3; index: number }[] = [];
  const addSignal = (
    path: Three.CatmullRomCurve3,
    index: number,
    material = accents[index % accents.length]!,
  ) => {
    const object = mesh(sphere, material);
    signals.push({ object, path, index });
  };
  const signalMotion = (time: number, stage: number, paused: boolean) =>
    signals.forEach(({ object, path, index }) => {
      object.visible = !paused && (stage < 0 || stage === index);
      path.getPointAt((time * 0.19 + index * 0.17) % 1, object.position);
    });

  if (variant === 'construction') {
    const foundation = mesh(rounded(2.7, 0.16, 2.7), pearl);
    foundation.position.y = -1.06;
    const planMaterial = new T.LineBasicMaterial({ color: 0x234be8 });
    materials.push(planMaterial);
    const planPoints: number[] = [];
    for (let i = 0; i < 4; i++) {
      const at = -1.11 + i * 0.74;
      planPoints.push(at, -0.94, -1.11, at, -0.94, 1.11, -1.11, -0.94, at, 1.11, -0.94, at);
    }
    const planGeometry = track(new T.BufferGeometry());
    planGeometry.setAttribute('position', new T.Float32BufferAttribute(planPoints, 3));
    const plan = new T.LineSegments(planGeometry, planMaterial);
    root.add(plan);
    const cellGeometry = rounded(0.66, 0.66, 0.66);
    const cells: {
      object: Three.Mesh;
      level: number;
      x: number;
      z: number;
      corner: boolean;
      weight: number;
    }[] = [];
    for (let level = 0; level < 3; level++)
      for (let x = 0; x < 3; x++)
        for (let z = 0; z < 3; z++) {
          const object = mesh(cellGeometry, (x + z + level) % 3 === 0 ? accents[level]! : pearl);
          cells.push({
            object,
            level,
            x: x - 1,
            z: z - 1,
            corner: x !== 1 && z !== 1,
            weight: level === 0 ? 1 : 0,
          });
        }
    const frameMaterial = new T.LineBasicMaterial({
      color: 0x8b9abb,
      transparent: true,
      opacity: 0.4,
    });
    materials.push(frameMaterial);
    const frame = new T.LineSegments(
      track(new T.EdgesGeometry(track(new T.BoxGeometry(2.22, 2.22, 2.22)))),
      frameMaterial,
    );
    frame.position.y = 0.02;
    root.add(frame);
    return (time: number, stage: number, paused: boolean, interaction: number) => {
      const step = Math.max(0, stage);
      frame.visible = step === 1 || step === 2;
      plan.visible = step === 0;
      cells.forEach((cell) => {
        const complete = step > 0 && (step >= 2 || cell.level === 0 || (step === 1 && cell.corner));
        cell.weight = paused
          ? Number(complete)
          : T.MathUtils.lerp(cell.weight, Number(complete), 0.06);
        const spacing = step === 3 ? 0.72 : 0.81;
        cell.object.visible = step > 0 && cell.weight > 0.015;
        cell.object.scale.setScalar(Math.max(0.01, cell.weight));
        cell.object.position.set(
          cell.x * spacing,
          -0.65 +
            cell.level * spacing +
            (paused ? 0 : (1 - cell.weight) * (0.65 + cell.level * 0.3)),
          cell.z * spacing,
        );
        if (!paused && step === 2)
          cell.object.position.y += Math.sin(time * 0.8 + cell.level * 0.65) * 0.025;
        if (!paused && step === 3) {
          cell.object.position.x += cell.x * interaction * 0.06;
          cell.object.position.z += cell.z * interaction * 0.06;
        }
      });
    };
  }
  if (variant === 'flow') {
    // A manifold: five distinct inputs arrive at one shared channel.
    const hub = mesh(rounded(0.65, 2.25, 0.65), blue);
    hub.position.x = 0.65;
    for (let i = 0; i < 5; i++) {
      const y = (i - 2) * 0.47;
      const input = mesh(rounded(0.5, 0.28, 0.5), accents[i]!);
      input.position.set(-1.45, y, 0);
      const path = tube(
        [new T.Vector3(-1.2, y, 0), new T.Vector3(-0.4, y, 0), new T.Vector3(0.35, y, 0)],
        0.045,
      );
      addSignal(path, i);
    }
    const output = tube(
      [new T.Vector3(0.95, 0, 0), new T.Vector3(1.35, 0, 0), new T.Vector3(1.85, 0, 0)],
      0.07,
      teal,
    );
    addSignal(output, 5, teal);
    return (time: number, stage: number, paused: boolean) => {
      signalMotion(time, stage, paused);
      signals[5]!.object.visible = !paused;
      hub.scale.z = paused ? 1 : 1 + Math.sin(time * 0.9) * 0.025;
    };
  }
  if (variant === 'automation') {
    root.scale.setScalar(1.18);
    const gears: Three.Group[] = [];
    for (let i = 0; i < 2; i++) {
      const gear = new T.Group();
      gear.position.set(i ? 0.85 : -0.85, 0, 0);
      root.add(gear);
      gears.push(gear);
      torus(0.64, 0.12, i ? teal : blue, gear);
      const axle = mesh(track(new T.CylinderGeometry(0.21, 0.21, 0.45, 24)), pearl, gear);
      axle.rotation.x = Math.PI / 2;
      const toothGeometry = rounded(0.2, 0.25, 0.25);
      for (let j = 0; j < 12; j++) {
        const angle = (j * Math.PI * 2) / 12;
        const tooth = mesh(toothGeometry, i ? teal : blue, gear);
        tooth.position.set(Math.cos(angle) * 0.81, Math.sin(angle) * 0.81, 0);
        tooth.rotation.z = angle - Math.PI / 2;
      }
    }
    const path = tube(
      [
        new T.Vector3(-1.65, -0.9, 0),
        new T.Vector3(0, -1.12, 0.5),
        new T.Vector3(1.65, -0.9, 0),
        new T.Vector3(1.65, 0.95, 0),
        new T.Vector3(0, 1.22, 0.5),
        new T.Vector3(-1.65, 0.95, 0),
        new T.Vector3(-1.65, -0.9, 0),
      ],
      0.028,
    );
    addSignal(path, 0, amber);
    return (time: number, _stage: number, paused: boolean, interaction: number) => {
      gears.forEach((gear, i) => {
        gear.rotation.z = paused ? 0 : time * 0.16 * (i ? -1 : 1);
        gear.position.z = paused ? 0 : interaction * 0.16 * (i ? -1 : 1);
      });
      signalMotion(time, -1, paused);
    };
  }
  if (variant === 'hosting') {
    const pedestal = mesh(rounded(1.95, 0.16, 1.55), pearl);
    pedestal.position.y = -1.02;
    const units: Three.Mesh[] = [];
    const leds: Three.Mesh[] = [];
    for (let i = 0; i < 4; i++) {
      const unit = mesh(rounded(1.48, 0.32, 1.12), i % 2 ? pearl : blue);
      unit.position.y = -0.74 + i * 0.42;
      units.push(unit);
      const light = mesh(track(new T.SphereGeometry(0.045, 10, 8)), teal);
      light.position.set(0.48, unit.position.y, 0.58);
      leds.push(light);
    }
    const orbit = torus(1.18, 0.04, teal);
    orbit.rotation.x = Math.PI / 2;
    return (time: number, _stage: number, paused: boolean, interaction: number) => {
      units.forEach((unit, i) => {
        unit.position.y = -0.74 + i * 0.42 + (paused ? 0 : interaction * i * 0.06);
        leds[i]!.position.y = unit.position.y;
        leds[i]!.scale.setScalar(paused ? 1 : 0.85 + 0.25 * Math.sin(time * 1.8 - i * 0.8));
      });
      orbit.position.y = paused ? -0.3 : -0.8 + (Math.sin(time * 0.65) + 1) * 0.68;
    };
  }
  if (variant === 'ai') {
    // A small neural structure: one shared core and four connected decisions.
    const core = mesh(track(new T.SphereGeometry(0.65, 32, 24)), violet);
    const nodes: Three.Mesh[] = [];
    for (let i = 0; i < 4; i++) {
      const angle = Math.PI / 4 + (i * Math.PI) / 2;
      const end = new T.Vector3(Math.cos(angle) * 1.3, Math.sin(angle) * 1.15, 0);
      const path = tube(
        [
          new T.Vector3(end.x * 0.35, end.y * 0.35, 0),
          new T.Vector3(end.x * 0.7, end.y * 0.7, 0.12),
          end,
        ],
        0.075,
        pearl,
      );
      const node = mesh(track(new T.SphereGeometry(0.24, 24, 16)), i % 2 ? teal : blue);
      node.position.copy(end);
      nodes.push(node);
      addSignal(path, i, teal);
    }
    return (time: number, _stage: number, paused: boolean) => {
      core.scale.setScalar(paused ? 1 : 1 + Math.sin(time * 0.85) * 0.025);
      nodes.forEach((node, i) =>
        node.scale.setScalar(paused ? 1 : 1 + Math.sin(time * 0.85 - i * 0.8) * 0.06),
      );
      signalMotion(time, -1, paused);
    };
  }
  if (variant === 'questions') {
    const curve = new T.CatmullRomCurve3([
      new T.Vector3(-0.6, 0.63, 0),
      new T.Vector3(-0.4, 1.02, 0),
      new T.Vector3(0.35, 1.05, 0),
      new T.Vector3(0.63, 0.64, 0),
      new T.Vector3(0.38, 0.18, 0),
      new T.Vector3(0, -0.12, 0),
      new T.Vector3(0, -0.45, 0),
    ]);
    mesh(track(new T.TubeGeometry(curve, 64, 0.16, 16, false)), blue);
    const dot = mesh(track(new T.SphereGeometry(0.19, 24, 16)), teal);
    dot.position.set(0, -0.98, 0);
    return (time: number, _stage: number, paused: boolean) => {
      dot.position.y = -0.98 + (paused ? 0 : Math.sin(time * 0.8) * 0.045);
    };
  }
  if (variant === 'training') {
    // Separate working pieces become one dependable system.
    const pieces: Three.Mesh[] = [];
    for (let i = 0; i < 4; i++) {
      const piece = mesh(rounded(1.02, 1.02, 0.72), [blue, pearl, pearl, teal][i]!);
      pieces.push(piece);
    }
    return (time: number, _stage: number, paused: boolean, interaction: number) => {
      const gap = paused ? 0.06 : 0.06 + (1 - Math.cos(time * 0.65)) * 0.09 + interaction * 0.12;
      pieces.forEach((piece, i) =>
        piece.position.set((i % 2 ? 1 : -1) * (0.54 + gap), (i < 2 ? 1 : -1) * (0.54 + gap), 0),
      );
    };
  }
  if (variant === 'tourism') {
    // One shared event, with a single marker and two binding loops.
    // The cap covers the body edge without sharing coplanar top or side faces.
    const calendar = mesh(rounded(2.15, 1.5, 0.26), pearl);
    calendar.position.y = -0.3;
    const header = mesh(rounded(2.23, 0.48, 0.36), teal);
    header.position.set(0, 0.61, 0);
    for (const x of [-0.62, 0.62]) {
      const binding = torus(0.2, 0.055, pearl);
      binding.position.set(x, 0.84, 0.06);
      binding.rotation.y = Math.PI / 2;
    }
    const event = mesh(track(new T.SphereGeometry(0.32, 24, 16)), blue);
    event.position.set(0, -0.25, 0.36);
    return (time: number, _stage: number, paused: boolean, interaction: number) => {
      event.position.z = 0.36 + (paused ? 0 : Math.sin(time * 0.85) * 0.04 + interaction * 0.12);
    };
  }
  const parts: { object: Three.Mesh; base: Three.Vector3; index: number }[] = [];
  const part = (
    w: number,
    h: number,
    d: number,
    x: number,
    y: number,
    z: number,
    material: Three.Material,
  ) => {
    const object = mesh(rounded(w, h, d), material);
    const base = new T.Vector3(x, y, z);
    object.position.copy(base);
    parts.push({ object, base, index: parts.length });
    return object;
  };
  if (variant === 'people') {
    for (let i = 0; i < 3; i++) {
      const x = (i - 1) * 0.85;
      part(0.54, i === 1 ? 1.35 : 0.95, 0.54, x, -0.25, 0, i === 1 ? blue : teal);
      const head = mesh(track(new T.SphereGeometry(0.25, 20, 16)), pearl);
      head.position.set(x, i === 1 ? 0.7 : 0.5, 0);
    }
  } else if (variant === 'revenue') {
    for (let i = 0; i < 3; i++) {
      const h = 0.65 + i * 0.55;
      part(
        0.65,
        h,
        0.65,
        (i - 1) * 0.85,
        -0.95 + h / 2,
        0,
        i === 2 ? teal : i === 1 ? blue : pearl,
      );
    }
  } else if (variant === 'operations') {
    for (let i = 0; i < 3; i++)
      part(0.72, 0.72, 0.72, (i - 1) * 1.05, (i - 1) * 0.3, 0, accents[i]!);
    tube(
      [new T.Vector3(-1.1, -0.75, 0), new T.Vector3(0, -0.45, 0), new T.Vector3(1.1, -0.15, 0)],
      0.055,
      pearl,
    );
  } else if (variant === 'finance') {
    part(0.38, 1.9, 0.38, 0, 0, 0, blue);
    part(2.6, 0.18, 0.35, 0, 0.65, 0, pearl);
    for (const x of [-0.95, 0.95]) {
      part(0.08, 0.55, 0.08, x, 0.3, 0, pearl);
      part(0.8, 0.2, 0.85, x, -0.1, 0, teal);
    }
  } else if (variant === 'industry') {
    for (let i = 0; i < 3; i++) {
      part(0.65, 1.1 + i * 0.25, 0.8, (i - 1) * 0.8, -0.1, 0, accents[i]!);
      part(0.25, 0.4, 0.25, (i - 1) * 0.8, 0.75 + i * 0.125, 0, pearl);
    }
  } else {
    // An open conversation: two brackets move towards a common point.
    for (const side of [-1, 1]) {
      const material = side < 0 ? blue : teal;
      part(0.28, 1.8, 0.5, side * 1.1, 0, 0, material);
      for (const y of [-0.78, 0.78]) part(0.95, 0.25, 0.5, side * 0.76, y, 0, material);
    }
    const core = mesh(track(new T.OctahedronGeometry(0.45)), pearl);
    core.position.z = 0.15;
  }
  return (time: number, _stage: number, paused: boolean, interaction: number) => {
    parts.forEach(({ object, base, index }) => {
      object.position.copy(base);
      if (!paused) {
        object.position.y += Math.sin(time * 0.75 + index * 0.35) * 0.035;
        if (variant === 'conversation') object.position.x *= 1 - interaction * 0.12;
      }
    });
  };
}
