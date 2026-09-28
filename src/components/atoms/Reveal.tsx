'use client';

import { useEffect, type ReactNode } from 'react';
import { useAnimate } from 'motion/react-mini';
import { cn } from '@/lib/cn';

export interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Seconds between each direct child. 0 animates the wrapper as one piece. */
  stagger?: number;
  /** Seconds before the first child starts. */
  delay?: number;
}

const EASE = [0.22, 0.61, 0.36, 1] as const; // --ease-brand
const RISE = 12; // px — a short rise reads as settling, a long one as arriving late

/**
 * Atom (client). Fades content up as it enters the viewport, children in turn.
 *
 * Built on `motion/react-mini` — Motion's WAAPI build, 2.9 KB — per the
 * motion-framer skill's guidance: transform and opacity only, so the work stays
 * on the compositor (design.md §6). The full `motion` component was measured at
 * 37 KB and would break the 180 KB initial-route budget; see journal.md.
 *
 * **Visible by default.** The server renders plain, visible content, and
 * nothing is hidden until JS runs AND the element is below the fold. So the
 * page is complete with JS off, content the reader can already see never
 * flickers, and a failure here costs an animation, never content.
 *
 * Skipped entirely under prefers-reduced-motion and when motion is paused.
 */
export function Reveal({ children, className, stagger = 0.07, delay = 0 }: RevealProps) {
  const [scope, animate] = useAnimate<HTMLDivElement>();

  useEffect(() => {
    const el = scope.current;
    if (!el) return;
    const root = document.documentElement;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (root.dataset.motion === 'paused') return;
    // Never hide what the reader can already see.
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;

    const targets = (stagger > 0 ? Array.from(el.children) : [el]) as HTMLElement[];
    for (const t of targets) {
      t.style.opacity = '0';
      t.style.transform = `translateY(${RISE}px)`;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        observer.disconnect();
        targets.forEach((t, i) => {
          void animate(
            t,
            { opacity: [0, 1], transform: [`translateY(${RISE}px)`, 'translateY(0px)'] },
            { duration: 0.6, delay: delay + i * stagger, ease: EASE },
          ).then(() => {
            // Hand the element back to CSS: no lingering inline transform to
            // create a containing block or fight a hover state.
            t.style.opacity = '';
            t.style.transform = '';
          });
        });
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0 },
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      for (const t of targets) {
        t.style.opacity = '';
        t.style.transform = '';
      }
    };
  }, [animate, scope, stagger, delay]);

  return (
    <div ref={scope} className={cn(className)}>
      {children}
    </div>
  );
}
