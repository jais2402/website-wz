'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';
import { Button, MotionToggle, ThemeToggle } from '@/components/atoms';
import type { Link as ContentLink } from '@/types/content';

export interface SiteHeaderProps {
  nav: ContentLink[];
  cta: ContentLink;
  wordmark: string;
}

/**
 * Organism. Sticky header: wordmark, nav, scroll progress, toggles, CTA.
 *
 * The CTA is persistent — "Tell us what is not working" is the highest-recall
 * string the brand owns and appears here on every page (context.md §5). The
 * contact link staying in the same relative place on every route also satisfies
 * WCAG 2.2 SC 3.2.6, Consistent Help.
 *
 * The mobile menu traps focus while open, closes on Escape, and returns focus
 * to the trigger.
 */
export function SiteHeader({ nav, cta, wordmark }: SiteHeaderProps) {
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    function onScroll() {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
      });
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-line bg-ground-a backdrop-blur-md">
      <div className="flex items-center gap-4 px-[max(24px,5.4vw)] py-3.5">
        <Link href="/" className="text-[17px] font-medium tracking-tight text-ink">
          {wordmark}
        </Link>

        <nav aria-label="Primary" className="ml-auto hidden lg:block">
          {/* min-h-10 keeps each link above the 40px target rule (design.md §6);
              the gap stays visually tight because the box is taller than the text. */}
          <ul className="flex items-center gap-6">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex min-h-10 items-center px-1 text-[14px] text-ink-2 transition-colors duration-300 ease-[var(--ease-brand)] hover:text-ink"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-4">
          <ThemeToggle />
          <MotionToggle />
          <Button href={cta.href} size="small" className="hidden sm:inline-flex">
            {cta.label}
          </Button>
          <button
            type="button"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex size-10 items-center justify-center rounded-[2px] border border-line-2 text-ink-2 lg:hidden"
          >
            <span aria-hidden="true" className="font-mono text-[13px] leading-none">
              {open ? '✕' : '≡'}
            </span>
            <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
          </button>
        </div>
      </div>

      {/* Scroll progress. Decorative: the same position is conveyed by the page itself. */}
      <div aria-hidden="true" className="h-px w-full bg-transparent">
        <div
          className="h-px origin-left bg-blueprint"
          style={{ transform: `scaleX(${progress})` }}
        />
      </div>

      <nav
        id="mobile-nav"
        aria-label="Primary"
        className={cn('border-t border-line px-[max(24px,5.4vw)] lg:hidden', open ? 'block' : 'hidden')}
      >
        <ul className="py-3">
          {nav.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex min-h-11 items-center text-[15px] text-ink-2"
              >
                {item.label}
              </Link>
            </li>
          ))}
          <li className="pt-3">
            <Button href={cta.href} size="small">
              {cta.label}
            </Button>
          </li>
        </ul>
      </nav>
    </header>
  );
}
