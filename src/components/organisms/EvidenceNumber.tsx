'use client';

import { useEffect, useRef } from 'react';
import { getMotion, subscribe } from '@/lib/prefs';

/** Count quantities once on entry; keep the announced fact and calendar year stable. */
export function EvidenceNumber({ value, count = true }: { value: string; count?: boolean }) {
  const number = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = number.current;
    if (!el) return;
    let frame = 0;
    let animation: Animation | undefined;
    const finish = () => {
      cancelAnimationFrame(frame);
      animation?.cancel();
      el.textContent = value;
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        if (getMotion() === 'paused') return;
        if (!count) {
          animation = el.animate(
            [
              { opacity: 0.45, transform: 'translateY(8px)' },
              { opacity: 1, transform: 'none' },
            ],
            { duration: 650, easing: 'cubic-bezier(0.16,1,0.3,1)' },
          );
          return;
        }
        const target = parseInt(value, 10),
          suffix = value.replace(/^\d+/, '');
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min(1, (now - start) / 850);
          el.textContent = `${Math.round(target * (1 - Math.pow(1 - progress, 3)))}${suffix}`;
          if (progress < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.7 },
    );
    observer.observe(el);
    const unsubscribe = subscribe(() => {
      if (getMotion() === 'paused') finish();
    });
    return () => {
      observer.disconnect();
      unsubscribe();
      finish();
    };
  }, [value, count]);
  return (
    <b className="evidence-number">
      <span className="evidence-fact">{value}</span>
      <span ref={number} aria-hidden="true">
        {value}
      </span>
    </b>
  );
}
