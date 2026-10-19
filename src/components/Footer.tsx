import { brand, countries, footer, legalLinks } from '@/content/site'
import { scrollToTarget } from '@/hooks/motion'
import { AiSummary } from './AiSummary'
import { Logo } from './Logo'

/** `base` prefixes in-page links when the footer is used on another page (e.g. './' from the loom page). */
export function Footer({ base = '' }: { base?: string }) {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-top">
          <div className="footer-brand">
            <Logo />
            <p>Custom software that grows with you. Designed, built, hosted and maintained from {brand.city}.</p>
            <address className="footer-address">{brand.address.join(', ')}</address>
          </div>
          {footer.map((col) => (
            <nav key={col.title} className="footer-col" aria-label={col.title}>
              <p className="mono">{col.title}</p>
              {col.links.map(([label, href]) => (
                <a
                  key={label}
                  href={href.startsWith('#') ? `${base}${href}` : href}
                  onClick={(e) => {
                    if (!base && href.startsWith('#')) {
                      e.preventDefault()
                      scrollToTarget(href)
                    }
                  }}
                >
                  {label}
                </a>
              ))}
            </nav>
          ))}
        </div>
        <p className="footer-countries mono">{countries.map((c) => c.name).join(' · ')}</p>
        <AiSummary />
      </div>
      <div className="footer-word" aria-hidden="true">
        Wezigns
      </div>
      <div className="wrap footer-bottom mono">
        <div className="footer-legal">
          <span>© 2026 {brand.legal}</span>
          <nav aria-label="Legal">
            {legalLinks.map((l) => (
              <a key={l.href} href={l.href}>
                {l.label}
              </a>
            ))}
          </nav>
        </div>
        <span>
          <a href={`mailto:${brand.email}`}>{brand.email}</a> · <a href={brand.phoneHref}>{brand.phone}</a>
        </span>
      </div>
    </footer>
  )
}
