import { useGSAP } from '@gsap/react'
import { useRef } from 'react'
import { hero } from '@/content/site'
import { gsap, scrollToTarget } from '@/hooks/motion'
import { sceneStore } from '@/lib/sceneStore'

// Hand-placed positions (% of hero) for the floating "chaos" fragments.
const FRAGMENT_POS = [
  { left: '8%', top: '22%' },
  { left: '74%', top: '16%' },
  { left: '82%', top: '58%' },
  { left: '6%', top: '64%' },
  { left: '62%', top: '80%' },
  { left: '28%', top: '84%' },
]

export function Hero({ ready }: { ready: boolean }) {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (!ready) return
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
      tl.fromTo('.hero-glass', { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 1.4 }, 0)
        .fromTo('.hero-line > span', { yPercent: 115 }, { yPercent: 0, duration: 1.4, stagger: 0.09 }, 0.1)
        .fromTo('.hero-eyebrow, .hero-sub, .hero-ctas, .hero-meta', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: 0.08 }, 0.35)
        .fromTo('.fragment', { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 1, stagger: 0.07 }, 0.5)

      // Scrolling away: fragments get pulled into the centre (the system absorbs the mess), headline lifts.
      const out = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
          onUpdate: (st) => {
            sceneStore.dolly = st.progress
          },
        },
      })
      out
        .to('.fragment', { left: '50%', top: '50%', xPercent: -50, scale: 0.2, opacity: 0, stagger: 0.02, ease: 'power2.in' }, 0)
        // Fade the glass and the copy individually, never .hero-copy itself: opacity < 1 on the glass's parent
        // turns backdrop-filter off in Chrome and the panel would vanish on the first scroll tick.
        .to('.hero-copy', { yPercent: -18, ease: 'none' }, 0)
        // Explicit from-value: these elements are still at opacity 0 (intro pending) when this tween initialises,
        // so a plain .to() would record 0 as its start and never restore them when scrolling back up.
        .fromTo(
          '.hero-glass, .hero-eyebrow, .hero-title, .hero-sub, .hero-ctas',
          { opacity: 1 },
          { opacity: 0, ease: 'none', immediateRender: false },
          0,
        )
    },
    { scope: root, dependencies: [ready] },
  )

  return (
    <section id="top" ref={root} className="hero" data-3d-zone>
      <div className="grid-lines" aria-hidden="true">
        {Array.from({ length: 6 }, (_, i) => (
          <i key={i} />
        ))}
      </div>

      <div className="fragments" aria-hidden="true">
        {hero.fragments.map((f, i) => (
          <span className="fragment" key={f} style={{ ...FRAGMENT_POS[i], animationDelay: `${i * -1.3}s` }}>
            <i className={`frag-icon frag-${i % 3}`} />
            {f}
          </span>
        ))}
      </div>

      <div className="hero-copy">
        <span className="hero-glass" aria-hidden="true" />
        <p className="hero-eyebrow mono">
          <span className="pulse" /> {hero.eyebrow}
        </p>
        <h1 className="hero-title" aria-label={hero.title.join(' ')}>
          {hero.title.map((line, i) => (
            <span className="hero-line" key={line} aria-hidden="true">
              <span className={i === 2 ? 'serif' : undefined}>{line}</span>
            </span>
          ))}
        </h1>
        <p className="hero-sub">{hero.sub}</p>
        <div className="hero-ctas">
          <a
            className="btn btn-lime btn-lg"
            href={hero.primary.href}
            onClick={(e) => {
              e.preventDefault()
              scrollToTarget(hero.primary.href)
            }}
          >
            {hero.primary.label} <span aria-hidden="true">→</span>
          </a>
          <a
            className="btn btn-ghost btn-lg"
            href={hero.secondary.href}
            onClick={(e) => {
              e.preventDefault()
              scrollToTarget(hero.secondary.href)
            }}
          >
            {hero.secondary.label}
          </a>
        </div>
      </div>

      <div className="hero-meta mono">
        <span>Chennai, IN</span>
        <span className="scroll-cue">
          <i /> Scroll to organise
        </span>
        <span>11 countries · Since 2012</span>
      </div>
    </section>
  )
}
