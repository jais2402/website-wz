import { CtaStrip } from '@/components/CtaStrip'
import { servicesPage as p, systemPages } from '@/content/pages'
import { ctas, navSystems, services } from '@/content/site'
import { LoomContact } from '@/loom/sections'
import { PageHero, PageSection, PageShell } from '../shell'
import { SystemsOrbit } from './SystemsOrbit'
import './services.css'

/** /our-services: every system we build, each linking to its own page, then the three jobs we do for all of them. */
export function ServicesPage() {
  return (
    <PageShell className="sv">
      <PageHero
        kicker={p.kicker}
        title={p.title}
        lead={p.lead}
        actions={
          <>
            <a className="btn btn-lime btn-lg" href={ctas.contact.href}>
              {ctas.contact.label} <span aria-hidden="true">→</span>
            </a>
            <a className="btn btn-ghost btn-lg" href={p.workLink.href}>
              {p.workLink.label}
            </a>
          </>
        }
        visual={<SystemsOrbit />}
      />

      <PageSection title={p.systemsTitle} intro={p.systemsIntro} className="sv-systems">
        <ul className="sv-grid">
          {systemPages.map((s, i) => (
            <li key={s.slug} data-reveal>
              <a className="sv-card" href={`/systems/${s.slug}`}>
                <span className="mono sv-short">{navSystems[i]?.short}</span>
                <h3>{s.title}</h3>
                <p className="sv-promise">{s.promise}</p>
                <p className="sv-intro">{s.intro}</p>
                <span className="mono sv-mod-label">{p.modulesLabel}</span>
                <ul className="sv-mods">
                  {Object.keys(s.modules).map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
                <span className="sv-explore">
                  {p.explore} {s.title} <span aria-hidden="true">→</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </PageSection>

      <PageSection title={p.servicesTitle} intro={p.servicesIntro} className="sv-services">
        <ul className="sv-jobs">
          {services.map((s) => (
            <li key={s.key} className={`sv-job tone-${s.tone}`} data-reveal>
              <span className="mono sv-job-kicker">{s.kicker}</span>
              <h3>{s.title}</h3>
              <ul>
                {s.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </PageSection>

      <CtaStrip {...ctas.system} />
      <LoomContact />
    </PageShell>
  )
}
