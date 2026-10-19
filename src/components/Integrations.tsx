import { ctas, integrations, integrationsSection } from '@/content/site'
import { LogoMark } from './Logo'
import { SplitReveal } from './Reveal'

/** Two counter-rotating orbits of integration categories around the Wezigns core. */
export function Integrations() {
  const inner = integrations.slice(0, 4)
  const outer = integrations.slice(4)
  return (
    <section id="integrations" className="panel integrations">
      <div className="wrap integrations-grid">
        <div>
          <SplitReveal as="h2" className="display" text={integrationsSection.title} />
          <p className="lead">{integrationsSection.body}</p>
          <a className="btn btn-ghost section-link" href={ctas.integrations.href}>
            {ctas.integrations.label} <span aria-hidden="true">→</span>
          </a>
        </div>
        <div className="orbit" aria-label={`Integrations: ${integrations.join(', ')}`}>
          <div className="orbit-core">
            <LogoMark size={44} />
          </div>
          <div className="ring ring-1">
            {inner.map((t, i) => (
              <span key={t} className="sat" style={{ ['--a' as string]: `${(360 / inner.length) * i}deg` }}>
                <span>{t}</span>
              </span>
            ))}
          </div>
          <div className="ring ring-2">
            {outer.map((t, i) => (
              <span key={t} className="sat" style={{ ['--a' as string]: `${(360 / outer.length) * i + 45}deg` }}>
                <span>{t}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
