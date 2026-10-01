import type * as Three from 'three';

export type NarrativeVariant =
  | 'construction'
  | 'flow'
  | 'automation'
  | 'hosting'
  | 'ai'
  | 'training'
  | 'tourism';

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
      cells.forEach((cell) => {
        const complete = step >= 2 || cell.level === 0 || (step === 1 && cell.corner);
        cell.weight = paused
          ? Number(complete)
          : T.MathUtils.lerp(cell.weight, Number(complete), 0.06);
        const spacing = step === 3 ? 0.72 : 0.81;
        cell.object.visible = cell.weight > 0.015;
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
    root.scale.setScalar(0.87);
    const core = mesh(track(new T.IcosahedronGeometry(0.57, 1)), blue);
    core.position.y = 0.3;
    const halo = torus(0.86, 0.035, pearl);
    halo.rotation.x = Math.PI / 2;
    halo.position.y = 0.3;
    const nodes: {
      object: Three.Mesh;
      material: Three.MeshPhysicalMaterial;
      index: number;
      base: Three.Vector3;
    }[] = [];
    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5;
      const position = new T.Vector3(
        Math.cos(angle) * 2.02,
        0.2 + Math.sin(angle) * 0.18,
        Math.sin(angle) * 1.65,
      );
      const material = accents[i]!.clone();
      materials.push(material);
      const object = mesh(track(new T.IcosahedronGeometry(0.32, 1)), material);
      object.position.copy(position);
      nodes.push({ object, material, index: i, base: position });
      const path = tube(
        [
          new T.Vector3(0, 0.3, 0),
          new T.Vector3(position.x * 0.48, 0.7, position.z * 0.25),
          position,
        ],
        0.035,
      );
      addSignal(path, i);
      const rim = torus(0.43, 0.025, accents[i]!);
      rim.rotation.x = Math.PI / 2;
      rim.position.copy(position);
    }
    return (time: number, stage: number, paused: boolean) => {
      nodes.forEach(({ object, material, index, base }) => {
        const selected = stage === index;
        material.color.lerp(
          stage < 0 || selected ? accents[index]!.color : pearl.color,
          paused ? 1 : 0.09,
        );
        object.position.copy(base);
        object.position.y += paused ? 0 : (selected ? 0.18 : 0.035) * Math.sin(time * 1.1 + index);
        object.scale.setScalar(selected ? 1.12 : 1);
      });
      core.scale.setScalar(paused ? 1 : 1 + Math.sin(time * 0.9) * 0.035);
      signalMotion(time, stage, paused);
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
    const core = mesh(track(new T.OctahedronGeometry(0.65, 0)), violet);
    const frames: Three.Mesh[] = [];
    for (let i = 0; i < 3; i++) {
      const frame = torus(1.18 + i * 0.17, 0.045, i === 1 ? blue : pearl);
      frame.rotation.set((i * Math.PI) / 3, Math.PI / 4, (i * Math.PI) / 3);
      frames.push(frame);
    }
    const points: Three.Mesh[] = [];
    for (let i = 0; i < 6; i++) {
      const point = mesh(sphere, i % 2 ? teal : violet);
      points.push(point);
    }
    return (time: number, _stage: number, paused: boolean, interaction: number) => {
      core.scale.setScalar(paused ? 1 : 1 + Math.sin(time * 0.9) * 0.055);
      frames.forEach(
        (frame, i) =>
          (frame.position.y = paused
            ? 0
            : Math.sin(time * 0.8 + i) * 0.06 + interaction * (i - 1) * 0.13),
      );
      points.forEach((point, i) => {
        const a = (i * Math.PI) / 3;
        point.position.set(
          Math.cos(a) * (1.55 + (paused ? 0 : Math.sin(time * 0.8 + i) * 0.1)),
          Math.sin(a) * 1.2,
          Math.sin(a * 2) * 0.5,
        );
      });
    };
  }
  if (variant === 'training') {
    const badge = new T.Group();
    root.add(badge);
    badge.rotation.y = -0.12;
    mesh(rounded(1.9, 2.2, 0.22), pearl, badge);
    const seal = mesh(track(new T.CylinderGeometry(0.56, 0.56, 0.16, 48)), blue, badge);
    seal.rotation.x = Math.PI / 2;
    seal.position.set(0, 0.12, 0.23);
    const checkPoints = [
      new T.Vector3(-0.27, 0.13, 0.36),
      new T.Vector3(-0.06, -0.08, 0.36),
      new T.Vector3(0.31, 0.32, 0.36),
    ];
    const check = mesh(
      track(new T.TubeGeometry(new T.CatmullRomCurve3(checkPoints), 20, 0.045, 8, false)),
      pearl,
      badge,
    );
    const ribbons: Three.Mesh[] = [];
    for (let i = 0; i < 2; i++) {
      const ribbon = mesh(rounded(0.25, 0.65, 0.08), i ? teal : blue, badge);
      ribbon.position.set(i ? 0.24 : -0.24, -0.58, 0.24);
      ribbon.rotation.z = i ? -0.12 : 0.12;
      ribbons.push(ribbon);
    }
    const orbit = torus(1.53, 0.026, teal);
    orbit.rotation.y = 0.35;
    return (time: number, _stage: number, paused: boolean, interaction: number) => {
      badge.position.y = paused ? 0 : Math.sin(time * 0.8) * 0.06;
      seal.position.z = 0.23 + (paused ? 0 : interaction * 0.16);
      check.position.z = paused ? 0 : interaction * 0.16;
      ribbons.forEach(
        (r, i) => (r.position.y = -0.58 + (paused ? 0 : Math.sin(time * 1.1 + i) * 0.04)),
      );
    };
  }
  // Tourism: many entries settle onto one shared timeline, rather than separate systems.
  const spine = mesh(rounded(2.8, 0.16, 0.3), pearl);
  spine.position.y = -0.85;
  const pages: Three.Mesh[] = [];
  for (let i = 0; i < 7; i++) {
    const page = mesh(rounded(0.1, 1.65, 1.25), i === 3 ? blue : i % 3 === 0 ? teal : pearl);
    page.position.set((i - 3) * 0.35, 0, 0);
    pages.push(page);
    const dot = mesh(sphere, i === 3 ? amber : teal);
    dot.position.set((i - 3) * 0.35, 0.98, 0);
    dot.scale.setScalar(0.6);
  }
  const sweep = torus(1.53, 0.028, amber);
  sweep.rotation.x = Math.PI / 2;
  sweep.position.y = -0.72;
  return (time: number, _stage: number, paused: boolean, interaction: number) => {
    pages.forEach((page, i) => {
      page.position.y = paused ? 0 : Math.sin(time * 0.9 - i * 0.4) * 0.07;
      page.position.x = (i - 3) * (0.35 + (paused ? 0 : interaction * 0.065));
    });
    sweep.scale.setScalar(paused ? 1 : 1 + Math.sin(time * 0.7) * 0.035);
  };
}
