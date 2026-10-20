import { useGSAP } from '@gsap/react'
import { Fragment, type ReactNode, useRef } from 'react'
import { gsap } from '@/hooks/motion'

type Tag = 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'p'
type SplitProps = { text: string; as?: Tag; className?: string; delay?: number; trigger?: boolean; start?: string }

/** Word-by-word masked rise. Words stay readable to screen readers via the aria-label on the wrapper. */
export function SplitReveal({
  text,
  as = 'span',
  className,
  delay = 0,
  trigger = true,
  start = 'top 85%',
}: SplitProps) {
  // Narrowed to one intrinsic type so the ref typechecks; the rendered tag still follows `as`.
  const Tag = as as 'div'
  const ref = useRef<HTMLDivElement>(null)
  useGSAP(
    () => {
      const words = ref.current?.querySelectorAll('.w > span')
      if (!words?.length) return
      gsap.fromTo(
        words,
        { yPercent: 110, rotate: 4 },
        {
          yPercent: 0,
          rotate: 0,
          duration: 1.1,
          ease: 'expo.out',
          stagger: 0.06,
          delay,
          scrollTrigger: trigger ? { trigger: ref.current, start } : undefined,
        },
      )
    },
    { scope: ref },
  )
  return (
    <Tag ref={ref} className={className} aria-label={text}>
      {text.split(' ').map((word, i, words) => (
        // The space must sit outside the inline-block mask or it collapses. No trailing space after the
        // last word, so textContent matches the aria-label exactly.
        <Fragment key={i}>
          <span className="w" aria-hidden="true">
            <span>{word}</span>
          </span>
          {i < words.length - 1 && ' '}
        </Fragment>
      ))}
    </Tag>
  )
}

/** Fades and lifts direct children into view in sequence. */
export function Stagger({ children, className, as = 'div' }: { children: ReactNode; className?: string; as?: Tag }) {
  const Tag = as as 'div'
  const ref = useRef<HTMLDivElement>(null)
  useGSAP(
    () => {
      if (!ref.current) return
      gsap.from(ref.current.children, {
        y: 40,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.08,
        scrollTrigger: { trigger: ref.current, start: 'top 85%' },
      })
    },
    { scope: ref },
  )
  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  )
}
