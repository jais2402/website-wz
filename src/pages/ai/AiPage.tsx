import { useGSAP } from '@gsap/react'
import { type MouseEvent, type ReactNode, useRef } from 'react'
import { aiPage } from '@/content/pages'
import { gsap, scrollToTarget, usePrefersReducedMotion } from '@/hooks/motion'
import { CtaStrip } from '@/components/CtaStrip'
import { ctas } from '@/content/site'
import { LoomContact } from '@/loom/sections'
import { PageHero, PageSection, PageShell } from '../shell'
import './ai.css'

// The AI page: AI inside the systems you run, and custom AI solutions. Styles in ai.css (classes prefixed `aip-`,
// since the home page AI section already uses `ai-`).

/** In-page links go through Lenis so they glide like the rest of the page. */
function jump(e: MouseEvent<HTMLAnchorElement>) {
  e.preventDefault()
  scrollToTarget(e.currentTarget.getAttribute('href') ?? '')
}

export function AiPage() {
  return (
    <PageShell className="aip">
      <PageHero
        kicker={aiPage.kicker}
        title={aiPage.title}
        lead={aiPage.lead}
        actions={
          <>
            <a className="btn btn-lime" href={aiPage.cta.href}>
              {aiPage.cta.label} <span aria-hidden="true">→</span>
            </a>
            <a className="btn btn-ghost" href="#ways" onClick={jump}>
              {aiPage.heroLink}
            </a>
          </>
        }
        visual={<HeroVisual />}
      />
      <Ways />
      <Inside />
      <Solutions />
      <CtaStrip {...ctas.ai} />
      <How />
      <LoomContact />
    </PageShell>
  )
}

/* ---------- Hero: a record is read, threads carry it into the AI knot, three outputs come out ---------- */

const docLines = [0, 1, 2, 3, 4, 5]
const inY = [130, 190, 250]
const outs = [
  { y: 110, label: 'Flag', tone: 'coral' },
  { y: 190, label: 'Draft', tone: 'violet' },
  { y: 270, label: 'Approve ✓', tone: 'blue' },
]

function HeroVisual() {
  return (
    <svg
      className="aip-hero-svg"
      viewBox="0 0 520 380"
      role="img"
      aria-label={aiPage.heroVisualLabel}
    >
      <defs>
        <radialGradient id="aip-knot-glow">
          <stop offset="0%" stopColor="#8cc4ff" stopOpacity="0.9" />
          <stop offset="45%" stopColor="#8b7bff" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#8b7bff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="aip-scan" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4d9fff" stopOpacity="0" />
          <stop offset="80%" stopColor="#4d9fff" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#8cc4ff" stopOpacity="0.9" />
        </linearGradient>
        <clipPath id="aip-doc-clip">
          <rect x="24" y="70" width="140" height="240" rx="14" />
        </clipPath>
      </defs>

      {/* Threads: record → knot → outputs */}
      {inY.map((y, i) => (
        <path
          key={`i${i}`}
          className="aip-thread"
          d={`M164 ${y} C 215 ${y}, 225 190, 270 190`}
          style={{ animationDelay: `${i * -0.4}s` }}
        />
      ))}
      {outs.map((o, i) => (
        <path
          key={`o${i}`}
          className="aip-thread is-out"
          d={`M270 190 C 315 190, 320 ${o.y}, 352 ${o.y}`}
          style={{ animationDelay: `${i * -0.3}s` }}
        />
      ))}

      {/* The record */}
      <g className="aip-doc">
        <rect x="24" y="70" width="140" height="240" rx="14" className="aip-doc-card" />
        <rect x="42" y="90" width="58" height="8" rx="4" className="aip-doc-head" />
        <rect x="128" y="88" width="20" height="12" rx="3" className="aip-doc-tag" />
        {docLines.map((i) => (
          <rect
            key={i}
            x="42"
            y={122 + i * 28}
            width={i % 3 === 1 ? 70 : i % 2 ? 84 : 104}
            height="6"
            rx="3"
            className="aip-doc-line"
            style={{ animationDelay: `${0.35 + i * 0.28}s` }}
          />
        ))}
        <g clipPath="url(#aip-doc-clip)">
          <rect x="24" y="30" width="140" height="44" className="aip-scan" fill="url(#aip-scan)" />
        </g>
      </g>

      {/* The AI knot */}
      <g className="aip-knot">
        <circle cx="270" cy="190" r="62" fill="url(#aip-knot-glow)" className="aip-knot-glow" />
        {/* Three tilted orbits, each turning at its own pace */}
        {[0, 60, -60].map((tilt, i) => (
          <g key={tilt} transform={`rotate(${tilt} 270 190)`}>
            <ellipse cx="270" cy="190" rx="26" ry="11" className={`aip-knot-ring is-${i}`} />
          </g>
        ))}
        <circle cx="270" cy="190" r="8" className="aip-knot-core" />
      </g>

      {/* Outputs, in turn; the last one waits for a person */}
      {outs.map((o, i) => {
        const last = i === outs.length - 1
        return (
          <g
            key={o.label}
            className={`aip-out is-${o.tone}${last ? ' is-wait' : ''}`}
            style={{ animationDelay: `${i * 0.7}s` }}
          >
            <rect x="352" y={o.y - 19} width={last ? 148 : 104} height="38" rx="19" className="aip-out-pill" />
            <circle cx="372" cy={o.y} r="5" className="aip-out-dot" />
            <text x="386" y={o.y + 5} className="aip-out-text">
              {o.label}
            </text>
            {last && (
              <g className="aip-person" transform={`translate(468 ${o.y})`}>
                <circle cx="0" cy="-6" r="5" />
                <path d="M-9 10 C -9 2, 9 2, 9 10" />
                <g className="aip-person-check">
                  <circle cx="9" cy="-9" r="6" />
                  <path d="M6.4 -9 L8.4 -7 L11.8 -11" />
                </g>
              </g>
            )}
          </g>
        )
      })}
    </svg>
  )
}

