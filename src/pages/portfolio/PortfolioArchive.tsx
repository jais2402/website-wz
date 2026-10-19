import { type MouseEvent, useState } from 'react'
import { portfolioPage as p } from '@/content/pages'
import { archiveSectors, portfolioArchive } from '@/content/site'
import { scrollToTarget } from '@/hooks/motion'
import { countLabel, filterBySector, sectorCounts } from '@/lib/portfolio'

type Sector = (typeof archiveSectors)[number]

const chips = sectorCounts(portfolioArchive, archiveSectors)

// In-page links go through Lenis (window.scrollTo is overridden by it).
function toSystem(e: MouseEvent<HTMLAnchorElement>) {
  e.preventDefault()
  const href = e.currentTarget.getAttribute('href') ?? ''
  scrollToTarget(href)
  history.replaceState(null, '', href)
}

/** Every project from the old portfolio, by name, with sector chips (toggle buttons) to narrow the list. */
export function PortfolioArchive() {
  const [sector, setSector] = useState<Sector | null>(null)
  const shown = filterBySector(portfolioArchive, sector)

  return (
    <div className="pf-archive">
      <div className="pf-chips" role="group" aria-label={p.filterLabel}>
        <button type="button" className="pf-chip" aria-pressed={sector === null} onClick={() => setSector(null)}>
          {p.allLabel} <span className="pf-chip-count">{portfolioArchive.length}</span>
        </button>
        {chips.map((c) => (
          <button
            key={c.sector}
            type="button"
            className="pf-chip"
            aria-pressed={sector === c.sector}
            onClick={() => setSector(sector === c.sector ? null : c.sector)}
          >
            {c.sector} <span className="pf-chip-count">{c.count}</span>
          </button>
        ))}
      </div>

      <p className="mono pf-archive-status" role="status" aria-live="polite">
        {countLabel(p.shownLabel, shown.length, portfolioArchive.length)}
      </p>

      <ul className="pf-archive-list">
        {shown.map((item) => (
          <li key={item.id} id={item.id} className="pf-archive-item">
            <span className="pf-archive-name">{item.name}</span>
            {item.sector !== 'Other' && <span className="mono pf-archive-sector">{item.sector}</span>}
            {item.system && (
              <a className="pf-archive-link" href={`#${item.system}`} onClick={toSystem}>
                {p.systemLink} <span aria-hidden="true">↑</span>
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
