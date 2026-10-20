import { useGSAP } from '@gsap/react'
import { useRef, useState } from 'react'
import { principles, storySection } from '@/content/site'
import { useLite } from '@/hooks/useLite'
import { StoryLiteArt } from './LiteArt'
import { ScrollTrigger } from '@/hooks/motion'
import { sceneStore } from '@/lib/sceneStore'
import { storyStage, storyStep } from '@/lib/story'

/** Pinned 3-act story. Scroll drives the particle morph (chaos → simplify → scale → secure). */
export function Story() {
  const root = useRef<HTMLElement>(null)
  const bar = useRef<HTMLSpanElement>(null)
  const [step, setStep] = useState(0)
  const { lite } = useLite()

  useGSAP(
    () => {
      ScrollTrigger.create({
        trigger: root.current,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (st) => {
          sceneStore.stage = storyStage(st.progress)
          if (bar.current) bar.current.style.transform = `scaleY(${st.progress})`
          setStep(storyStep(st.progress))
        },
        // Leaving upward returns the scene to chaos for the hero.
        onLeaveBack: () => {
          sceneStore.stage = 0
        },
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} className="story" data-3d-zone aria-label="Our principles">
      <div className="story-sticky">
        {lite && <StoryLiteArt step={step} />}
        <div className="story-rail" aria-hidden="true">
          <span className="story-rail-fill" ref={bar} />
        </div>
        <div className="story-copy">
          <p className="mono story-kicker">{storySection.kicker}</p>
          <div className="story-panels">
            {principles.map((p, i) => (
              <article key={p.key} className={`story-panel${i === step ? ' is-active' : ''}`} aria-hidden={i !== step}>
                <h2 className="story-title">{p.title}.</h2>
                <p className="story-body">{p.body}</p>
                <ul className="chip-row">
                  {p.chips.map((c) => (
                    <li className="chip" key={c}>
                      {c}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
        <ol className="story-dots mono" aria-hidden="true">
          {principles.map((p, i) => (
            <li key={p.key} className={i === step ? 'is-active' : ''}>
              {p.title}
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
