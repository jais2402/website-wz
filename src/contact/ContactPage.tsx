import { useGSAP } from '@gsap/react'
import { useRef } from 'react'
import { ContactForm } from '@/components/ContactForm'
import { Cursor } from '@/components/Cursor'
import { Footer } from '@/components/Footer'
import { Nav } from '@/components/Nav'
import { SplitReveal } from '@/components/Reveal'
import { brand, contactPage, countries, nav } from '@/content/site'
import { gsap, usePrefersReducedMotion, useSmoothScroll } from '@/hooks/motion'
import { ContactLoom } from './ContactLoom'

// Links back to the home page sections from this page.
const homeNav = nav.map((l) => ({ ...l, href: l.href.startsWith('#') ? `/${l.href}` : l.href }))

/** /contact-us: every way to reach Wezigns plus the enquiry form, with the loom beside the headline (SVG in lite mode). */
export function ContactPage() {
  const reducedMotion = usePrefersReducedMotion()
  useSmoothScroll(!reducedMotion)
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      gsap.from('.cp-card, .cp-form', { y: 30, opacity: 0, duration: 0.9, ease: 'expo.out', stagger: 0.08, delay: 0.2 })
    },
    { scope: root },
  )

  return (
    <>
      <div className="grain" aria-hidden="true" />
      <Cursor />
      <Nav items={homeNav} logoHref="/" cta={{ label: 'Send a message', href: '#contact-form' }} />
      <main ref={root} className="cp">
        <section className="wrap cp-head" aria-label="Contact Wezigns">
          <div className="cp-head-copy">
            <p className="mono label">{contactPage.kicker}</p>
            <SplitReveal as="h1" className="display cp-title" text={contactPage.title} trigger={false} />
            <p className="lead">{contactPage.lead}</p>
          </div>
          <ContactLoom reducedMotion={reducedMotion} />
        </section>

        <section className="wrap cp-body">
          <div className="cp-cards">
            <address className="glass-card cp-card">
              <span className="mono cp-card-label">Head office</span>
              <span className="cp-card-lines">
                {brand.address.map((l) => (
                  <span key={l}>{l}</span>
                ))}
              </span>
              <a className="cp-link" href={brand.mapsHref} target="_blank" rel="noopener noreferrer">
                Open in Google Maps ↗
              </a>
            </address>

            <div className="glass-card cp-card">
              <span className="mono cp-card-label">Phone</span>
              <a className="cp-big" href={brand.phoneHref}>
                {brand.phone}
              </a>
              <span className="cp-card-note">{contactPage.phoneNote}</span>
            </div>

            <div className="glass-card cp-card">
              <span className="mono cp-card-label">Email</span>
              <a className="cp-big" href={`mailto:${brand.email}`}>
                {brand.email}
              </a>
              <span className="cp-card-note">{contactPage.emailNote}</span>
            </div>

            <p className="cp-reach">
              Working with teams in {countries.length} countries. <a href="/#countries">See where →</a>
            </p>
          </div>

          <div id="contact-form" className="glass-card cp-form">
            <ContactForm />
          </div>
        </section>
      </main>
      <Footer base="/" />
    </>
  )
}
