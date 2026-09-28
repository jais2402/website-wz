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
}

/**
 * Atom. Minimum target 40px — above the 24px WCAG 2.2 AA floor (2.5.8).
 *
 * Renders a button when there is no href. With one it renders a link: next/link
 * for anything internal, a plain anchor with rel="noopener noreferrer" for
 * anything that leaves the site. Links navigate, buttons act — never swapped.
 */
export function Button({
  children,
  href,
  variant = 'primary',
  size = 'default',
  type = 'button',
  onClick,
  className,
}: ButtonProps) {
  const classes = cn(
    'inline-flex items-center gap-3 rounded-[2px] border font-medium tracking-tight',
    'transition-colors duration-300 ease-[var(--ease-brand)]',
    size === 'small' ? 'min-h-[38px] px-4 text-[13px]' : 'min-h-12 px-[22px] text-sm',
    variant === 'primary'
      ? 'border-transparent bg-ink text-ground hover:bg-signal hover:text-[#15171a]'
      : 'border-line-2 text-ink hover:border-ink',
    className,
  );

  if (href) {
    const internal = href.startsWith('/') || href.startsWith('#');
    if (internal) {
      return (
        <Link className={classes} href={href}>
          {children}
        </Link>
      );
    }
    return (
      <a className={classes} href={href} rel="noopener noreferrer">
        {children}
      </a>
    );
  }

  return (
    <button className={classes} type={type} onClick={onClick}>
      {children}
    </button>
  );
}
