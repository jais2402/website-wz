import { useGSAP } from '@gsap/react'
import { Fragment, type ReactNode, type RefObject, useEffect, useRef } from 'react'
import { CookieBanner } from '@/components/CookieBanner'
import { Cursor } from '@/components/Cursor'
import { Footer } from '@/components/Footer'
import { Nav } from '@/components/Nav'
import { SplitReveal } from '@/components/Reveal'
import { StickyCall } from '@/components/StickyCall'
import { nav } from '@/content/site'
import { gsap, ScrollTrigger, usePrefersReducedMotion, useSmoothScroll } from '@/hooks/motion'
import { usePauseOffscreen } from '@/hooks/usePauseOffscreen'
import { spotVars } from '@/lib/spotlight'

// Shared building blocks for the inner pages. Styles in pages.css (classes prefixed `pg-`).

// Home-page sections, linked from other pages.
const homeNav = nav.map((l) => ({ ...l, href: l.href.startsWith('#') ? `/${l.href}` : l.href }))

/**
 * Nav, grain, cursor, smooth scroll and footer around a page. Anything inside with `data-reveal` rises in as it
 * scrolls into view (skipped under reduced motion).
 */
export function PageShell({ children, className = '' }: { children: ReactNode; className?: string }) {
  const reducedMotion = usePrefersReducedMotion()
  useSmoothScroll(!reducedMotion)
  usePauseOffscreen()
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (reducedMotion) return
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
        gsap.from(el, {
          y: 36,
          opacity: 0,
          duration: 0.9,
          ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 88%' },
        })
      })
    },
    { scope: root, dependencies: [reducedMotion] },
  )

  // Each section: `is-on` while it is on screen (thread flow and knot pulse run only then), `is-in` once it has
  // entered (the section mark's thread draws in). `is-armed` on <main> hides the undrawn state until then, so
  // without JS, in the HTML snapshot and under reduced motion everything shows fully drawn and still.
  useGSAP(
    () => {
      const main = root.current
      if (reducedMotion || !main) return
      main.classList.add('is-armed')
      gsap.utils.toArray<HTMLElement>('.pg-section').forEach((el) => {
        ScrollTrigger.create({ trigger: el, start: 'top bottom', end: 'bottom top', toggleClass: 'is-on' })
        ScrollTrigger.create({ trigger: el, start: 'top 82%', once: true, onEnter: () => el.classList.add('is-in') })
      })
      return () => main.classList.remove('is-armed')
    },
    { scope: root, dependencies: [reducedMotion] },
  )

  useSpotlight(root, !reducedMotion)

  return (
    <>
      <div className="grain" aria-hidden="true" />
      <Cursor />
      <Nav items={homeNav} logoHref="/" />
      {/* Before <main> in the DOM so keyboard users reach it early; it is fixed bottom-left. */}
      <CookieBanner />
      <main id="main" tabIndex={-1} ref={root} className={`pg ${className}`}>
        {children}
      </main>
      <Footer base="/" />
      <StickyCall />
    </>
  )
}

/**
 * Pointer spotlight on every `[data-spot]` card inside the page, plus a slight 3D tilt on `[data-spot="tilt"]`
 * (styles in pages.css). One delegated listener; fine pointers only, off under reduced motion.
 */
function useSpotlight(root: RefObject<HTMLElement | null>, enabled: boolean) {
  useEffect(() => {
    const main = root.current
    if (!enabled || !main || !window.matchMedia('(pointer: fine)').matches) return
    let card: HTMLElement | null = null
    const reset = (el: HTMLElement) => {
      el.classList.remove('is-spot')
      el.style.setProperty('--rx', '0deg')
      el.style.setProperty('--ry', '0deg')
    }
    const move = (e: PointerEvent) => {
      const next = (e.target as Element | null)?.closest<HTMLElement>('[data-spot]') ?? null
      if (card && card !== next) reset(card)
      card = next
      if (!card) return
      const vars = spotVars(e.clientX, e.clientY, card.getBoundingClientRect())
      for (const [k, v] of Object.entries(vars)) card.style.setProperty(k, v)
      card.classList.add('is-spot')
    }
    const leave = () => {
      if (card) reset(card)
      card = null
    }
    main.addEventListener('pointermove', move, { passive: true })
    main.addEventListener('pointerleave', leave)
    return () => {
      main.removeEventListener('pointermove', move)
      main.removeEventListener('pointerleave', leave)
      leave()
    }
  }, [root, enabled])
}

