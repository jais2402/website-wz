import { offer } from '@/content/site'
import { SplitReveal } from './Reveal'

type Key = (typeof offer.items)[number]['key']

/** A small code-drawn picture per offering: a browser page, a live dashboard, a product shipping versions. */
function OfferArt({ kind }: { kind: Key }) {
  if (kind === 'web')
    return (
      <div className="of-art of-web" aria-hidden="true">
        <div className="of-web-bar">
          <i />
          <i />
          <i />
          <span>yourcompany.com</span>
        </div>
        <div className="of-web-page">
          <b className="of-web-h" />
          <b className="of-web-h is-short" />
          <span className="of-web-btn" />
          <div className="of-web-tiles">
            <i />
            <i />
            <i />
          </div>
        </div>
      </div>
    )
  if (kind === 'software')
    return (
      <div className="of-art of-sw" aria-hidden="true">
        {[
          ['Orders', 'Live', 82],
          ['Approvals', '3 waiting', 46],
          ['Stock', 'Synced', 68],
        ].map(([name, status, w]) => (
          <div className="of-sw-row" key={name}>
            <span>{name}</span>
            <i style={{ width: `${w}%` }} />
            <em>{status}</em>
          </div>
        ))}
      </div>
    )
  return (
    <div className="of-art of-prod" aria-hidden="true">
      <div className="of-prod-phone">
        <b />
        <b className="is-short" />
        <span />
        <span />
      </div>
      <ol className="of-prod-releases mono">
        <li>v0.1 · prototype</li>
        <li>v1.0 · launch</li>
        <li className="is-now">v1.4 · live</li>
      </ol>
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
