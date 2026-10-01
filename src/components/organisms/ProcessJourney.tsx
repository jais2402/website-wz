'use client';

import { useEffect, useRef, useState } from 'react';
import { CaseSculpture } from '@/components/three/CaseSculpture';

export interface ProcessStep {
  n: string;
  title: string;
  body: string;
  output: string;
}

/** Scroll selects discrete chapters; content stays in normal document flow. */
export function ProcessJourney({ steps }: { steps: ProcessStep[] }) {
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const chapters = Array.from(el.querySelectorAll<HTMLElement>('[data-process-step]'));
    let frame = 0;
    const measure = () => {
      frame = 0;
      const bounds = el.getBoundingClientRect();
      if (bounds.bottom < 0 || bounds.top > innerHeight) return;
      let nearest = 0,
        distance = Infinity;
      chapters.forEach((chapter, index) => {
        const rect = chapter.getBoundingClientRect();
        const delta = Math.abs(rect.top + rect.height / 2 - innerHeight * 0.55);
        if (delta < distance) {
          distance = delta;
          nearest = index;
        }
      });
      setActive(nearest);
    };
    const queue = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);
    queue();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', queue);
      window.removeEventListener('resize', queue);
    };
  }, []);

  function select(index: number) {
    setActive(index);
    const reduced =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      document.documentElement.dataset.motion === 'paused';
    root.current
      ?.querySelector<HTMLElement>(`[data-process-step="${index}"]`)
      ?.scrollIntoView({ block: 'center', behavior: reduced ? 'instant' : 'smooth' });
  }
  return (
    <div ref={root} className="process-journey">
      <aside className="process-overview">
        <nav aria-label="Delivery stages" className="process-navigation">
          {steps.map((step, index) => (
            <button
              key={step.title}
              aria-current={active === index ? 'step' : undefined}
              onClick={() => select(index)}
            >
              {step.title}
            </button>
          ))}
        </nav>
        <CaseSculpture variant="construction" stage={active} className="process-model" />
        <p className="process-current-output">{steps[active]?.output}</p>
      </aside>
      <div className="process-chapters">
        {steps.map((step, index) => (
          <article
            key={step.title}
            id={`process-${step.title.toLowerCase()}`}
            data-process-step={index}
            className={active === index ? 'is-current' : ''}
          >
            <h3>{step.title}</h3>
            <p>{step.body}</p>
            <p className="process-output">{step.output}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
