import { useState } from 'react'
import { brand, ctas, faq, faqSection } from '@/content/site'
import { SplitReveal } from './Reveal'

type Item = { q: string; a: string }

/** Questions as an accordion beside a call/email box. Other pages pass their own subset and heading (e.g. /pricing). */
export function Faq({ items = faq, title = faqSection.title }: { items?: readonly Item[]; title?: string }) {
  const [open, setOpen] = useState(0)
  return (
    <section id="faq" className="panel faq">
      <div className="wrap faq-grid">
        <div>
          <SplitReveal as="h2" className="display" text={title} />
          {/* Has its own call and email buttons: the floating call pill steps aside while it is on screen. */}
          <div className="faq-ask" data-own-contact>
            <p className="faq-ask-title">{ctas.faq.title}</p>
            <p className="faq-ask-body">{ctas.faq.body}</p>
            <div className="faq-ask-actions">
              <a className="btn btn-lime" href={brand.phoneHref}>
                {ctas.faq.call} {brand.phone}
              </a>
              <a className="btn btn-ghost" href={`mailto:${brand.email}`}>
                {brand.email}
              </a>
            </div>
          </div>
        </div>
        <div className="faq-list">
          {items.map((f, i) => {
            const isOpen = open === i
            return (
              <div className={`faq-item${isOpen ? ' is-open' : ''}`} key={f.q}>
                <button
                  id={`faq-q-${i}`}
                  aria-expanded={isOpen}
                  aria-controls={`faq-${i}`}
                  onClick={() => setOpen(isOpen ? -1 : i)}
                >
                  <span>{f.q}</span>
                  <i aria-hidden="true" />
                </button>
                {/* Closed answers are inert, so screen readers and Tab skip them; the region is named by its question. */}
                <div id={`faq-${i}`} className="faq-a" role="region" aria-labelledby={`faq-q-${i}`} inert={!isOpen}>
                  <div>
                    <p>{f.a}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
