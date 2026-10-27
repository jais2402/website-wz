import { brand, countries, footer, footerCopy, legalLinks, socials, whatsappHref } from '@/content/site'
import { scrollToTarget } from '@/hooks/motion'
import { AiSummary } from './AiSummary'
import { CookieSettingsButton } from './CookieBanner'
import { Logo } from './Logo'
import { SocialIcon, type SocialName } from './SocialIcon'

/** `base` prefixes in-page links when the footer is used on another page (e.g. './' from the loom page). */
export function Footer({ base = '' }: { base?: string }) {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-top">
          <div className="footer-brand">
            <Logo />
            <p>{footerCopy.tagline}</p>
            <address className="footer-address">{brand.address.join(', ')}</address>
            <ul className="footer-social" aria-label="Wezigns elsewhere">
              {Object.entries(socials).map(([name, x]) => (
                <li key={x.href}>
                  <a href={x.href} target="_blank" rel="noopener noreferrer" aria-label={x.label} title={x.label}>
                    <SocialIcon name={name as SocialName} />
                  </a>
                </li>
              ))}
              {whatsappHref && (
                <li>
                  <a href={whatsappHref} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" title="WhatsApp">
                    <SocialIcon name="whatsapp" />
                  </a>
                </li>
              )}
            </ul>
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
        <div className="footer-countries">
          <span className="mono">Systems live in {countries.length} countries</span>
          <ul>
            {countries.map((c) => (
              <li key={c.name}>{c.name}</li>
            ))}
          </ul>
        </div>
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
            <CookieSettingsButton />
          </nav>
        </div>
        <span>
          <span className="footer-reach">
            <a href={`mailto:${brand.email}`}>{brand.email}</a>
            <a href={brand.phoneHref}>{brand.phone}</a>
          </span>
        </span>
      </div>
    </footer>
  )
}