/* ---------- Two ways to use AI ---------- */

function Ways() {
  return (
    <PageSection id="ways" title={aiPage.waysTitle}>
      <div className="aip-ways">
        {aiPage.ways.map((w) => (
          <article key={w.key} className={`aip-way glass-card is-${w.key}`} data-reveal>
            <div className="aip-way-visual" aria-hidden="true">
              {w.key === 'inside' ? <SystemWindow /> : <ToolCard />}
            </div>
            <p className="mono aip-way-label">{w.label}</p>
            <h3 className="aip-way-title">{w.title}</h3>
            <p className="aip-way-text">{w.text}</p>
            <a className="aip-way-link" href={w.key === 'inside' ? '#inside' : '#solutions'} onClick={jump}>
              {aiPage.waysLink} <span aria-hidden="true">↓</span>
            </a>
          </article>
        ))}
      </div>
    </PageSection>
  )
}

/** A system the client already runs, with AI working inside one of its rows. */
function SystemWindow() {
  return (
    <div className="aip-win">
      <div className="aip-win-bar">
        <i />
        <i />
        <i />
        <span className="aip-win-tab" />
      </div>
      <div className="aip-win-body">
        <div className="aip-win-side">
          <span />
          <span />
          <span />
        </div>
        <div className="aip-win-rows">
          <span />
          <span className="is-ai">
            <b className="aip-ai-chip">AI</b>
          </span>
          <span />
          <span />
        </div>
      </div>
    </div>
  )
}

/** A standalone AI tool: a question in, an answer out with its source. */
function ToolCard() {
  return (
    <div className="aip-tool">
      <div className="aip-tool-head">
        <span className="aip-tool-orb" />
        <span className="aip-tool-name" />
      </div>
      <span className="aip-bubble is-q" />
      <span className="aip-bubble is-a">
        <i />
        <i />
        <b className="aip-tool-src" />
      </span>
    </div>
  )
}

/* ---------- AI workflows inside your systems ---------- */

const icons: ReactNode[] = [
  // Invoice matching: two documents, matched
  <>
    <rect x="4" y="5" width="12" height="16" rx="2" />
    <rect x="16" y="11" width="12" height="16" rx="2" />
    <path d="M19 19 l2.5 2.5 L26 17" />
  </>,
  // Reorder: a box with a cycle arrow
  <>
    <path d="M5 12 L14 7 L23 12 L14 17 Z" />
    <path d="M5 12 V21 L14 26 V17" />
    <path d="M27 18 a5 5 0 1 1 -2 -4" />
    <path d="M25 11 V14.5 H28.5" />
  </>,
  // CV screening: a person and a shortlist
  <>
    <circle cx="10" cy="10" r="4" />
    <path d="M3 22 C 3 15, 17 15, 17 22" />
    <path d="M20 9 H28 M20 14 H28 M20 19 H25" />
  </>,
  // Reply drafts: a speech bubble with lines
  <>
    <path d="M5 6 H27 V20 H14 L8 26 V20 H5 Z" />
    <path d="M10 11 H22 M10 15 H18" />
  </>,
  // Product copy and search: a tag and a magnifier
  <>
    <path d="M4 14 L14 4 H22 V12 L12 22 Z" />
    <circle cx="18" cy="8" r="1.5" />
    <circle cx="22" cy="22" r="4" />
    <path d="M25 25 L28 28" />
  </>,
  // Ask your data: a question over a table
  <>
    <rect x="4" y="13" width="24" height="14" rx="2" />
    <path d="M4 20 H28 M14 13 V27" />
    <path d="M12 4 H24 V9 H16 L13 11 V9 H12 Z" />
  </>,
]

