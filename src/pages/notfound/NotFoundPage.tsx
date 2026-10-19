import { ctas } from '@/content/site'
import { notFoundPage as p } from '@/content/pages'
import { LoomContact } from '@/loom/sections'
import { HeroLoom } from '../HeroLoom'
import { PageHero, PageSection, PageShell } from '../shell'
import './notfound.css'

/** 404: served by Vercel for any unknown URL. Way back home, the main pages, and the contact block. */
export function NotFoundPage() {
  return (
    <PageShell className="nf">
      <PageHero
        kicker={p.kicker}
        title={p.title}
        lead={p.lead}
        actions={
          <>
            <a className="btn btn-lime btn-lg" href={p.home.href}>
              {p.home.label} <span aria-hidden="true">→</span>
            </a>
            <a className="btn btn-ghost btn-lg" href={ctas.contact.href}>
              {ctas.contact.label}
            </a>
          </>
        }
        visual={<HeroLoom />}
      />

      <PageSection title={p.linksTitle} className="nf-links">
        <ul className="nf-grid">
          {p.links.map((l) => (
            <li key={l.href} data-reveal>
              <a href={l.href} className="nf-card">
                <span className="nf-card-label">{l.label}</span>
                <span className="nf-card-text">{l.text}</span>
                <span className="nf-card-arrow" aria-hidden="true">
                  →
                </span>
              </a>
            </li>
          ))}
        </ul>
      </PageSection>

      <LoomContact />
    </PageShell>
  )
}
