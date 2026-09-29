import { cn } from '@/lib/cn';

export interface TextLinkProps {
  children: string;
  href: string;
  external?: boolean;
  className?: string;
}

/** Atom. The quiet tertiary action: underlined in the company blue, arrow grows on hover. */
export function TextLink({ children, href, external = false, className }: TextLinkProps) {
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={cn(
        'group inline-flex items-center gap-2.5 border-b border-blueprint pb-1 text-sm text-ink',
        'transition-[gap] duration-300 ease-[var(--ease-brand)] hover:gap-4',
        className,
      )}
    >
      {children}
      <span aria-hidden="true">&#8594;</span>
    </a>
  );
}
