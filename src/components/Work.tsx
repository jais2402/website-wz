import type { CSSProperties } from 'react'
import { pastWork, work, workSection } from '@/content/site'
import { CaseArt } from './CaseArt'
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
 * Our Work on the home page: five cases in one bento grid (a large lead tile, four smaller ones) and a tile that
 * leads to /portfolio for the rest. No pin or sideways scroll; on phones the tiles stack.
 */
export function Work() {
  return (
    <section id="work" className="panel work">
      <div className="wrap">
        <header className="wk-head">
          <SplitReveal as="h2" className="display" text={workSection.title} />
          <p className="lead">{workSection.lead}</p>
        </header>

        <div className="wk-bento">
          {featured.map((c, i) => (
            <article key={c.id} className={`case-card wk-tile tone-${c.tone}${i === 0 ? ' wk-lead' : ''}`} data-reveal>
              <span className="mono case-card-tag">
                {c.sector}
                {c.place && <span className="case-card-place">{c.place}</span>}
              </span>
              <h3>{c.title}</h3>
              <p className="case-card-body">{c.body}</p>
              <CaseArt modules={c.tags} />
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
            </article>
          ))}

          <a className="case-card wk-tile wk-more" href={workSection.all.href}>
            <MoreStack />
            <h3>{workSection.more.title}</h3>
            <p className="case-card-body">{workSection.more.body}</p>
            <span className="btn btn-lime">
              {workSection.all.label} <span aria-hidden="true">→</span>
            </span>
          </a>
        </div>
      </div>
    </section>
  )
}

const STACK = ['coral', 'violet', 'lime'] as const

/** "More behind this": three mini system windows stacked like a deck, in the case colours; they fan out on hover. */
function MoreStack() {
  return (
    <div className="wk-stack" aria-hidden="true">
      {STACK.map((tone, k) => (
        <div key={tone} className={`wk-stack-win tone-${tone}`} style={{ '--k': k } as CSSProperties}>
          <span className="wk-stack-dots">
            <i />
            <i />
            <i />
          </span>
          {[82, 58, 70].map((w, r) => (
            <span key={r} className="wk-stack-row">
              <b style={{ width: `${w - k * 6}%` }} />
            </span>
          ))}
          <span className="wk-stack-bars">
            {[40, 55, 48, 66, 60, 78, 90].map((h, b) => (
              <i key={b} style={{ height: `${h}%` }} />
            ))}
          </span>
        </div>
      ))}
    </div>
  )
}