function Inside() {
  return (
    <PageSection id="inside" kicker={aiPage.ways[0].label} title={aiPage.insideTitle}>
      <div className="aip-inside">
        {aiPage.inside.map((item, i) => (
          <article key={item.title} className="aip-inside-card" data-reveal>
            <div className="aip-inside-top">
              <span className="mono aip-sys">{item.system}</span>
              <svg className="aip-icon" viewBox="0 0 32 32" aria-hidden="true">
                {icons[i]}
              </svg>
            </div>
            <h3 className="aip-card-title">{item.title}</h3>
            <p className="aip-card-text">{item.text}</p>
          </article>
        ))}
      </div>
    </PageSection>
  )
}

/* ---------- Custom AI solutions ---------- */

function Solutions() {
  return (
    <PageSection id="solutions" kicker={aiPage.ways[1].label} title={aiPage.solutionsTitle}>
      <div className="aip-solutions">
        {aiPage.solutions.map((s) => (
          <article key={s.title} className="aip-sol glass-card" data-reveal>
            <h3 className="aip-card-title">{s.title}</h3>
            <p className="aip-card-text">{s.text}</p>
            <ol className="aip-flow" aria-label={`${s.title}: ${s.flow.join(', then ')}`}>
              {s.flow.map((step, i) => (
                <li key={step} className={i === s.flow.length - 1 ? 'is-end' : undefined}>
                  {i > 0 && <span className="aip-flow-thread" aria-hidden="true" />}
                  <span className="aip-flow-step">{step}</span>
                </li>
              ))}
            </ol>
          </article>
        ))}
      </div>
    </PageSection>
  )
}

/* ---------- How we build it, then the guardrails ---------- */

function How() {
  const reducedMotion = usePrefersReducedMotion()
  const root = useRef<HTMLDivElement>(null)

  // A thread fills through the five knots as the steps scroll past. Under reduced motion it stays full (CSS default).
  useGSAP(
    () => {
      const el = root.current
      if (reducedMotion || !el) return
      const track = el.querySelector<HTMLElement>('.aip-how-track')
      const knots = gsap.utils.toArray<HTMLElement>('.aip-how-knot')
      if (!track) return
      let marks: number[] = []
      const measure = () => {
        // Where each knot sits along the track (0..1), horizontal or vertical depending on the layout.
        const t = track.getBoundingClientRect()
        const vertical = t.height > t.width
        marks = knots.map((k) => {
          const r = k.getBoundingClientRect()
          const at = vertical ? (r.top + r.height / 2 - t.top) / t.height : (r.left + r.width / 2 - t.left) / t.width
          return Math.min(1, Math.max(0, at))
        })
      }
      const paint = (p: number) => {
        el.style.setProperty('--p', p.toFixed(4))
        knots.forEach((k, i) => k.classList.toggle('is-on', p >= marks[i] - 0.01))
      }
      measure()
      const state = { p: 0 }
      paint(0)
      gsap.to(state, {
        p: 1,
        ease: 'none',
        onUpdate: () => paint(state.p),
        scrollTrigger: { trigger: el, start: 'top 75%', end: 'bottom 55%', scrub: 0.6, onRefresh: measure },
      })
    },
    { scope: root, dependencies: [reducedMotion] },
  )

  return (
    <PageSection id="how" kicker={aiPage.howKicker} title={aiPage.howTitle}>
      <div ref={root} className="aip-how">
        <div className="aip-how-track" aria-hidden="true">
          <span className="aip-how-fill" />
        </div>
        <ol className="aip-how-steps">
          {aiPage.how.map((step) => (
            <li key={step.title} className="aip-how-step">
              <span className="aip-how-knot is-on" aria-hidden="true" />
              <h3 className="aip-how-title">{step.title}</h3>
              <p className="aip-card-text">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>

      <div className="aip-guards">
        {aiPage.guardrails.map((g, i) => (
          <article key={g.title} className="aip-guard glass-card" data-reveal>
            <svg className="aip-icon" viewBox="0 0 32 32" aria-hidden="true">
              {guardIcons[i]}
            </svg>
            <div>
              <h3 className="aip-guard-title">{g.title}</h3>
              <p className="aip-card-text">{g.text}</p>
            </div>
          </article>
        ))}
      </div>
    </PageSection>
  )
}

const guardIcons: ReactNode[] = [
  // A person signs off
  <>
    <circle cx="13" cy="10" r="5" />
    <path d="M3 27 C 3 18, 23 18, 23 27" />
    <path d="M21 13 l3 3 L30 10" />
  </>,
  // Data stays in your systems
  <>
    <ellipse cx="16" cy="8" rx="10" ry="4" />
    <path d="M6 8 V24 C 6 26.2, 10.5 28, 16 28 S 26 26.2, 26 24 V8" />
    <path d="M6 16 C 6 18.2, 10.5 20, 16 20 S 26 18.2, 26 16" />
  </>,
  // Everything is logged
  <>
    <rect x="5" y="4" width="22" height="24" rx="3" />
    <path d="M10 11 H22 M10 16 H22 M10 21 H17" />
  </>,
]
