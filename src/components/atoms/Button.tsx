import Link from 'next/link';
import { cn } from '@/lib/cn';
import type { ReactNode } from 'react';

export interface ButtonProps {
  children: ReactNode;
  href?: string;
  variant?: 'primary' | 'secondary';
  size?: 'default' | 'small';
  type?: 'button' | 'submit';
  onClick?: () => void;
  className?: string;
  /**
   * The trailing arrow. Defaults on for links at default size — they go
   * somewhere, and the arrow says so — and off for form buttons and the small
   * header CTA. Pass explicitly to override.
   */
  arrow?: boolean;
  /**
   * A contact topic code ("new", "connect", "vendor"). Emitted as data-topic;
   * the contact form listens for clicks on it and preselects the matching chip
   * — WCAG 2.2 SC 3.3.7, Redundant Entry. A data attribute rather than an
   * onClick keeps this a server component.
   */
  topic?: string | undefined;
}

/**
 * Atom. Minimum target 40px — above the 24px WCAG 2.2 AA floor (2.5.8).
 *
 * Renders a button when there is no href. With one it renders a link: next/link
 * for anything internal, a plain anchor with rel="noopener noreferrer" for
 * anything that leaves the site. Links navigate, buttons act — never swapped.
 *
 * Motion, all transform or colour so it stays off the main thread
 * (design.md §6), and all flattened by the global reduced-motion rule:
 * - colour and border ease over 200ms on the brand curve;
 * - the arrow slides 4px on hover over 200ms (the prototype's `.btn .ar` was
 *   350ms; shortened on review — hover feedback should feel instant);
 * - a press settles to 98% so the click is felt, then springs back.
 *
 * Primary is blueprint, and it never hovers to signal: the CTA is on every
 * screen, and signal is the scarcity token (design.md §1.2).
 */
export function Button({
  children,
  href,
  variant = 'primary',
  size = 'default',
  type = 'button',
  onClick,
  className,
  arrow,
  topic,
}: ButtonProps) {
  const showArrow = arrow ?? (Boolean(href) && size === 'default');

  const classes = cn(
    'group inline-flex items-center gap-3 rounded-full border font-medium tracking-tight',
    // `scale`, not `transform`: Tailwind v4's scale utilities set the standalone
    // CSS scale property, so transitioning `transform` left the press snapping.
    'transition-[background-color,border-color,color,scale] duration-200 ease-brand',
    'active:scale-[0.98] active:duration-100',
    size === 'small' ? 'min-h-10 px-4 text-caption' : 'min-h-12 px-[22px] text-sm',
    variant === 'primary'
      ? 'border-transparent bg-blueprint text-on-brand hover:bg-act-d'
      : 'border-line-2 text-ink hover:border-ink',
    className,
  );

  const content = (
    <>
      {children}
      {showArrow ? (
        <span
          aria-hidden="true"
          className="ease-brand transition-transform duration-200 group-hover:translate-x-1 group-focus-visible:translate-x-1"
        >
          &#8594;
        </span>
      ) : null}
    </>
  );

  if (href) {
    const internal = href.startsWith('/') || href.startsWith('#');
    if (internal) {
      return (
        <Link className={classes} href={href} data-topic={topic}>
          {content}
        </Link>
      );
    }
    return (
      <a className={classes} href={href} rel="noopener noreferrer">
        {content}
      </a>
    );
  }

  return (
    <button className={classes} type={type} onClick={onClick}>
      {content}
    </button>
  );
}
