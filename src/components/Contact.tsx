import { useGSAP } from '@gsap/react'
import { useRef } from 'react'
import { countries } from '@/content/site'
import { ScrollTrigger } from '@/hooks/motion'
import { sceneStore } from '@/lib/sceneStore'
import { EnquiryForm } from './EnquiryForm'
import { SplitReveal } from './Reveal'

/** Final 3D zone: the particles become a globe of the 11 countries behind the enquiry composer. */
export function Contact() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      ScrollTrigger.create({
        trigger: root.current,
        start: 'top bottom',
        end: 'top 45%',
        onUpdate: (st) => {
          sceneStore.stage = 3 + st.progress
        },
        onLeaveBack: () => {
          sceneStore.stage = 3
        },
      })
    },
    { scope: root },
  )

  return (
    <section id="contact" ref={root} className="contact" data-3d-zone>
      <div className="wrap contact-grid">
        <div className="contact-card">
          <p className="mono label">Contact</p>
          <SplitReveal as="h2" className="display contact-title" text="Tell us what is not working." />
          <p className="lead">We reply within one working day. No sales script, just a conversation about the problem.</p>

          <EnquiryForm />
        </div>

        <p className="contact-globe-caption mono" aria-label={`Systems running in ${countries.length} countries`}>
          <span className="live" /> Systems running in {countries.length} countries
        </p>
      </div>
    </section>
  )
}
