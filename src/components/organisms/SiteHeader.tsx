'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { MotionToggle, ThemeToggle } from '@/components/atoms';
import type { Link as ContentLink } from '@/types/content';

export interface SiteHeaderProps {
  nav: ContentLink[];
  cta: ContentLink & { short?: string | undefined };
  wordmark: string;
  name: string;
  since: number;
}
export function SiteHeader({ nav, cta, wordmark, name }: SiteHeaderProps) {
  const [open, setOpen] = useState(false);
  const menu = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        toggle.current?.focus();
      }
      if (event.key === 'Tab') {
        const links = Array.from(menu.current?.querySelectorAll<HTMLElement>('a') ?? []);
        const first = toggle.current,
          last = links.at(-1);
        if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);
  return (
    <header className={`premium-header ${open ? 'menu-open' : ''}`}>
      <Link href="/" className="premium-logo" aria-label={name}>
        <span className="brand-symbol" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        {wordmark}
      </Link>
      <nav className="desktop-navigation" aria-label="Primary">
        {nav
          .filter((item) => item.label !== 'The range')
          .map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
      </nav>
      <div className="header-actions">
        <MotionToggle />
        <ThemeToggle className="header-theme-toggle" />
        <Link href={cta.href} className="header-contact">
          <span className="header-cta-full">{cta.label}</span>
          <span className="header-cta-short">{cta.short ?? cta.label}</span>
        </Link>
        <button
          ref={toggle}
          className="menu-toggle"
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="premium-menu"
        >
          <span />
          <span />
        </button>
      </div>
      <div ref={menu} id="premium-menu" className="premium-menu" inert={!open}>
        <nav aria-label="Mobile primary">
          {nav.map((item, i) => (
            <Link
              style={{ transitionDelay: `${i * 45}ms` }}
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link href={cta.href} className="premium-button" onClick={() => setOpen(false)}>
          {cta.label}
        </Link>
      </div>
    </header>
  );
}
