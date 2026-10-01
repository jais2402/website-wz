'use client';

import { useCallback, useEffect, useRef, type ReactNode } from 'react';
import { getMotion, subscribe } from '@/lib/prefs';

/** Native disclosure semantics, with an interruptible open/close transition. */
export function AnimatedDisclosure({
  title,
  children,
  className = '',
  group,
  onExpandedChange,
}: {
  title: string;
  children: ReactNode;
  className?: string;
  group: string;
  onExpandedChange?: (expanded: boolean) => void;
}) {
  const root = useRef<HTMLDetailsElement>(null);
  const summary = useRef<HTMLElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const animation = useRef<Animation | null>(null);
  const desired = useRef(false);
  const expandedCallback = useRef(onExpandedChange);
  useEffect(() => {
    expandedCallback.current = onExpandedChange;
  }, [onExpandedChange]);

  const settle = useCallback(() => {
    animation.current?.cancel();
    animation.current = null;
    if (!root.current) return;
    root.current.open = desired.current;
    root.current.style.height = '';
    root.current.style.overflow = '';
  }, []);
  const transition = useCallback(
    (expanded: boolean) => {
      const el = root.current;
      if (!el || !summary.current || !body.current) return;
      const start = el.getBoundingClientRect().height;
      desired.current = expanded;
      expandedCallback.current?.(expanded);
      if (expanded) {
        document.dispatchEvent(
          new CustomEvent('wezigns:disclosure-open', {
            detail: { group, element: el },
          }),
        );
      }
      animation.current?.cancel();
      if (getMotion() === 'paused') {
        settle();
        return;
      }
      el.open = true;
      const end =
        summary.current.getBoundingClientRect().height +
        (desired.current ? body.current.getBoundingClientRect().height : 0) +
        1;
      el.style.overflow = 'hidden';
      const next = el.animate([{ height: `${start}px` }, { height: `${end}px` }], {
        duration: 300,
        easing: 'cubic-bezier(0.22, 0.72, 0.12, 1)',
      });
      animation.current = next;
      next.onfinish = () => {
        if (animation.current === next) settle();
      };
    },
    [group, settle],
  );
  useEffect(() => {
    const close = (event: Event) => {
      const opening = (event as CustomEvent<{ group: string; element: HTMLDetailsElement }>).detail;
      if (opening.group === group && opening.element !== root.current && desired.current) {
        transition(false);
      }
    };
    document.addEventListener('wezigns:disclosure-open', close);
    const unsubscribe = subscribe(() => {
      if (getMotion() === 'paused') settle();
    });
    return () => {
      document.removeEventListener('wezigns:disclosure-open', close);
      unsubscribe();
      animation.current?.cancel();
    };
  }, [group, settle, transition]);

  return (
    <details ref={root} className={`animated-disclosure ${className}`}>
      <summary
        ref={summary}
        onClick={(event) => {
          event.preventDefault();
          transition(!desired.current);
        }}
      >
        {title}
        <i className="disclosure-icon" aria-hidden="true" />
      </summary>
      <div ref={body} className="disclosure-answer">
        {children}
      </div>
    </details>
  );
}
