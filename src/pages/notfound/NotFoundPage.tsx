import { useEffect, useState } from 'react'
import { ctas } from '@/content/site'
import { notFoundPage as p } from '@/content/pages'
import { track } from '@/lib/analytics'
import { suggestPage } from '@/lib/notFound'
import { LoomContact } from '@/loom/sections'
import { HeroLoom } from '../HeroLoom'
import { PageHero, PageSection, PageShell } from '../shell'
import './notfound.css'

/** The address the visitor asked for, or null on /404 itself (and in the build-time prerender). */
function missingPath(): string | null {
  const path = window.location.pathname
  return /^\/404(\.html)?\/?$/.test(path) ? null : path
}

/** Which site sent the visitor here (a broken link elsewhere), as a host name only. */
function referrerHost(): string {
  try {
    return document.referrer ? new URL(document.referrer).hostname : ''
  } catch {
    return ''
  }
}

/**
 * 404: served by Vercel for any unknown URL. Names the address that is missing, offers the closest real page when
 * there is a confident match (lib/notFound.ts), the main pages, and the contact block. The missing path (no query
 * string, which can carry personal data) goes to Analytics as 'page_not_found' once the visitor has accepted it.
 */
export function NotFoundPage() {
  // Read after mount: the prerendered HTML is the same for every missing address.
  const [path, setPath] = useState<string | null>(null)
  useEffect(() => {
    const missing = missingPath()
    setPath(missing)
    if (missing) track('page_not_found', { page_path: missing.slice(0, 100), referrer: referrerHost() })
  }, [])
  const suggestion = path ? suggestPage(path, p.suggest) : null

  return (
    <PageShell className="nf">
      <PageHero
        kicker={p.kicker}
        title={p.title}
        lead={p.lead}
        actions={
          <>
            {path && (
              <p className="nf-missing">
                <code className="mono">{path}</code> {p.missing}
              </p>
            )}
            {suggestion ? (
              <>
                <a className="btn btn-lime btn-lg" href={suggestion.path}>
                  {p.didYouMean} {suggestion.label}? <span aria-hidden="true">→</span>
                </a>
                <a className="btn btn-ghost btn-lg" href={p.home.href}>
                  {p.home.label}
                </a>
              </>
            ) : (
              <>
                <a className="btn btn-lime btn-lg" href={p.home.href}>
                  {p.home.label} <span aria-hidden="true">→</span>
                </a>
                <a className="btn btn-ghost btn-lg" href={ctas.contact.href}>
                  {ctas.contact.label}
                </a>
              </>
            )}
          </>
        }
        visual={<HeroLoom variant="frayed" />}
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
