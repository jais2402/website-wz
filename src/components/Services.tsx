import { useGSAP } from '@gsap/react'
import { useRef } from 'react'
import { services, servicesSection } from '@/content/site'
import { gsap } from '@/hooks/motion'
import { BuildArt, ConnectArt, RunArt } from './Illustrations'
import { SplitReveal } from './Reveal'

const ART = { build: BuildArt, connect: ConnectArt, run: RunArt }

/** Spotlight + 3D tilt that follows the pointer. Writes CSS vars only, so no re-renders. */
function onCardMove(e: React.PointerEvent<HTMLElement>) {
  const el = e.currentTarget
  const r = el.getBoundingClientRect()
  const x = (e.clientX - r.left) / r.width
  const y = (e.clientY - r.top) / r.height
  el.style.setProperty('--mx', `${x * 100}%`)
  el.style.setProperty('--my', `${y * 100}%`)
  el.style.setProperty('--rx', `${(0.5 - y) * 6}deg`)
  el.style.setProperty('--ry', `${(x - 0.5) * 8}deg`)
}
function onCardLeave(e: React.PointerEvent<HTMLElement>) {
  e.currentTarget.style.setProperty('--rx', '0deg')
  e.currentTarget.style.setProperty('--ry', '0deg')
}

/** Pinned horizontal scroll through the three service lines (vertical stack on mobile). */
export function Services() {
  const root = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
        const distance = () => track.current!.scrollWidth - window.innerWidth
        gsap.to(track.current, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        })
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section id="build" ref={root} className="panel services">
      <div className="services-track" ref={track}>
        <div className="services-intro">
          <SplitReveal as="h2" className="display" text={servicesSection.title} />
          <p className="lead">{servicesSection.body}</p>
          <span className="drag-hint mono" aria-hidden="true">
            Keep scrolling →
          </span>
        </div>
        {services.map((s) => {
          const Art = ART[s.key]
          return (
            <article key={s.key} className={`svc-card tone-${s.tone}`} onPointerMove={onCardMove} onPointerLeave={onCardLeave}>
              <div className="svc-inner">
                <header>
                  <span className="svc-kicker">{s.kicker}</span>
                </header>
                <Art />
                <h3>{s.title}</h3>
                <ul>
                  {s.items.map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
