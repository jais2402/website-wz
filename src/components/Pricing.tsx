import { useGSAP } from '@gsap/react'
import { useRef } from 'react'
import { pricing } from '@/content/site'
import { gsap, scrollToTarget } from '@/hooks/motion'

/**
 * How pricing works: a big statement on the left, an "agreement" card on the right listing what sets the
 * price (and what doesn't), and a thread showing where the price comes from (Understand → Shape → price).
 */
export function Pricing() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      gsap.fromTo('.price-line > span', { yPercent: 110 }, {
        yPercent: 0,
        duration: 1.1,
        ease: 'expo.out',
        stagger: 0.1,
        scrollTrigger: { trigger: root.current, start: 'top 70%' },
      })
      gsap.from('.price-row', {
        x: 24,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.08,
        scrollTrigger: { trigger: '.price-card', start: 'top 75%' },
      })
      gsap.fromTo('.price-thread-fill', { scaleX: 0 }, {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: { trigger: '.price-steps', start: 'top 85%', end: 'top 45%', scrub: true },
      })
    },
    { scope: root },
  )

  return (
    <section id="pricing" ref={root} className="panel pricing" aria-labelledby="pricing-title">
      <div className="wrap">
        <div className="pricing-grid">
          <div className="pricing-copy">
            <p className="mono label">{pricing.kicker}</p>
            <h2 id="pricing-title" className="pricing-title" aria-label={pricing.title.join(' ')}>
              {pricing.title.map((l, i) => (
                <span className="price-line" key={l} aria-hidden="true">
                  <span className={i === 1 ? 'serif' : undefined}>{l}</span>
                </span>
              ))}
            </h2>
            <p className="lead">{pricing.body}</p>
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
                  <span className="price-check" aria-hidden="true">✓</span>
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
                  <span className="price-check" aria-hidden="true">✕</span>
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

        <div className="price-steps">
          <span className="price-thread" aria-hidden="true">
            <span className="price-thread-fill" />
          </span>
          <ol>
          {pricing.steps.map((s, i) => (
            <li key={s.name} className={i === pricing.steps.length - 1 ? 'is-final' : undefined}>
              <span className="price-knot" aria-hidden="true" />
              <span className="mono">0{i + 1}</span>
              <h3>{s.name}</h3>
              <p>{s.text}</p>
            </li>
          ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
