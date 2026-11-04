import { work, pastWork, workSection } from '@/content/site'
import { SplitReveal } from './Reveal'

type Case = {
  id: string
  sector: string
  place?: string
  title: string
  body: string
  metrics?: readonly { value: string; label: string }[]
  tags: readonly string[]
  tone: string
}

const all: Case[] = [...work, ...pastWork]
const featured = workSection.featured.map((id) => all.find((c) => c.id === id)).filter((c): c is Case => Boolean(c))

/**
 * Our Work on the home page: five cases in one bento that fits a single screen on desktop. Top row: the lead case
 * as a wide tile (sector, headline and summary on the left, its two results stacked large on the right) and one
 * case beside it. Bottom row: three cases side by side. Every tile ends on a result, or on its modules when a case
 * has no published result. The rest are on /portfolio, linked from the head. Tablets get two columns, phones one.
 */
export function Work() {
  return (
    <section id="work" className="panel work">
      <div className="wrap">
        <header className="wk-head">
          <SplitReveal as="h2" className="display" text={workSection.title} />
          <div className="wk-head-side">
            <p className="lead">{workSection.lead}</p>
            <a className="btn btn-ghost wk-all" href={workSection.all.href}>
              {workSection.all.label} <span aria-hidden="true">→</span>
            </a>
          </div>
        </header>

        <div className="wk-bento">
          {featured.map((c, i) =>
            i === 0 ? (
              <article key={c.id} className={`case-card wk-tile wk-lead tone-${c.tone}`} data-reveal>
                <div className="wk-lead-copy">
                  <Tag c={c} />
                  <h3>{c.title}</h3>
                  <p className="case-card-body">{c.body}</p>
                </div>
                {c.metrics?.length ? (
                  <dl className="case-card-metrics wk-lead-metrics">
                    {c.metrics.map((m) => (
                      <div key={m.label}>
                        <dt>{m.value}</dt>
                        <dd>{m.label}</dd>
                      </div>
                    ))}
                  </dl>
                ) : null}
              </article>
            ) : (
              <article key={c.id} className={`case-card wk-tile wk-small tone-${c.tone}`} data-reveal>
                <Tag c={c} />
                <h3>{c.title}</h3>
                {c.metrics?.length ? (
                  <dl className="case-card-metrics">
                    <div>
                      <dt>{c.metrics[0].value}</dt>
                      <dd>{c.metrics[0].label}</dd>
                    </div>
                  </dl>
                ) : (
                  <ul className="case-card-tags">
                    {c.tags.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                )}
              </article>
            ),
          )}
        </div>
      </div>
    </section>
  )
}

function Tag({ c }: { c: Case }) {
  return (
    <span className="mono case-card-tag">
      {c.sector}
      {c.place && <span className="case-card-place">{c.place}</span>}
    </span>
  )
}
