import { useGSAP } from '@gsap/react'
import { Fragment, useRef } from 'react'
import { pricing } from '@/content/site'
import { gsap, scrollToTarget, ScrollTrigger, usePrefersReducedMotion } from '@/hooks/motion'

/**
 * How pricing works, on cream: the statement on one line across the top; below it a vertical thread showing where the
 * price comes from (Understand → Shape → price) with the lead, CTA and a link to /pricing under it, beside an
 * "agreement" card listing what sets the price (and what doesn't). The steps slide in, the thread fills with scroll
 * and each knot lights as the thread reaches it; the price knot then pulses. All lit and still under reduced motion.
 */
export function Pricing() {
  const root = useRef<HTMLElement>(null)
  const reducedMotion = usePrefersReducedMotion()

  useGSAP(
    () => {
      const steps = gsap.utils.toArray<HTMLElement>('.price-steps li')
      if (reducedMotion) {
        steps.forEach((li) => li.classList.add('is-lit'))
        return
      }
      gsap.fromTo(
        '.price-line > span',
        { yPercent: 110 },
        {
          yPercent: 0,
          duration: 1.1,
          ease: 'expo.out',
          stagger: 0.1,
          scrollTrigger: { trigger: root.current, start: 'top 70%' },
        },
      )
      gsap.from('.price-row', {
        x: 24,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.08,
        scrollTrigger: { trigger: '.price-card', start: 'top 75%' },
      })
      gsap.fromTo(
        '.price-thread-fill',
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: { trigger: '.price-steps', start: 'top 70%', end: 'bottom 60%', scrub: true },
        },
      )
      gsap.from(steps, {
        x: -28,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.14,
        scrollTrigger: { trigger: '.price-steps', start: 'top 80%' },
      })
      // A knot lights when the filling thread reaches it and stays lit until the visitor scrolls back above it.
      steps.forEach((li) =>
        ScrollTrigger.create({
          trigger: li,
          start: 'top 64%',
          end: 'max',
          toggleClass: { targets: li, className: 'is-lit' },
        }),
      )
    },
    { scope: root, dependencies: [reducedMotion] },
  )

  return (
    <section id="pricing" ref={root} className="panel pricing" aria-labelledby="pricing-title">
      <div className="wrap">
        <header className="pricing-head">
          <h2 id="pricing-title" className="pricing-title" aria-label={pricing.title.join(' ')}>
            {pricing.title.map((l, i) => (
              <Fragment key={l}>
                {i > 0 && ' '}
                <span className="price-line" aria-hidden="true">
                  <span className={i === 1 ? 'serif' : undefined}>{l}</span>
                </span>
              </Fragment>
            ))}
          </h2>
        </header>

        <div className="pricing-grid">
          <div className="pricing-left">
            <div className="price-steps">
              <span className="price-thread" aria-hidden="true">
                <span className="price-thread-fill" />
              </span>
              <ol>
                {pricing.steps.map((s, i) => (
                  <li key={s.name} className={i === pricing.steps.length - 1 ? 'is-final' : undefined}>
                    <span className="price-knot" aria-hidden="true" />
                    <h3>{s.name}</h3>
                    <p>{s.text}</p>
                  </li>
                ))}
              </ol>
            </div>
            <div className="pricing-sub">
              <p className="lead">{pricing.body}</p>
              <div className="pricing-actions">
                <a
                  className="btn btn-lime btn-lg pricing-cta"
                  href={pricing.cta.href}
                  onClick={(e) => {
                    e.preventDefault()
                    scrollToTarget(pricing.cta.href)
                  }}
                >
                  {pricing.cta.label} <span aria-hidden="true">→</span>
                </a>
                <p className="pricing-more">
                  <a className="link-btn" href={pricing.more.href}>
                    {pricing.more.label} <span aria-hidden="true">→</span>
                  </a>
                </p>
              </div>
            </div>
          </div>
          <div className="glass-card price-card">
            <div className="price-card-head mono">
              <span>Your price</span>
              <span className="price-stamp">Agreed before build</span>
            </div>
            <p className="mono price-group">What sets it</p>
            <ul>
              {pricing.sets.map((d) => (
                <li className="price-row" key={d.name}>
                  <span className="price-check" aria-hidden="true">
                    ✓
                  </span>
                  <div>
                    <b>{d.name}</b>
                    <span>{d.text}</span>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mono price-group">What doesn't</p>
            <ul>
              {pricing.doesnt.map((d) => (
                <li className="price-row is-not" key={d}>
                  <span className="price-check" aria-hidden="true">
                    ✕
                  </span>
                  <div>
                    <b>
                      <s>{d}</s>
                    </b>
                  </div>
                </li>
              ))}
            </ul>
            <div className="price-total">
              <span className="mono">Price</span>
              <b>One number</b>
              <span className="mono">Timeline</span>
              <b>One date</b>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
