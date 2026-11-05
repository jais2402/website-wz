import { offer } from '@/content/site'
import { SplitReveal } from './Reveal'

type Key = (typeof offer.items)[number]['key']

/**
 * A code-drawn picture per offering. Websites: a site in a browser with a visitor's cursor on the button, a speed
 * score and a new enquiry arriving. Custom software: a workflow, three steps joined by threads with work moving along
 * them. Products: the same product on a phone and in a browser, live at v1.0.
 */
function OfferArt({ kind }: { kind: Key }) {
  if (kind === 'web')
    return (
      <div className="of-art of-web" aria-hidden="true">
        <div className="of-web-win">
          <div className="of-web-bar">
            <i />
            <i />
            <i />
            <span>yourcompany.com</span>
          </div>
          <div className="of-web-page">
            <div className="of-web-copy">
              <b />
              <b className="is-short" />
              <span className="of-web-btn">
                <svg className="of-web-cursor" viewBox="0 0 16 16">
                  <path d="M2 1l11 6.5-4.6 1.2L6.6 13z" />
                </svg>
              </span>
            </div>
            <span className="of-web-hero" />
          </div>
        </div>
        <div className="of-web-score">
          <svg viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15" pathLength={100} />
            <circle className="is-fill" cx="18" cy="18" r="15" pathLength={100} />
          </svg>
          <span className="mono">100</span>
        </div>
        <div className="of-web-toast">
          <i />
          <span>
            <b>New enquiry</b>
            <em className="mono">just now</em>
          </span>
        </div>
      </div>
    )
  if (kind === 'software')
    return (
      <div className="of-art of-sw" aria-hidden="true">
        <svg className="of-sw-threads" viewBox="0 0 300 180" preserveAspectRatio="none">
          <path d="M66 40 C130 40 110 92 160 92" />
          <path d="M160 92 C210 92 186 144 236 144" />
          <path className="is-run" d="M66 40 C130 40 110 92 160 92" pathLength={100} />
          <path className="is-run is-late" d="M160 92 C210 92 186 144 236 144" pathLength={100} />
        </svg>
        {[
          ['Order in', 'is-a'],
          ['Approved', 'is-b'],
          ['Invoiced', 'is-c'],
        ].map(([label, pos]) => (
          <span key={label} className={`of-sw-node mono ${pos}`}>
            <i />
            {label}
          </span>
        ))}
        <span className="of-sw-sync mono">Synced · 2s ago</span>
      </div>
    )
  return (
    <div className="of-art of-prod" aria-hidden="true">
      <div className="of-prod-web">
        <div className="of-prod-web-bar">
          <i />
          <i />
          <i />
        </div>
        <div className="of-prod-web-body">
          <span className="of-prod-side" />
          <span className="of-prod-bars">
            {[40, 64, 52, 80, 70, 92].map((h, i) => (
              <i key={i} style={{ height: `${h}%`, ['--i' as string]: i }} />
            ))}
          </span>
        </div>
      </div>
      <div className="of-prod-phone">
        <b />
        <span className="of-prod-ring" />
        <b className="is-short" />
        <span className="of-prod-cta" />
      </div>
      <span className="of-prod-tag mono">
        <i />
        v1.0 · live
      </span>
    </div>
  )
}

/** "What we build": websites, custom software and software products, each with who it is for. */
export function Offer({ className = '' }: { className?: string }) {
  return (
    <section id="offer" className={`panel offer ${className}`}>
      <div className="wrap">
        <header className="offer-head">
          <p className="mono label">{offer.kicker}</p>
          <SplitReveal as="h2" className="display" text={offer.title} />
          <p className="lead">{offer.body}</p>
        </header>
        <ul className="offer-grid">
          {offer.items.map((o, i) => (
            <li key={o.key} className={`offer-card tone-${o.tone}`}>
              <OfferArt kind={o.key} />
              <p className="mono offer-kicker">
                {o.kicker}
                <span className="offer-num">0{i + 1}</span>
              </p>
              <h3>{o.title}</h3>
              <p className="offer-for">{o.for}</p>
              <ul className="offer-items">
                {o.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
              <a className="offer-link" href={o.cta.href}>
                {o.cta.label} <span aria-hidden="true">→</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
