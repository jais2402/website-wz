import { sitemapPage as p } from '@/content/sitemap'
import { LoomContact } from '@/loom/sections'
import { PageShell } from '../shell'
import { LegalHero } from './LegalPage'
import '../print.css'
import './legal.css'

/** HTML sitemap (/sitemap): every page in four groups, one line each. sitemap.xml is the crawler version. */
export function SitemapPage() {
  return (
    <PageShell className="lg lg-sitemap">
      <LegalHero kicker={p.kicker} title={p.title.join(' ')} lead={p.lead} mark="map" />

      <div className="wrap">
        <div className="lg-map">
          {p.groups.map((g) => {
            const id = `sitemap-${g.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
            return (
              <section key={g.title} className="lg-map-group" aria-labelledby={id} data-reveal>
                <h2 id={id} className="lg-map-title">
                  {g.title}
                </h2>
                <ul>
                  {g.links.map((l) => (
                    <li key={l.href}>
                      <a href={l.href} className="lg-map-link">
                        <span className="lg-map-label">{l.label}</span>
                        <span className="lg-map-text">{l.text}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}
        </div>
      </div>

      <LoomContact />
    </PageShell>
  )
}
