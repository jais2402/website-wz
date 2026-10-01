'use client';

import { useEffect, useRef } from 'react';
import { getMotion, subscribe } from '@/lib/prefs';

/** A locally rendered system: three interlocking frames, a shared core. */
export function SystemSculpture({
  expanded,
  enabled = true,
}: {
  expanded: boolean;
  enabled?: boolean;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const target = useRef(expanded);
  const refresh = useRef<(() => void) | null>(null);
  useEffect(() => {
    target.current = expanded;
    refresh.current?.();
  }, [expanded]);

  useEffect(() => {
    if (!enabled && window.matchMedia('(max-width: 767px)').matches) return;
    let cancelled = false;
    let cleanup: (() => void) | undefined;
    async function mount() {
      const T = await import('three');
      if (cancelled || !canvas.current) return;
      const element = canvas.current;
      let renderer: InstanceType<typeof T.WebGLRenderer>;
      try {
        renderer = new T.WebGLRenderer({ canvas: element, alpha: true, antialias: true });
      } catch {
        return;
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
      renderer.setClearColor(0x000000, 0);
      renderer.toneMapping = T.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.4;
      const scene = new T.Scene();
      const camera = new T.PerspectiveCamera(34, 1, 0.1, 100);
      camera.position.set(0, 0.7, 10.4);
      camera.lookAt(0, 0, 0);
      scene.add(new T.HemisphereLight(0xf8faff, 0x4965af, 3));
      const key = new T.DirectionalLight(0xffffff, 5);
      key.position.set(2, 5, 4);
      scene.add(key);
      const fill = new T.DirectionalLight(0x799cff, 4);
      fill.position.set(-5, 1, 2);
      scene.add(fill);
      const edge = new T.DirectionalLight(0xffffff, 4);
      edge.position.set(0, -2, -4);
      scene.add(edge);
      const root = new T.Group();
      scene.add(root);
      function roundedPath(size: number, radius: number) {
        const p = new T.Shape();
        const s = size / 2;
        const r = radius;
        p.moveTo(-s + r, -s);
        p.lineTo(s - r, -s);
        p.quadraticCurveTo(s, -s, s, -s + r);
        p.lineTo(s, s - r);
        p.quadraticCurveTo(s, s, s - r, s);
        p.lineTo(-s + r, s);
        p.quadraticCurveTo(-s, s, -s, s - r);
        p.lineTo(-s, -s + r);
        p.quadraticCurveTo(-s, -s, -s + r, -s);
        return p;
      }
      const shape = roundedPath(3.15, 0.62);
      const hole = roundedPath(2.22, 0.35);
      shape.holes.push(hole);
      const geo = new T.ExtrudeGeometry(shape, {
        depth: 0.34,
        bevelEnabled: true,
        bevelSegments: 4,
        steps: 1,
        bevelSize: 0.09,
        bevelThickness: 0.09,
        curveSegments: 24,
      });
      geo.center();
      const blue = new T.MeshPhysicalMaterial({
        color: 0x2448e9,
        roughness: 0.23,
        metalness: 0.35,
        clearcoat: 1,
        clearcoatRoughness: 0.15,
      });
      const pearl = new T.MeshPhysicalMaterial({
        color: 0xe8edfa,
        roughness: 0.28,
        metalness: 0.25,
        clearcoat: 0.8,
      });
      const pale = new T.MeshPhysicalMaterial({
        color: 0x9db5ff,
        roughness: 0.26,
        metalness: 0.3,
        clearcoat: 1,
      });
      const frames = [blue, pearl, pale].map((material, i) => {
        const m = new T.Mesh(geo, material);
        m.rotation.x = Math.PI / 2;
        m.rotation.z = (i * Math.PI) / 3;
        m.position.y = (i - 1) * 0.68;
        root.add(m);
        return m;
      });
      const coreGeo = new T.IcosahedronGeometry(0.65, 0);
      const core = new T.Mesh(coreGeo, blue);
      root.add(core);
      const satelliteGeo = new T.IcosahedronGeometry(0.16, 0);
      const satellites = Array.from({ length: 5 }, (_, i) => {
        const m = new T.Mesh(satelliteGeo, i % 2 ? pearl : blue);
        const angle = (i * Math.PI * 2) / 5;
        m.position.set(Math.cos(angle) * 2.35, ((i % 3) - 1) * 1.25, Math.sin(angle) * 1.3);
        root.add(m);
        return m;
      });
      root.rotation.set(0.3, -0.55, -0.28);
      let pointerX = 0,
        pointerY = 0,
        spread = 0,
        frame = 0,
        time = 0,
        last = 0;
      let paused = getMotion() === 'paused';
      const unsubscribe = subscribe(() => {
        paused = getMotion() === 'paused';
        draw(performance.now());
        if (paused) {
          cancelAnimationFrame(frame);
          frame = 0;
        } else schedule();
      });
      const move = (event: PointerEvent) => {
        const bounds = element.getBoundingClientRect();
        pointerX = (event.clientX - bounds.left) / bounds.width - 0.5;
        pointerY = (event.clientY - bounds.top) / bounds.height - 0.5;
        if (paused) draw(performance.now());
      };
      const leave = () => {
        pointerX = 0;
        pointerY = 0;
      };
      const resize = () => {
        const { width, height } = element.getBoundingClientRect();
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.render(scene, camera);
      };
      const observer = new ResizeObserver(resize);
      observer.observe(element);
      let visible = true;
      const intersection = new IntersectionObserver(([entry]) => {
        visible = !!entry?.isIntersecting;
        if (!visible) {
          cancelAnimationFrame(frame);
          frame = 0;
        } else schedule();
      });
      intersection.observe(element);
      function draw(now: number) {
        const dt = Math.min((now - last) / 1000, 0.04);
        last = now;
        if (!paused && visible) time += dt;
        spread += ((target.current ? 1 : 0) - spread) * (paused ? 1 : 1 - Math.exp(-dt * 5));
        const breathe = paused ? 0 : (1 - Math.cos(time * 0.65)) * 0.1;
        frames.forEach((m, i) => {
          m.position.y = (i - 1) * (0.68 + spread * 0.58 + breathe);
          m.position.x = paused ? 0 : (i - 1) * breathe * 0.45;
          m.rotation.z = (i * Math.PI) / 3;
        });
        root.rotation.y += (-0.55 + pointerX * 0.4 - root.rotation.y) * 0.05;
        root.rotation.x += (0.3 + pointerY * 0.2 - root.rotation.x) * 0.05;
        root.position.y = paused ? 0 : Math.sin(time * 0.7) * 0.09;
        core.scale.setScalar(1 + spread * 0.18 + breathe * 0.2);
        satellites.forEach((m, i) => {
          const angle = (i * Math.PI * 2) / 5;
          const drift = paused ? 0 : Math.sin(time * 0.7 + i * 0.8) * 0.16;
          m.position.set(
            Math.cos(angle) * (2.35 + drift),
            ((i % 3) - 1) * 1.25 + drift,
            Math.sin(angle) * 1.3,
          );
          m.rotation.z = i;
        });
        if (visible) renderer.render(scene, camera);
      }
      function schedule() {
        if (!frame && visible && !paused && !cancelled && !document.hidden)
          frame = requestAnimationFrame(loop);
      }
      function loop(now: number) {
        frame = 0;
        if (!visible || paused || cancelled || document.hidden) return;
        draw(now);
        schedule();
      }
      const visibility = () => {
        if (document.hidden) {
          cancelAnimationFrame(frame);
          frame = 0;
        } else {
          last = performance.now();
          schedule();
        }
      };
      document.addEventListener('visibilitychange', visibility);
      refresh.current = () => {
        if (paused) draw(performance.now());
      };
      resize();
      draw(performance.now());
      schedule();
      element.classList.add('sculpture-ready');
      element.addEventListener('pointermove', move);
      element.addEventListener('pointerleave', leave);
      cleanup = () => {
        refresh.current = null;
        cancelAnimationFrame(frame);
        observer.disconnect();
        intersection.disconnect();
        unsubscribe();
        document.removeEventListener('visibilitychange', visibility);
        element.removeEventListener('pointermove', move);
        element.removeEventListener('pointerleave', leave);
        geo.dispose();
        coreGeo.dispose();
        satelliteGeo.dispose();
        blue.dispose();
        pearl.dispose();
        pale.dispose();
        renderer.dispose();
        renderer.forceContextLoss();
      };
    }
    const idle = window.requestIdleCallback
      ? window.requestIdleCallback(() => void mount(), { timeout: 1500 })
      : window.setTimeout(() => void mount(), 300);
    return () => {
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
      cancelled = true;
      cleanup?.();
    };
  }, [enabled]);
  return <canvas ref={canvas} className="system-sculpture" aria-hidden="true" />;
}
