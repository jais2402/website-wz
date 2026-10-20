import { useGSAP } from '@gsap/react'
import { type CSSProperties, useRef } from 'react'
import { CountUp, ModuleCard } from '@/components/Charts'
import { SplitReveal } from '@/components/Reveal'
import { type SystemPage as Page, type Voice, systemsSection as copy } from '@/content/pages'
import { type Area, type Chart, areas, brand, ctas, sampleDataLabel, workSection } from '@/content/site'
import { type SystemSlug, systemTools, toolsCopy } from '@/content/systemTools'
import { gsap, scrollToTarget, usePrefersReducedMotion } from '@/hooks/motion'
import { CtaStrip } from '@/components/CtaStrip'
import { LoomContact } from '@/loom/sections'
import '../print.css'
import { PageHero, PageSection, PageShell } from '../shell'
import { buildModules, type CaseStudy, findCase, findSystem, otherSystems } from './lookup'
import './system.css'

/** /systems/<slug>: one template for all six system pages. Styles in system.css (classes prefixed `sy-`). */
export function SystemPage({ slug }: { slug: string }) {
  const page = findSystem(slug)
  return page ? <System page={page} /> : <NotFound />
}

function System({ page }: { page: Page }) {
  const area = areas[page.area]
  const caseStudy = findCase(page.caseId)
  const reducedMotion = usePrefersReducedMotion()
  const impact = useRef<HTMLDivElement>(null)
  // Printed on the one-page summary so it can be forwarded.
  const pageUrl = `${window.location.origin}${window.location.pathname}`

  // Each before → after thread draws in as its row arrives; the "after" side lights up with it.
  useGSAP(
    () => {
      if (reducedMotion) return
      gsap.utils.toArray<HTMLElement>('.sy-impact-row').forEach((row) => {
        gsap.fromTo(
          row,
          { '--draw': 0 },
          { '--draw': 1, duration: 1.3, ease: 'power2.inOut', scrollTrigger: { trigger: row, start: 'top 82%' } },
        )
      })
    },
    { scope: impact, dependencies: [reducedMotion] },
  )

  return (
    <PageShell className={`sy sy-${page.slug}`}>
      <div className="print-only sy-print-head">
        <b>{brand.name}</b>
        <span>{pageUrl}</span>
      </div>
      <PageHero
        kicker={copy.kicker}
        title={[`${page.title}.`, page.promise]}
        lead={page.intro}
        actions={
          <>
            <a className="btn btn-lime btn-lg" href={copy.cta.href}>
              {copy.cta.label} <span aria-hidden="true">→</span>
            </a>
            <a
              className="btn btn-ghost btn-lg"
              href="#build"
              onClick={(e) => {
                e.preventDefault()
                scrollToTarget('#build')
              }}
            >
              {copy.buildLink}
            </a>
            <button type="button" className="btn btn-ghost btn-lg" onClick={() => window.print()}>
              <DocIcon /> {copy.print}
            </button>
          </>
        }
        visual={<Dashboard area={area} />}
      />

      <PageSection title={copy.painsTitle} className="sy-pains">
        <div className="sy-bubbles">
          {page.pains.map((p) => (
            <figure key={p.quote} className={`sy-bubble ${voiceClass(p.who)}`} data-reveal>
              <blockquote>
                <p>“{p.quote}”</p>
              </blockquote>
              <figcaption>
                <Who who={p.who} />
              </figcaption>
            </figure>
          ))}
        </div>
      </PageSection>

      <PageSection id="build" title={copy.buildTitle} className="sy-build">
        <ul className="sy-modules">
          {buildModules(page).map((m) => (
            <li key={m.name} className="sy-module" data-reveal>
              <span className="sy-glyph" aria-hidden="true">
                <Glyph kind={m.kind} />
              </span>
              <h3>{m.name}</h3>
              <p>{m.text}</p>
            </li>
          ))}
        </ul>
      </PageSection>

      <PageSection title={copy.impactTitle} className="sy-impact">
        <div ref={impact} className="sy-impact-list">
          {/* Column labels once, instead of on every row (rows keep their own labels on phones). */}
          <div className="sy-impact-head mono" aria-hidden="true">
            <span />
            <span>
              <i className="sy-dot" /> Before
            </span>
            <span />
            <span>
              <Check /> After
            </span>
          </div>
          {page.impact.map((r) => (
            <div key={r.before} className={`sy-impact-row ${voiceClass(r.who)}`} data-reveal>
              <Who who={r.who} />
              <p className="sy-before">
                <span className="mono sy-side">
                  <i className="sy-dot" aria-hidden="true" /> Before
                </span>
                {r.before}
              </p>
              <span className="sy-thread" aria-hidden="true">
                <i />
              </span>
              <p className="sy-after">
                <span className="mono sy-side">
                  <Check /> After
                </span>
                {r.after}
              </p>
            </div>
          ))}
        </div>
        {page.proof && (
          <div className="sy-proof glass-card" data-reveal>
            <b className="sy-proof-value">{page.proof.value}</b>
            <p className="sy-proof-label">{page.proof.label}</p>
            <a className="sy-proof-link" href={`/portfolio#${page.proof.caseId}`}>
              {copy.readCase} <span aria-hidden="true">→</span>
            </a>
          </div>
        )}
      </PageSection>

      <CtaStrip {...ctas.system} />

      <PageSection title={copy.toolsTitle} className="sy-tools">
        <ToolMap slug={page.slug as SystemSlug} />
      </PageSection>

      <section className="sy-close wrap">
        {caseStudy && (
          <div className="sy-case" data-reveal>
            <p className="mono label">{workSection.title}</p>
            <CaseCard c={caseStudy} />
          </div>
        )}
        <nav className="sy-more" aria-label={copy.moreTitle}>
          <SplitReveal as="h2" className="display sy-more-title" text={copy.moreTitle} />
          <ul>
            {otherSystems(page.slug).map((s) => (
              <li key={s.slug} data-reveal>
                <a className="sy-more-card" href={`/systems/${s.slug}`}>
                  <span className="sy-more-name">{s.title}</span>
                  <span className="sy-more-promise">{s.promise}</span>
                  <span className="sy-more-arrow" aria-hidden="true">
                    →
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </section>

      <aside className="print-only sy-print-contact">
        <b>{brand.legal}</b>
        <p>
          {brand.phone}, {brand.email}
        </p>
        <p>{brand.address.join(', ')}</p>
        <p>{pageUrl}</p>
      </aside>

      <LoomContact />
    </PageShell>
  )
}

/** The home explorer's mini dashboard for this system: KPIs and four live modules, tilted slightly in 3D. */
function Dashboard({ area }: { area: Area }) {
  return (
    <div className="sy-stage" data-reveal>
      <div className="areas-screen sy-screen">
        <div className="screen-bar">
          <span className="mono">wezigns / {area.title.toLowerCase()}</span>
          <span className="sy-bar-end">
            <span className="mono sy-sample">{sampleDataLabel}</span>
            <span className="screen-status mono">
              <i className="live" /> synced
            </span>
          </span>
        </div>
        <div className="screen-kpis">
          {area.kpis.map((k, i) => (
            <div className="screen-kpi" key={k.label}>
              <span className="mono">{k.label}</span>
              <b>
                <CountUp
                  value={k.value}
                  prefix={k.prefix}
                  suffix={k.suffix}
                  decimals={k.decimals}
                  delay={300 + i * 80}
                />
              </b>
            </div>
          ))}
        </div>
        <div className="mods sy-mods">
          {area.modules.slice(0, 4).map((m, i) => (
            <ModuleCard key={m.name} m={m} wide={false} index={i} />
          ))}
        </div>
      </div>
    </div>
  )
}

function CaseCard({ c }: { c: CaseStudy }) {
  return (
    <article className={`case-card tone-${c.tone}`}>
      <span className="mono case-card-tag">
        {c.sector}
        {c.place && <span className="case-card-place">{c.place}</span>}
      </span>
      <h3>{c.title}</h3>
      <p className="case-card-body">{c.body}</p>
      {c.metrics?.length ? (
        <dl className="case-card-metrics">
          {c.metrics.map((m) => (
            <div key={m.label}>
              <dt>{m.value}</dt>
              <dd>{m.label}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      <ul className="case-card-tags">
        {c.tags.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </article>
  )
}

const voiceClass = (who: Voice) => `who-${who.split(' ')[0].toLowerCase()}`

/** Role tag with a small avatar dot coloured by role (colour set by the `who-*` class on the parent). */
const TONES = ['#4d9fff', '#8b7bff', '#ff7a59', '#8cc4ff', '#a7a7b8']

/** Two-letter badge from the tool name (no logos: the site draws everything in code). */
const monogram = (name: string) => {
  const words = name
    .replace(/[^A-Za-z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
  return (words.length > 1 ? words[0][0] + words[1][0] : name.slice(0, 2)).toUpperCase()
}

/**
 * The tools a system connects to: a count on the left, then each group as a row of tiles
 * (badge, name, what we connect it for). Hosting is the last group on every page.
 */
function ToolMap({ slug }: { slug: SystemSlug }) {
  const groups = systemTools[slug]
  const count = groups.reduce((n, g) => n + g.tools.length, 0)
  return (
    <div className="sy-toolmap">
      <div className="sy-toolmap-hub" data-reveal>
        <b className="sy-toolmap-count">{count}</b>
        <p className="sy-toolmap-label">{toolsCopy.countLabel}</p>
        <p className="sy-toolmap-note">{toolsCopy.note}</p>
      </div>
      <div className="sy-toolmap-groups">
        {groups.map((g, gi) => (
          <section
            key={g.label}
            className="sy-toolgroup"
            style={{ '--tone': TONES[gi % TONES.length] } as CSSProperties}
            data-reveal
          >
            <h3 className="mono sy-toolgroup-label">{g.label}</h3>
            <ul className="sy-tooltiles">
              {g.tools.map((t) => (
                <li key={t.name} className="sy-tooltile">
                  <span className="sy-toolbadge" aria-hidden="true">
                    {monogram(t.name)}
                  </span>
                  <span className="sy-tooltext">
                    <b>{t.name}</b>
                    <span>{t.role}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}

function Who({ who }: { who: Voice }) {
  return (
    <span className="sy-who">
      <i aria-hidden="true" />
      <span className="mono">{who}</span>
    </span>
  )
}

/** Small page-with-lines icon for the summary button. */
function DocIcon() {
  return (
    <svg className="sy-doc-icon" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M4 1.5h5.5L13 5v9.5H4z" />
      <path d="M9.5 1.5V5H13M6.5 8.5h4M6.5 11h4" />
    </svg>
  )
}

function Check() {
  return (
    <svg className="sy-check" viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="7.5" />
      <path d="M4.6 8.3l2.2 2.2 4.6-4.8" />
    </svg>
  )
}

/** A tiny line icon echoing the module's dashboard chart. */
function Glyph({ kind }: { kind: Chart['kind'] }) {
  const shape = (() => {
    switch (kind) {
      case 'line':
        return <path d="M3 17l5-5 4 3 7-8" />
      case 'area':
        return (
          <>
            <path d="M3 17l5-5 4 3 7-8" />
            <path d="M3 17l5-5 4 3 7-8V21H3z" className="fill" />
          </>
        )
      case 'bars':
        return <path d="M5 20v-6M10 20V9M15 20v-8M20 20V5" />
      case 'ring':
        return (
          <>
            <circle cx="12" cy="12" r="8" className="dim" />
            <path d="M12 4a8 8 0 0 1 7.6 10.5" />
          </>
        )
      case 'gauge':
        return (
          <>
            <path d="M4 17a8 8 0 0 1 16 0" className="dim" />
            <path d="M4 17a8 8 0 0 1 12.5-6.6M12 17l4-5" />
          </>
        )
      case 'heatmap':
        return <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />
      case 'funnel':
        return <path d="M3 5h18M6 10h12M9 15h6M11 20h2" />
      case 'stack':
        return <path d="M3 6h16M3 12h11M3 18h7" />
      case 'list':
        return <path d="M4 6h2M9 6h11M4 12h2M9 12h11M4 18h2M9 18h11" />
      case 'dots':
        return <path d="M6 6h.01M12 6h.01M18 6h.01M6 12h.01M12 12h.01M18 12h.01M6 18h.01M12 18h.01" />
    }
  })()
  return (
    <svg viewBox="0 0 24 24" className={`sy-glyph-${kind}`} aria-hidden="true">
      {shape}
    </svg>
  )
}

function NotFound() {
  return (
    <PageShell className="sy sy-missing">
      <section className="pg-hero wrap">
        <div className="pg-hero-copy">
          <p className="mono label">{copy.kicker}</p>
          <h1 className="display pg-title">We could not find that page.</h1>
          <div className="pg-actions">
            <a className="btn btn-lime btn-lg" href="/">
              Back to the home page <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </section>
    </PageShell>
  )
}