/** Page opening: label, a headline whose last line is set in the serif accent, lead, actions and an optional visual. */
export function PageHero({
  kicker,
  title,
  lead,
  actions,
  visual,
}: {
  kicker: string
  title: readonly string[]
  lead: string
  actions?: ReactNode
  visual?: ReactNode
}) {
  return (
    <section className={`pg-hero wrap${visual ? ' has-visual' : ''}`}>
      <div className="pg-hero-copy">
        <p className="mono label">{kicker}</p>
        <h1 className="display pg-title">
          {/* Grid items: the space between lines is not rendered, but keeps textContent readable. */}
          {title.map((line, i) => (
            <Fragment key={line}>
              {i > 0 && ' '}
              <span className={`pg-title-line${i === title.length - 1 && title.length > 1 ? ' serif' : ''}`}>
                {line}
              </span>
            </Fragment>
          ))}
        </h1>
        <p className="lead pg-lead">{lead}</p>
        {actions && <div className="pg-actions">{actions}</div>}
      </div>
      {visual && <div className="pg-hero-visual">{visual}</div>}
    </section>
  )
}

/** A section with a mono label and a split-reveal heading. */
export function PageSection({
  id,
  kicker,
  title,
  intro,
  children,
  className = '',
  tone,
  aside,
}: {
  id?: string
  kicker?: string
  title: string
  intro?: string
  children: ReactNode
  className?: string
  /** 'light': the cream panel from the landing page's AI section, one per page to break up the dark. */
  tone?: 'light'
  /** A decorative visual beside the heading, in the space right of it (tablet and up; hidden on phones). */
  aside?: ReactNode
}) {
  return (
    <section id={id} className={`pg-section ${tone === 'light' ? 'pg-light ' : ''}${className}`}>
      {/* A soft light pool and a dot field behind the section; side and colour alternate down the page. */}
      <span className="pg-glow" aria-hidden="true" />
      <div className="wrap">
        {(() => {
          const head = (
            <header className="pg-section-head">
              <SectionMark />
              {kicker && <p className="mono label">{kicker}</p>}
              <SplitReveal as="h2" className="display pg-h2" text={title} />
              {intro && <p className="lead pg-section-intro">{intro}</p>}
            </header>
          )
          return aside ? (
            <div className="pg-section-top">
              {head}
              <div className="pg-section-aside" aria-hidden="true">
                {aside}
              </div>
            </div>
          ) : (
            head
          )
        })()}
        {children}
      </div>
    </section>
  )
}

/**
 * The section's index (a CSS counter, so it always follows page order) and a short twisted thread ending in a
 * glowing knot. The thread draws in as the section enters; the knot breathes while it is on screen.
 */
function SectionMark() {
  return (
    <div className="pg-mark" aria-hidden="true">
      <span className="mono pg-mark-num" />
      <svg className="pg-mark-thread" viewBox="0 0 160 20" focusable="false">
        <path pathLength={1} d="M2 10 C24 1 42 19 64 10 S106 1 128 10 S148 13 152 10" />
        <path pathLength={1} className="is-alt" d="M2 10 C24 19 42 1 64 10 S106 19 128 10 S148 7 152 10" />
        <circle className="pg-mark-knot" cx="152" cy="10" r="4" />
      </svg>
      <span className="pg-mark-rule" />
    </div>
  )
}
