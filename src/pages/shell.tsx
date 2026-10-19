import { useGSAP } from '@gsap/react'
import { Fragment, type ReactNode, useRef } from 'react'
import { Cursor } from '@/components/Cursor'
import { Footer } from '@/components/Footer'
import { Nav } from '@/components/Nav'
import { SplitReveal } from '@/components/Reveal'
import { StickyCall } from '@/components/StickyCall'
import { nav } from '@/content/site'
import { gsap, usePrefersReducedMotion, useSmoothScroll } from '@/hooks/motion'

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
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (reducedMotion) return
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
        gsap.from(el, { y: 36, opacity: 0, duration: 0.9, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' } })
      })
    },
    { scope: root, dependencies: [reducedMotion] },
  )

  return (
    <>
      <div className="grain" aria-hidden="true" />
      <Cursor />
      <Nav items={homeNav} logoHref="/" />
      <main ref={root} className={`pg ${className}`}>
        {children}
      </main>
      <Footer base="/" />
      <StickyCall />
    </>
  )
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
              <span className={`pg-title-line${i === title.length - 1 && title.length > 1 ? ' serif' : ''}`}>{line}</span>
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
}: {
  id?: string
  kicker?: string
  title: string
  intro?: string
  children: ReactNode
  className?: string
}) {
  return (
    <section id={id} className={`pg-section ${className}`}>
      <div className="wrap">
        <header className="pg-section-head">
          {kicker && <p className="mono label">{kicker}</p>}
          <SplitReveal as="h2" className="display pg-h2" text={title} />
          {intro && <p className="lead pg-section-intro">{intro}</p>}
        </header>
        {children}
      </div>
    </section>
  )
}
