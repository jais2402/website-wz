import { useState } from 'react'
import { brand, ctas, faq } from '@/content/site'
import { SplitReveal } from './Reveal'

export function Faq() {
  const [open, setOpen] = useState(0)
  return (
    <section id="faq" className="panel faq">
      <div className="wrap faq-grid">
        <div>
          <SplitReveal as="h2" className="display" text="Straight answers." />
          <div className="faq-ask">
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
          {faq.map((f, i) => {
            const isOpen = open === i
            return (
              <div className={`faq-item${isOpen ? ' is-open' : ''}`} key={f.q}>
                <button aria-expanded={isOpen} aria-controls={`faq-${i}`} onClick={() => setOpen(isOpen ? -1 : i)}>
                  <span>{f.q}</span>
                  <i aria-hidden="true" />
                </button>
                <div id={`faq-${i}`} className="faq-a" role="region">
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
