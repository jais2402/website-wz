'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';
import { Button, MotionToggle, ThemeToggle } from '@/components/atoms';
import type { Link as ContentLink } from '@/types/content';

export interface SiteHeaderProps {
  nav: ContentLink[];
  cta: ContentLink;
  /** The visual wordmark — lowercase "wezigns" per the approved design. */
  wordmark: string;
  /** The accessible name — the entity name, exactly "Wezigns". */
  name: string;
  since: number;
}

/** The section id a nav link points at: "/#build" → "build", "/work" → "work". */
function targetOf(href: string): string {
  const hash = href.split('#')[1];
  if (hash) return hash;
  return href.replace(/\/+$/, '').split('/').pop() ?? '';
}

/**
 * Organism. Sticky header: wordmark, nav with scroll-spy, progress, controls, CTA.
 *
 * Parity with the prototype:
 * - The bar is transparent at the top of the page and takes its blurred
 *   background once the reader has scrolled past 20px.
 * - The nav link for the section in view is underlined. "In view" means the
 *   last section whose top has passed the middle of the viewport, and a link is
 *   current only if that section is exactly its target — the prototype's rule.
 * - Controls in the order motion, then theme, then the CTA.
 *
 * The CTA is persistent — "Tell us what is not working" is the highest-recall
 * string the brand owns (context.md §5). The contact link staying in the same
 * place on every route also satisfies WCAG 2.2 SC 3.2.6, Consistent Help.
 *
 * One scroll listener, rAF-throttled — the single rAF loop architecture.md §1
 * allows for scroll-position work. It reads, it never writes layout.
 */
export function SiteHeader({ nav, cta, wordmark, name, since }: SiteHeaderProps) {
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stuck, setStuck] = useState(false);
  const [current, setCurrent] = useState<string | null>(null);

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('main section[id]'));
    let frame = 0;
    function update() {
      frame = 0;
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, y / max) : 0);
      setStuck(y > 20);
      const mid = window.innerHeight * 0.5;
      let cur: string | null = null;
      for (const s of sections) if (s.getBoundingClientRect().top <= mid) cur = s.id;
      setCurrent(cur);
    }
    function onScroll() {
      if (!frame) frame = requestAnimationFrame(update);
    }
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
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
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-40 border-b transition-[background-color,border-color] duration-[400ms] ease-[var(--ease-brand)]',
        stuck || open
          ? 'border-line bg-ground-a backdrop-blur-[14px]'
          : 'border-transparent bg-transparent',
      )}
    >
      <div className="relative flex h-[76px] items-center gap-[18px] pl-[max(24px,5.4vw)] pr-6">
        <Link href="/" aria-label={name} className="flex flex-none items-baseline gap-2.5 py-2">
          <b className="text-[21px] font-semibold tracking-[-0.045em] text-ink">{wordmark}</b>
          <span className="hidden font-mono text-[10px] tracking-[0.12em] text-ink-3 sm:inline">
            SINCE {since}
          </span>
        </Link>

        <nav aria-label="Primary" className="ml-auto mr-2.5 hidden lg:block">
          <ul className="flex items-center gap-6">
            {nav.map((item) => {
              const isCurrent = current !== null && targetOf(item.href) === current;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isCurrent ? 'location' : undefined}
                    className={cn(
                      'inline-flex min-h-10 items-center text-[13px] text-ink-2',
                      // The underline grows from the left, as in the prototype.
                      'bg-[linear-gradient(var(--color-ink),var(--color-ink))] bg-[length:0_1px] bg-left-bottom bg-no-repeat',
                      'transition-[color,background-size] duration-200 ease-[var(--ease-brand)]',
                      'hover:bg-[length:100%_1px] hover:text-ink',
                      isCurrent && 'bg-[length:100%_1px] text-ink',
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <MotionToggle />
          <ThemeToggle />
          <Button href={cta.href} size="small" className="hidden sm:inline-flex">
            {cta.label}
          </Button>
          <button
            type="button"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex size-10 items-center justify-center rounded-full border border-line-2 text-ink lg:hidden"
          >
            <span
              aria-hidden="true"
              className="block h-[11px] w-[15px] bg-[linear-gradient(currentColor,currentColor),linear-gradient(currentColor,currentColor),linear-gradient(currentColor,currentColor)] bg-[length:100%_1.5px] bg-[position:0_0,0_4.75px,0_9.5px] bg-no-repeat"
            />
            <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
          </button>
        </div>

        {/* Scroll progress. Decorative: the page itself conveys the position. */}
        <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 -bottom-px h-0.5">
          <span
            className="block h-full origin-left bg-blueprint"
            style={{ transform: `scaleX(${progress})` }}
          />
        </span>
      </div>

      <nav
        id="mobile-nav"
        aria-label="Primary"
        className={cn(
          'border-t border-line bg-ground px-[max(24px,5.4vw)] pb-6 lg:hidden',
          open ? 'grid' : 'hidden',
        )}
      >
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className="border-b border-line py-[15px] text-[18px] text-ink"
          >
            {item.label}
          </Link>
        ))}
        <Button href={cta.href} className="mt-5 justify-center">
          {cta.label}
        </Button>
      </nav>
    </header>
  );
}
