'use client';

import { useEffect, useRef, useState } from 'react';
import { createNarrativeModel, type NarrativeVariant } from './NarrativeModels';
import { getMotion, getTheme, subscribe } from '@/lib/prefs';

type CaseModel =
  | NarrativeVariant
  | 'layers'
  | 'network'
  | 'simplify'
  | 'scale'
  | 'secure'
  | 'process';

const accents: Record<CaseModel, [number, number]> = {
  layers: [0x234be8, 0x5274ff],
  network: [0x234be8, 0x5274ff],
  simplify: [0x218b7a, 0x46bda6],
  scale: [0xc58b32, 0xe7b65d],
  secure: [0x6c5bd6, 0x9b8af0],
  process: [0x234be8, 0x5274ff],
  construction: [0x234be8, 0x5274ff],
  flow: [0x234be8, 0x5274ff],
  automation: [0x234be8, 0x5274ff],
  hosting: [0x234be8, 0x5274ff],
  ai: [0x6c5bd6, 0x9b8af0],
  training: [0x234be8, 0x5274ff],
  tourism: [0x234be8, 0x5274ff],
  people: [0x234be8, 0x5274ff],
  revenue: [0x234be8, 0x5274ff],
  operations: [0x234be8, 0x5274ff],
  finance: [0x234be8, 0x5274ff],
  industry: [0x234be8, 0x5274ff],
  conversation: [0x234be8, 0x5274ff],
  questions: [0x234be8, 0x5274ff],
};

