import { useGSAP } from '@gsap/react'
import { useRef } from 'react'
import { process, processSection } from '@/content/site'
import { gsap } from '@/hooks/motion'
import { SplitReveal } from './Reveal'

/** Four steps joined by a line that draws itself with scroll; each node lights up as the line reaches it. */
export function Process() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const steps = gsap.utils.toArray<HTMLElement>('.step')
      gsap.fromTo(
        '.process-line-fill',
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: '.process-steps',
            start: 'top 75%',
            end: 'bottom 45%',
            scrub: true,
            onUpdate: (st) => {
              steps.forEach((s, i) => s.classList.toggle('is-lit', st.progress >= i / (steps.length - 1) - 0.02))
            },
          },
        },
      )
    },
    { scope: root },
  )

  return (
    <section id="process" ref={root} className="panel process">
      <div className="wrap">
        <p className="mono label">{processSection.kicker}</p>
        <SplitReveal as="h2" className="display process-title" text={processSection.title} />
        <div className="process-steps">
          <div className="process-line" aria-hidden="true">
            <span className="process-line-fill" />
          </div>
          {process.map((s, i) => (
            <div className="step" key={s.title}>
              <span className="step-node" aria-hidden="true">
                <i />
              </span>
              <span className="mono step-num">Stage 0{i + 1}</span>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
