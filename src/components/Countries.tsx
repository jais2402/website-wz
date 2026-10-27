import { useGSAP } from '@gsap/react'
import { useRef } from 'react'
import { countries, reach } from '@/content/site'
import { ScrollTrigger } from '@/hooks/motion'
import { flagEmoji } from '@/lib/flags'
import { sceneStore } from '@/lib/sceneStore'
import { SplitReveal } from './Reveal'

const indexOf = (name: string) => countries.findIndex((c) => c.name === name)

/**
 * Transparent 3D zone: the story's woven sphere hands off to a globe with gold threads from Chennai to every
 * country we serve. Hovering (or focusing) a country lights up its thread.
 */
export function Countries() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      ScrollTrigger.create({
        trigger: root.current,
        start: 'top 85%',
        end: 'top 25%',
        onUpdate: (st) => {
          sceneStore.globe = st.progress
        },
        // A fast scroll or nav jump can skip straight past the range; lock the globe on either way.
        onLeave: () => {
          sceneStore.globe = 1
        },
        onEnterBack: () => {
          sceneStore.globe = 1
        },
        onLeaveBack: () => {
          sceneStore.globe = 0
          sceneStore.highlight = -1
        },
      })
    },
    { scope: root },
  )

  const light = (name: string) => () => {
    sceneStore.highlight = indexOf(name)
  }
  const clear = () => {
    sceneStore.highlight = -1
  }

  return (
    <section id="countries" ref={root} className="countries" data-3d-zone aria-labelledby="countries-title">
      <div className="wrap countries-grid">
        <div className="glass-card countries-card">
          {/* Starts as soon as the card enters, so it never shows as an empty glass box. */}
          <SplitReveal as="h2" className="display countries-title" text={reach.title} start="top 98%" />
          <p className="lead">{reach.body}</p>

          {/* One flat list (HQ first, then region by region); region names are not shown. */}
          <ul className="country-list" onMouseLeave={clear}>
            {reach.regions
              .flatMap((r) => r.countries)
              .map((c) => (
                <li key={c}>
                  <button
                    type="button"
                    className={`country-item${c === reach.hq ? ' is-hq' : ''}`}
                    onMouseEnter={light(c)}
                    onFocus={light(c)}
                    onBlur={clear}
                  >
                    <span className="country-flag" aria-hidden="true">
                      {flagEmoji(countries[indexOf(c)]?.code ?? '')}
                    </span>
                    <span className="country-name">{c}</span>
                    {c === reach.hq && <em className="mono">{reach.hqLabel}</em>}
                  </button>
                </li>
              ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
