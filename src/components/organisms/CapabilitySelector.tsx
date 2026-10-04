'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { CaseSculpture } from '@/components/three/CaseSculpture';

export interface Capability {
  n: string;
  title: string;
  body: string;
}
const groups = [
  {
    title: 'Build a system',
    description: 'Software for your team, customers, and partners.',
    indices: [0, 4, 8, 7],
  },
  {
    title: 'Connect and automate',
    description: 'Move information between tools. Reduce routine work.',
    indices: [1, 2, 3],
  },
  {
    title: 'AI in your workflow',
    description: 'AI inside your systems. People in control.',
    indices: [6],
  },
  {
    title: 'Keep it running',
    description: 'Hosting, monitoring, maintenance, and support after launch.',
    indices: [5],
  },
];
type Mode = 'tabs' | 'pinned' | 'flow';

export function CapabilitySelector({ offerings }: { offerings: Capability[] }) {
  const [active, setActive] = useState(0);
  const [mode, setMode] = useState<Mode>('tabs');
  const root = useRef<HTMLDivElement>(null);
  const tabs = useRef<HTMLDivElement>(null);
  const activeRef = useRef(0);
  const modeRef = useRef<Mode>('tabs');
  const step = useRef(600);
  const pinTop = useRef(100);
  const update = (index: number) => {
    if (index !== activeRef.current) {
      activeRef.current = index;
      setActive(index);
    }
  };

  useEffect(() => {
    const el = root.current;
    if (!el || !tabs.current) return;
    let frame = 0;
    const scroll = () => {
      frame = 0;
      if (modeRef.current === 'pinned') {
        const distance = Math.max(0, pinTop.current - el.getBoundingClientRect().top);
        update(Math.min(groups.length - 1, Math.floor(distance / step.current)));
      } else if (modeRef.current === 'flow') {
        let next = 0;
        el.querySelectorAll<HTMLElement>('[data-capability-chapter]').forEach((chapter, index) => {
          const readingLine =
            pinTop.current +
            tabs.current!.offsetHeight +
            el.querySelector<HTMLElement>('.capabilities-heading')!.offsetHeight +
            24;
          if (chapter.getBoundingClientRect().top <= readingLine) next = index;
        });
        update(next);
      }
    };
    const queue = () => {
      if (!frame) frame = requestAnimationFrame(scroll);
    };
    const measure = () => {
      const maxPanel = Math.max(
        ...Array.from(el.querySelectorAll<HTMLElement>('.capabilities-panel')).map(
          (panel) => panel.offsetHeight,
        ),
      );
      const top = innerWidth < 768 ? 86 : 100;
      const heading = el.querySelector<HTMLElement>('.capabilities-heading')!.offsetHeight;
      const height = heading + tabs.current!.offsetHeight + 24 + maxPanel + 40;
      el.style.setProperty('--capability-heading-height', `${heading}px`);
      const next: Mode = innerWidth >= 768 && height + top + 24 <= innerHeight ? 'pinned' : 'flow';
      step.current = Math.max(480, innerHeight * 0.72);
      pinTop.current = top;
      el.style.setProperty('--capability-panel-height', `${maxPanel}px`);
      el.style.setProperty('--capability-pin-top', `${top}px`);
      el.style.height = next === 'pinned' ? `${height + step.current * groups.length}px` : '';
      if (next !== modeRef.current) {
        modeRef.current = next;
        setMode(next);
      }
      queue();
    };
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    el.querySelectorAll('.capabilities-panel').forEach((panel) => observer.observe(panel));
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', measure);
    measure();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', queue);
      window.removeEventListener('resize', measure);
    };
  }, []);

  function select(index: number) {
    update(index);
    if (!root.current || modeRef.current === 'tabs') return;
    const position =
      modeRef.current === 'pinned'
        ? scrollY +
          root.current.getBoundingClientRect().top -
          pinTop.current +
          (index + 0.25) * step.current
        : scrollY +
          root.current
            .querySelector<HTMLElement>(`[data-capability-chapter="${index}"]`)!
            .getBoundingClientRect().top -
          pinTop.current -
          tabs.current!.offsetHeight -
          root.current.querySelector<HTMLElement>('.capabilities-heading')!.offsetHeight -
          16;
    window.scrollTo({ top: position, behavior: 'instant' });
  }

  return (
    <div ref={root} className={`capability-selector capability-mode-${mode}`}>
      <div className="capability-pin">
        <div className="capabilities-heading">
          <h2>Software for the work you do.</h2>
          <p>Custom systems, connected tools, and support after launch.</p>
        </div>
        <div
          ref={tabs}
          role={mode === 'flow' ? 'navigation' : 'tablist'}
          aria-label="Service areas"
          className="capability-tabs"
        >
          {groups.map((group, index) => (
            <button
              key={group.title}
              id={`capability-tab-${index}`}
              role={mode === 'flow' ? undefined : 'tab'}
              aria-selected={mode === 'flow' ? undefined : active === index}
              aria-current={mode === 'flow' && active === index ? 'step' : undefined}
              aria-controls={`capabilities-panel-${index}`}
              tabIndex={mode === 'flow' || active === index ? 0 : -1}
              onClick={() => select(index)}
              onKeyDown={(event) => {
                if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
                event.preventDefault();
                const next =
                  event.key === 'Home'
                    ? 0
                    : event.key === 'End'
                      ? groups.length - 1
                      : (index + (event.key === 'ArrowRight' ? 1 : -1) + groups.length) %
                        groups.length;
                select(next);
                document.getElementById(`capability-tab-${next}`)?.focus();
              }}
            >
              {group.title}
            </button>
          ))}
        </div>
        <div className="capability-panels">
          {groups.map((group, index) => {
            const hidden = mode !== 'flow' && active !== index;
            return (
              <div
                key={group.title}
                id={`capabilities-panel-${index}`}
                data-capability-chapter={index}
                role={mode === 'flow' ? 'region' : 'tabpanel'}
                aria-labelledby={`capability-tab-${index}`}
                aria-hidden={hidden || undefined}
                inert={hidden}
                tabIndex={hidden ? -1 : 0}
                className={`capability-chapter ${active === index ? 'is-active' : ''}`}
              >
                <h3 className="capability-chapter-title">{group.title}</h3>
                <div className="capabilities-panel">
                  <div className="capability-context">
                    {mode === 'flow' || active === index ? (
                      <CaseSculpture
                        variant={(['layers', 'automation', 'ai', 'hosting'] as const)[index]!}
                        className="capability-model"
                      />
                    ) : (
                      <div className="case-model capability-model" aria-hidden="true" />
                    )}
                    <p>{group.description}</p>
                    <Link href="/#contact" className="premium-button capability-cta">
                      Let’s build your system
                    </Link>
                  </div>
                  <div className="capability-services">
                    {group.indices.map((itemIndex) => {
                      const item = offerings[itemIndex];
                      return item ? (
                        <div key={item.n}>
                          <h3>{item.title}</h3>
                          <p>{item.body}</p>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {mode === 'pinned' && <p className="capability-scroll-hint">Scroll to explore each area</p>}
      </div>
    </div>
  );
}