/** Lazy, local WebGL illustrations. Visible scenes breathe gently; offscreen and paused scenes stop. */
export function CaseSculpture({
  variant,
  className = '',
  stage = -1,
}: {
  variant: CaseModel;
  className?: string;
  stage?: number;
}) {
  const [canvasVersion, setCanvasVersion] = useState(0);
  const stageRef = useRef(stage);
  const redraw = useRef<(() => void) | undefined>(undefined);
  useEffect(() => {
    stageRef.current = stage;
    redraw.current?.();
  }, [stage]);
  const host = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = host.current;
    if (!container) return;
    container.dataset.ready = 'false';
    let disposed = false;
    let loaded = false;
    let generation = 0;
    let cleanup: (() => void) | undefined;
    let visible = false;
    let refresh: (() => void) | undefined;
    const entrance = new IntersectionObserver(
      ([entry]) => {
        visible = !!entry?.isIntersecting;
        if (visible && !loaded) {
          loaded = true;
          void mount(++generation).catch(() => {
            loaded = false;
          });
        } else if (!visible) {
          generation++;
          if (cleanup) {
            cleanup();
            setCanvasVersion((version) => version + 1);
          }
          cleanup = undefined;
          refresh = undefined;
          loaded = false;
          container.dataset.ready = 'false';
        }
        refresh?.();
      },
      { rootMargin: '0px' },
    );
    entrance.observe(container);

    async function mount(version: number) {
      const T = await import('three');
      if (disposed || version !== generation || !visible || !canvas.current || !container) return;
      const element = canvas.current;
      const card =
        container.closest<HTMLElement>(
          '.work-card, .principle-grid > div, .capability-context, .integration-strip, .process-overview',
        ) || container;
      let renderer: InstanceType<typeof T.WebGLRenderer>;
      try {
        renderer = new T.WebGLRenderer({ canvas: element, alpha: true, antialias: true });
      } catch {
        return;
      }
      renderer.setPixelRatio(Math.min(devicePixelRatio, innerWidth < 768 ? 1.25 : 1.6));
      renderer.toneMapping = T.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.25;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = T.PCFSoftShadowMap;
      const scene = new T.Scene();
      const camera = new T.PerspectiveCamera(34, 1, 0.1, 40);
      camera.position.set(4.5, 3.8, 6.2);
      camera.lookAt(0, 0.2, 0);
      if (variant === 'automation' || variant === 'flow') {
        camera.position.set(0, 0.3, 8.5);
        camera.lookAt(0, 0, 0);
      }
      if (container.classList.contains('capability-model')) {
        camera.zoom = 1.28;
        camera.updateProjectionMatrix();
      }
      scene.add(new T.HemisphereLight(0xffffff, 0x667dab, 3));
      if (['people', 'revenue', 'operations', 'finance', 'industry'].includes(variant)) {
        camera.zoom = 1.6;
        camera.updateProjectionMatrix();
      }
      if (variant === 'conversation') {
        camera.zoom = 1.25;
        camera.updateProjectionMatrix();
      }
      const key = new T.DirectionalLight(0xffffff, 4);
      key.position.set(3, 6, 4);
      key.castShadow = true;
      key.shadow.mapSize.set(512, 512);
      key.shadow.camera.left = -5;
      key.shadow.camera.right = 5;
      key.shadow.camera.top = 5;
      key.shadow.camera.bottom = -5;
      key.shadow.normalBias = 0.03;
      scene.add(key);
      const fill = new T.DirectionalLight(0x9bb8ff, 3);
      fill.position.set(-4, 2, 1);
      scene.add(fill);
      const root = new T.Group();
      scene.add(root);
      const blue = new T.MeshPhysicalMaterial({
        color: accents[variant][getTheme() === 'dark' ? 1 : 0],
        metalness: 0.3,
        roughness: 0.26,
        clearcoat: 1,
      });
      const silver = new T.MeshPhysicalMaterial({
        color: 0xe5e7e5,
        metalness: 0.45,
        roughness: 0.3,
        clearcoat: 0.6,
      });
      const geometries: InstanceType<typeof T.BufferGeometry>[] = [];
      function plate(size: number, depth: number) {
        const h = size / 2,
          r = Math.min(0.12, size / 8);
        const shape = new T.Shape();
        shape.moveTo(-h + r, -h);
        shape.lineTo(h - r, -h);
        shape.quadraticCurveTo(h, -h, h, -h + r);
        shape.lineTo(h, h - r);
        shape.quadraticCurveTo(h, h, h - r, h);
        shape.lineTo(-h + r, h);
        shape.quadraticCurveTo(-h, h, -h, h - r);
        shape.lineTo(-h, -h + r);
        shape.quadraticCurveTo(-h, -h, -h + r, -h);
        const geometry = new T.ExtrudeGeometry(shape, {
          depth,
          bevelEnabled: true,
          bevelSize: 0.04,
          bevelThickness: 0.04,
          bevelSegments: 2,
          curveSegments: 8,
        });
        geometry.center();
        geometry.rotateX(-Math.PI / 2);
        geometries.push(geometry);
        return geometry;
      }
      const plateGeometry = plate(2.4, 0.16);
      const layers: InstanceType<typeof T.Mesh>[] = [];
      const networkBodies: InstanceType<typeof T.Mesh>[] = [];
      const networkLinks: { mesh: InstanceType<typeof T.Mesh>; index: number }[] = [];
      const signals: {
        mesh: InstanceType<typeof T.Mesh>;
        path: InstanceType<typeof T.CatmullRomCurve3>;
        index: number;
      }[] = [];
      const networkColors = [0x234be8, 0x218b7a, 0xc58b32, 0x6c5bd6, 0xce715e].map(
        (hex) => new T.Color(hex),
      );
      const selection = Array.from({ length: 5 }, () => 0);
      const ownedMaterials: InstanceType<typeof T.Material>[] = [];
      let protection: InstanceType<typeof T.Mesh> | undefined;
      let narrative: ReturnType<typeof createNarrativeModel> | undefined;
      if (
        [
          'construction',
          'flow',
          'automation',
          'hosting',
          'ai',
          'training',
          'tourism',
          'people',
          'revenue',
          'operations',
          'finance',
          'industry',
          'conversation',
          'questions',
        ].includes(variant)
      ) {
        narrative = createNarrativeModel(
          T,
          variant as NarrativeVariant,
          root,
          blue,
          silver,
          geometries,
          ownedMaterials,
        );
      } else if (variant === 'layers' || variant === 'simplify') {
        for (let i = 0; i < (variant === 'simplify' ? 3 : 7); i++) {
          const mesh = new T.Mesh(plateGeometry, i % 2 ? blue : silver);
          mesh.position.set(
            i % 2 ? 0.1 : -0.1,
            (variant === 'simplify' ? -0.3 : -0.8) + i * 0.32,
            i % 3 === 0 ? 0.12 : -0.08,
          );
          mesh.scale.set(i === 0 ? 1.16 : 1, 1, i === 0 ? 1.16 : 1);
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          root.add(mesh);
          layers.push(mesh);
        }
      } else if (variant === 'scale') {
        const smallPlate = plate(0.9, 0.22);
        for (let column = 0; column < 3; column++) {
          for (let level = 0; level <= column + 1; level++) {
            const mesh = new T.Mesh(smallPlate, level % 2 ? silver : blue);
            mesh.position.set((column - 1) * 1.15, -0.6 + level * 0.35, 0);
            mesh.userData.column = column;
            mesh.userData.level = level;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            root.add(mesh);
            layers.push(mesh);
          }
        }
      } else if (variant === 'process') {
        const moduleGeometry = plate(0.85, 0.36);
        for (let i = 0; i < 4; i++) {
          const mesh = new T.Mesh(moduleGeometry, silver.clone());
          mesh.position.set((i - 1.5) * 1.08, -0.12, 0);
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          root.add(mesh);
          layers.push(mesh);
          if (i < 3) {
            const geometry = new T.CylinderGeometry(0.035, 0.035, 0.3, 8);
            geometries.push(geometry);
            const link = new T.Mesh(geometry, silver);
            link.rotation.z = Math.PI / 2;
            link.position.set((i - 1) * 1.08, -0.12, 0);
            root.add(link);
          }
        }
      } else if (variant === 'secure') {
        const bodyGeometry = plate(1.65, 0.5).clone();
        bodyGeometry.rotateX(Math.PI / 2);
        geometries.push(bodyGeometry);
        const body = new T.Mesh(bodyGeometry, blue);
        body.position.y = -0.2;
        body.castShadow = true;
        root.add(body);
        layers.push(body);
        const points = Array.from({ length: 33 }, (_, i) => {
          const angle = (i / 32) * Math.PI;
          return new T.Vector3(Math.cos(angle) * 0.55, 0.45 + Math.sin(angle) * 0.72, 0);
        });
        const archGeometry = new T.TubeGeometry(new T.CatmullRomCurve3(points), 40, 0.12, 8, false);
        geometries.push(archGeometry);
        const arch = new T.Mesh(archGeometry, silver);
        arch.castShadow = true;
        root.add(arch);
        layers.push(arch);
        const protectionGeometry = new T.TorusGeometry(1.1, 0.028, 8, 64);
        geometries.push(protectionGeometry);
        protection = new T.Mesh(protectionGeometry, silver);
        protection.rotation.x = Math.PI / 2;
        protection.position.y = -0.86;
        root.add(protection);
      } else {
        const bodyGeometry = plate(1.08, 0.48);
        const capGeometry = plate(1.14, 0.09);
        const positions = [
          [0, 0],
          [-1.65, -1.65],
          [1.65, -1.65],
          [-1.65, 1.65],
          [1.65, 1.65],
        ];
        positions.forEach(([x, z], i) => {
          const bodyMaterial = blue.clone();
          const capMaterial = silver.clone();
          ownedMaterials.push(bodyMaterial, capMaterial);
          const body = new T.Mesh(bodyGeometry, bodyMaterial);
          networkBodies.push(body);
          body.position.set(x!, 0, z!);
          body.castShadow = true;
          body.receiveShadow = true;
          if (i === 0) body.scale.set(1.25, 1, 1.25);
          root.add(body);
          const cap = new T.Mesh(capGeometry, capMaterial);
          cap.position.set(x!, 0.32, z!);
          cap.castShadow = true;
          if (i === 0) cap.scale.set(1.25, 1, 1.25);
          root.add(cap);
          layers.push(cap);
          if (i > 0) {
            const sx = Math.sign(x!),
              sz = Math.sign(z!);
            const points = [
              new T.Vector3(sx * 0.6, -0.04, 0),
              new T.Vector3(sx * 1.2, -0.04, 0),
              new T.Vector3(x!, -0.04, sz * 0.55),
              new T.Vector3(x!, -0.04, z!),
            ];
            const path = new T.CatmullRomCurve3(points);
            const geometry = new T.TubeGeometry(path, 24, 0.04, 6, false);
            const signalGeometry = new T.SphereGeometry(0.085, 10, 8);
            geometries.push(signalGeometry);
            const signalMaterial = blue.clone();
            signalMaterial.color.copy(networkColors[i]!);
            signalMaterial.emissive.copy(networkColors[i]!);
            signalMaterial.emissiveIntensity = 0.2;
            ownedMaterials.push(signalMaterial);
            const signal = new T.Mesh(signalGeometry, signalMaterial);
            root.add(signal);
            signals.push({ mesh: signal, path, index: i });
            geometries.push(geometry);
            const cableMaterial = silver.clone();
            ownedMaterials.push(cableMaterial);
            const cable = new T.Mesh(geometry, cableMaterial);
            networkLinks.push({ mesh: cable, index: i });
            cable.castShadow = true;
            root.add(cable);
          }
        });
        root.scale.setScalar(0.84);
      }
      const bases = layers.map((mesh) => ({
        position: mesh.position.clone(),
        scale: mesh.scale.clone(),
      }));
      const baseY = layers.map((mesh) => mesh.position.y);
      const groundGeometry = new T.PlaneGeometry(16, 16);
      geometries.push(groundGeometry);
      const shadow = new T.ShadowMaterial({ opacity: 0.12 });
      const ground = new T.Mesh(groundGeometry, shadow);
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = narrative
        ? -1.2
        : variant === 'layers' || variant === 'secure'
          ? -1.08
          : variant === 'scale'
            ? -0.78
            : -0.5;
      ground.receiveShadow = true;
      scene.add(ground);
      let paused = getMotion() === 'paused';
      let frame = 0,
        last = 0,
        x = 0,
        y = 0,
        amount = 0,
        time = 0;
      let targetX = 0,
        targetY = 0,
        targetAmount = 0;
      let interacting = false;
      const scroll = () => {
        if (!visible || interacting || disposed) return;
        const bounds = container.getBoundingClientRect();
        const progress = Math.max(
          0,
          Math.min(1, (innerHeight - bounds.top) / (innerHeight + bounds.height)),
        );
        targetX = (progress - 0.5) * 0.45;
        targetY = (progress - 0.5) * 0.2;
        targetAmount = progress * 0.35;
        schedule();
      };
      function draw() {
        root.position.y = paused ? 0 : Math.sin(time * 0.8) * 0.035;
        root.rotation.set(
          paused ? 0 : y * 0.12,
          (variant === 'automation' || variant === 'flow' ? 0 : -0.25) +
            (paused
              ? 0
              : variant === 'conversation' || variant === 'questions'
                ? time * 0.22
                : x * 0.12),
          0,
        );
        const unfold = paused
          ? 0
          : (1 + (variant === 'simplify' ? 1 : -1) * Math.cos((time * Math.PI) / 4.5)) / 2;
        signals.forEach(({ mesh, path, index }) => {
          const progress = (time * 0.24 + index * 0.23) % 1;
          path.getPointAt(progress, mesh.position);
          mesh.position.y += 0.045;
          mesh.visible =
            !paused &&
            (stageRef.current < 0 || stageRef.current === 0 || stageRef.current === index);
          mesh.scale.setScalar(0.65 + Math.sin(progress * Math.PI) * 0.35);
        });
        if (variant === 'network') {
          networkBodies.forEach((mesh, i) => {
            const target = stageRef.current === i ? 1 : 0;
            selection[i] = paused ? target : selection[i]! + (target - selection[i]!) * 0.09;
            mesh.position.y = paused ? 0 : selection[i]! * 0.12;
            const material = mesh.material as InstanceType<typeof T.MeshPhysicalMaterial>;
            material.color.lerp(
              stageRef.current < 0 || target ? networkColors[i]! : silver.color,
              paused ? 1 : 0.09,
            );
          });
          networkLinks.forEach(({ mesh, index }) => {
            const material = mesh.material as InstanceType<typeof T.MeshPhysicalMaterial>;
            material.color.lerp(
              stageRef.current === index || stageRef.current === 0
                ? networkColors[stageRef.current === 0 ? 0 : index]!
                : silver.color,
              paused ? 1 : 0.09,
            );
          });
        }
        layers.forEach((mesh, i) => {
          const lift = paused ? 0 : amount + (Math.sin(time * 1.1 + i * 0.28) + 1) * 0.16;
          if (variant === 'process') {
            const material = mesh.material as InstanceType<typeof T.MeshPhysicalMaterial>;
            const target = i <= stageRef.current ? blue.color : silver.color;
            material.color.lerp(target, paused ? 1 : 0.08);
          }
          mesh.position.y =
            baseY[i]! +
            (variant === 'network' && !paused ? selection[i]! * 0.35 : 0) +
            lift *
              (variant === 'layers' || variant === 'simplify'
                ? i * 0.055
                : variant === 'scale'
                  ? i * 0.012
                  : variant === 'secure'
                    ? i * 0.06
                    : variant === 'process'
                      ? i <= stageRef.current
                        ? 0.12
                        : 0.025
                      : 0.14);
        });
        layers.forEach((mesh, i) => {
          const base = bases[i]!;
          mesh.position.x = base.position.x;
          mesh.scale.copy(base.scale);
          if (paused) {
            mesh.rotation.y = 0;
            mesh.rotation.z = 0;
            return;
          }
          if (variant === 'layers' || variant === 'simplify') {
            // Open the construction, then return to a precise assembled stack.
            mesh.position.x += (i % 2 ? 1 : -1) * unfold * (variant === 'simplify' ? 0.65 : 0.18);
            mesh.position.y += i * unfold * (variant === 'simplify' ? 0.23 : 0.07);
            if (variant === 'simplify') mesh.rotation.y = (i - 1) * unfold * 0.18;
          } else if (variant === 'scale') {
            const column = mesh.userData.column as number;
            const rise = Math.pow((Math.sin(time * 0.9 - column * 0.65) + 1) / 2, 2);
            const level = mesh.userData.level as number;
            const growth = Math.min(1, Math.max(0.06, rise * 1.7 - level * 0.12));
            mesh.scale.y = growth;
            mesh.position.y = -0.6 + level * 0.35 * growth;
          } else if (variant === 'secure') {
            if (i === 1) {
              const closing = Math.max(0, 1 - Math.min(time / 1.6, 1));
              mesh.position.y += closing * 0.48;
              mesh.rotation.z = closing * -0.2;
            } else mesh.scale.multiplyScalar(1 + unfold * 0.025);
          } else if (variant === 'process' && i === stageRef.current) {
            mesh.position.y += unfold * 0.18;
          }
        });
        if (protection) protection.scale.setScalar(paused ? 1 : 1 + Math.sin(time * 0.95) * 0.07);
        narrative?.(time, stageRef.current, paused, amount);
        renderer.render(scene, camera);
      }
      function tick(now: number) {
        frame = 0;
        if (disposed || paused || !visible || document.hidden) return;
        const dt = Math.max(0, Math.min((now - last) / 1000, 0.05));
        const blend = 1 - Math.exp(-dt * 10);
        time += dt;
        last = now;
        x += (targetX - x) * blend;
        y += (targetY - y) * blend;
        amount += (targetAmount - amount) * blend;
        draw();
        schedule();
      }
      function schedule() {
        if (!frame && !paused && visible && !document.hidden && !disposed)
          frame = requestAnimationFrame(tick);
      }
      const move = (event: PointerEvent) => {
        if (event.pointerType === 'touch') return;
        interacting = true;
        const bounds = card.getBoundingClientRect();
        targetX = (event.clientX - bounds.left) / bounds.width - 0.5;
        targetY = (event.clientY - bounds.top) / bounds.height - 0.5;
        targetAmount = 1;
        schedule();
      };
      const enter = () => {
        interacting = true;
        targetAmount = 1;
        schedule();
      };
      const leave = () => {
        interacting = false;
        targetX = 0;
        targetY = 0;
        targetAmount = 0;
        scroll();
        schedule();
      };
      const prefs = () => {
        paused = getMotion() === 'paused';
        blue.color.setHex(accents[variant][getTheme() === 'dark' ? 1 : 0]);
        networkColors.forEach((color, index) => {
          color.setHex([0x234be8, 0x218b7a, 0xc58b32, 0x6c5bd6, 0xce715e][index]!);
          if (getTheme() === 'dark') color.lerp(new T.Color(0xffffff), 0.2);
        });
        shadow.opacity = getTheme() === 'dark' ? 0.06 : 0.12;
        if (paused) {
          cancelAnimationFrame(frame);
          frame = 0;
        }
        draw();
        schedule();
      };
      const resize = () => {
        const bounds = element.getBoundingClientRect();
        renderer.setSize(bounds.width, bounds.height, false);
        camera.aspect = bounds.width / Math.max(bounds.height, 1);
        camera.updateProjectionMatrix();
        draw();
      };
      refresh = () => {
        if (!visible || document.hidden) {
          cancelAnimationFrame(frame);
          frame = 0;
        } else {
          draw();
          scroll();
          schedule();
        }
      };
      redraw.current = () => {
        draw();
        schedule();
      };
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(container);
      const unsubscribe = subscribe(prefs);
      card.addEventListener('pointermove', move);
      card.addEventListener('pointerleave', leave);
      card.addEventListener('focusin', enter);
      card.addEventListener('focusout', leave);
      document.addEventListener('visibilitychange', refresh);
      window.addEventListener('scroll', scroll, { passive: true });
      resize();
      prefs();
      scroll();
      container.dataset.ready = 'true';
      cleanup = () => {
        cancelAnimationFrame(frame);
        resizeObserver.disconnect();
        unsubscribe();
        card.removeEventListener('pointermove', move);
        card.removeEventListener('pointerleave', leave);
        card.removeEventListener('focusin', enter);
        card.removeEventListener('focusout', leave);
        if (refresh) document.removeEventListener('visibilitychange', refresh);
        window.removeEventListener('scroll', scroll);
        redraw.current = undefined;
        if (variant === 'process')
          layers.forEach((mesh) => (mesh.material as InstanceType<typeof T.Material>).dispose());
        geometries.forEach((geometry) => geometry.dispose());
        ownedMaterials.forEach((material) => material.dispose());
        blue.dispose();
        silver.dispose();
        shadow.dispose();
        renderer.dispose();
        renderer.forceContextLoss();
      };
    }
    return () => {
      disposed = true;
      entrance.disconnect();
      cleanup?.();
    };
  }, [variant, canvasVersion]);

  return (
    <div
      ref={host}
      className={`case-model model-${variant} ${className}`}
      data-stage={stage}
      aria-hidden="true"
    >
      <div className="case-model-fallback">
        {variant === 'training' || variant === 'tourism' ? (
          <svg viewBox="0 0 240 240" className="case-fallback-art">
            {variant === 'training' ? (
              [0, 1, 2, 3].map((i) => (
                <rect
                  key={i}
                  x={36 + (i % 2) * 88}
                  y={36 + Math.floor(i / 2) * 88}
                  width="78"
                  height="78"
                  rx="10"
                  fill={
                    i === 0 ? 'var(--premium-blue)' : i === 3 ? '#218b7a' : 'var(--premium-raised)'
                  }
                  stroke="var(--premium-rule)"
                />
              ))
            ) : (
              <>
                <rect
                  x="40"
                  y="40"
                  width="160"
                  height="160"
                  rx="12"
                  fill="var(--premium-raised)"
                  stroke="var(--premium-rule)"
                />
                <path d="M52 40h136q12 0 12 12v30H40V52q0-12 12-12" fill="#218b7a" />
                <circle cx="120" cy="140" r="24" fill="var(--premium-blue)" />
              </>
            )}
          </svg>
        ) : (
          <>
            <i />
            <i />
            <i />
          </>
        )}
      </div>
      <canvas key={canvasVersion} ref={canvas} className="case-model-canvas" />
    </div>
  );
}
