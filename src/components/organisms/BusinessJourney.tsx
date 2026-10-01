'use client';

import Link from 'next/link';
import { CaseSculpture } from '@/components/three/CaseSculpture';
const models = ['people', 'revenue', 'operations', 'finance', 'industry'] as const;
import { useEffect, useRef, useState } from 'react';

type BusinessArea = { title: string; systems: string[] };

export function BusinessJourney({ areas }: { areas: BusinessArea[] }) {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const chapters = root.current?.querySelectorAll<HTMLElement>('[data-business-area]');
    if (!chapters) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const current = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (current) setActive(Number((current.target as HTMLElement).dataset.businessArea));
      },
      { rootMargin: '-25% 0px -40% 0px', threshold: [0, 0.2, 0.5] },
    );
    chapters.forEach((chapter) => observer.observe(chapter));
    return () => observer.disconnect();
  }, []);

  function select(index: number) {
    setActive(index);
    const reduced =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      document.documentElement.dataset.motion === 'paused';
    root.current
      ?.querySelector<HTMLElement>(`[data-business-area="${index}"]`)
      ?.scrollIntoView({ block: 'center', behavior: reduced ? 'instant' : 'smooth' });
  }

  return (
    <div className="business-journey" id="range" ref={root}>
      <aside className="business-overview">
        <h3>Across your business</h3>
        <p>From the people you hire to the orders you fulfil.</p>
        <nav aria-label="Business areas">
          {areas.map((area, index) => (
            <button
              key={area.title}
              aria-current={active === index ? 'step' : undefined}
              onClick={() => select(index)}
            >
              <span className={index <= active ? 'is-connected' : ''} aria-hidden="true" />
              {area.title}
            </button>
          ))}
        </nav>
      </aside>
      <div className="business-chapters">
        {areas.map((area, index) => (
          <article
            key={area.title}
            data-business-area={index}
            className={active === index ? 'is-current' : ''}
          >
            <CaseSculpture variant={models[index % models.length]!} className="business-model" />
            <h4>{area.title}</h4>
            <ul>
              {area.systems.map((system) => (
                <li key={system}>{system}</li>
              ))}
            </ul>
            <Link className="quiet-link" href="/capabilities#range">
              Explore these systems
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
