import { useGSAP } from '@gsap/react'
import { type CSSProperties, type MouseEvent, type ReactNode, useEffect, useRef } from 'react'
import { aiPage } from '@/content/pages'
import { gsap, scrollToTarget, usePrefersReducedMotion } from '@/hooks/motion'
import { CHAT_FINAL, CHAT_FLAGS, chatFlagsAt, testRunAt, typedChars } from '@/lib/aiHero'
import { damp, pointerOffset, tiltAngles } from '@/lib/tilt'
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

/* ---------- Hero: an AI chat over your own records ----------
   A white app window floats in a CSS 3D stage with two notes at other depths; the stage turns toward the pointer
   (fine pointers only) and tips back as the hero scrolls away. A ten-second story loops inside it (timeline in
   lib/aiHero.ts): the question types in, the AI answers with its sources, suggests a step, and a person approves it.
   The markup is the finished conversation, which is what reduced motion and the prerendered page show. */

const chat = aiPage.chat

function HeroVisual() {
  const reducedMotion = usePrefersReducedMotion()
  const stage = useRef<HTMLDivElement>(null)
  const win = useRef<HTMLDivElement>(null)
  const typed = useRef<HTMLSpanElement>(null)

  // Pointer: the stage turns toward it, eased every frame through CSS variables (never React state).
  useEffect(() => {
    const el = stage.current
    if (!el || reducedMotion || !window.matchMedia('(pointer: fine)').matches) return
    const hero = el.closest('.pg-hero') ?? el
    const target = { x: 0, y: 0 }
    const now = { x: 0, y: 0 }
    let raf = 0
    let last = 0
    const loop = (t: number) => {
      const dt = last ? Math.min(0.1, (t - last) / 1000) : 1 / 60
      last = t
      now.x = damp(now.x, target.x, 5, dt)
      now.y = damp(now.y, target.y, 5, dt)
      const { rx, ry } = tiltAngles(now, 7)
      el.style.setProperty('--rx', rx.toFixed(3))
      el.style.setProperty('--ry', ry.toFixed(3))
      const settled = Math.abs(now.x - target.x) + Math.abs(now.y - target.y) < 0.001
      raf = settled ? 0 : requestAnimationFrame(loop)
      if (settled) last = 0
    }
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(loop)
    }
    const move = (e: Event) => {
      const p = e as PointerEvent
      Object.assign(target, pointerOffset(p.clientX, p.clientY, hero.getBoundingClientRect()))
      kick()
    }
    const leave = () => {
      target.x = 0
      target.y = 0
      kick()
    }
    hero.addEventListener('pointermove', move)
    hero.addEventListener('pointerleave', leave)
    return () => {
      cancelAnimationFrame(raf)
      hero.removeEventListener('pointermove', move)
      hero.removeEventListener('pointerleave', leave)
    }
  }, [reducedMotion])

  // Scroll: as the hero leaves, the stage tips back and lifts.
  useGSAP(
    () => {
      const el = stage.current
      if (reducedMotion || !el) return
      const state = { p: 0 }
      gsap.to(state, {
        p: 1,
        ease: 'none',
        onUpdate: () => el.style.setProperty('--sp', state.p.toFixed(4)),
        scrollTrigger: { trigger: el, start: 'top 20%', end: 'bottom top', scrub: 0.5 },
      })
    },
    { scope: stage, dependencies: [reducedMotion] },
  )

  // The story loop: classes on the window follow the timeline; it runs only while the hero is on screen and starts
  // from the top each time it comes back. Under reduced motion the finished conversation stays.
  useEffect(() => {
    const el = win.current
    const input = typed.current
    if (!el || !input || reducedMotion) return
    let raf = 0
    let start = 0
    let lastTyped = -1
    const frame = (now: number) => {
      if (!start) start = now
      const t = now - start
      const on = chatFlagsAt(t)
      for (const flag of CHAT_FLAGS) el.classList.toggle(`is-${flag}`, on.has(flag))
      const n = typedChars(t, chat.question.length)
      if (n !== lastTyped) {
        input.textContent = chat.question.slice(0, n)
        el.classList.toggle('is-typing', n > 0)
        lastTyped = n
      }
      raf = requestAnimationFrame(frame)
    }
    const play = () => {
      if (raf) return
      start = 0
      raf = requestAnimationFrame(frame)
    }
    const stop = () => {
      cancelAnimationFrame(raf)
      raf = 0
    }
    const io =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver(([e]) => (e.isIntersecting ? play() : stop()))
    if (io) io.observe(el)
    else play()
    return () => {
      stop()
      io?.disconnect()
      // Back to the finished conversation.
      for (const flag of CHAT_FLAGS) el.classList.toggle(`is-${flag}`, CHAT_FINAL.includes(flag))
      el.classList.remove('is-typing')
      input.textContent = ''
    }
  }, [reducedMotion])

  let word = 0
  return (
    <div ref={stage} className="aip-stage" aria-hidden="true">
      <div className="aip-stage-inner">
        <span className="aip-stage-shadow" />

        <div ref={win} className={`aip-chat ${CHAT_FINAL.map((f) => `is-${f}`).join(' ')}`}>
          <div className="aip-chat-bar">
            <span className="aip-chat-lights">
              <i />
              <i />
              <i />
            </span>
            <span className="aip-chat-title">
              <span className="aip-ai-dot" />
              {chat.title}
            </span>
            <span className="aip-chat-status">
              <b />
              {chat.status}
            </span>
          </div>

          <div className="aip-chat-body">
            <p className="aip-msg-q">{chat.question}</p>

            <div className="aip-msg-a">
              <span className="aip-ai-dot is-avatar" />
              <div className="aip-msg-a-body">
                <span className="aip-thinking">
                  <i />
                  <i />
                  <i />
                </span>
                <p className="aip-answer">
                  {chat.answer.map((part, p) =>
                    part.text.split(' ').map((w, i) => (
                      <span
                        key={`${p}-${i}`}
                        className={`aip-word${part.strong ? ' is-strong' : ''}`}
                        style={{ '--i': word++ } as CSSProperties}
                      >
                        {w}{' '}
                      </span>
                    )),
                  )}
                </p>
                <div className="aip-sources">
                  <span className="mono aip-sources-label">{chat.sourcesLabel}</span>
                  {chat.sources.map((s, i) => (
                    <span key={s} className="aip-source" style={{ '--i': i } as CSSProperties}>
                      <svg viewBox="0 0 12 12">
                        {i === 0 ? (
                          <>
                            <rect x="1.5" y="1.5" width="9" height="9" rx="1.5" />
                            <path d="M1.5 4.5 H10.5 M5 4.5 V10.5" />
                          </>
                        ) : (
                          <>
                            <rect x="1" y="2.5" width="10" height="7" rx="1.5" />
                            <path d="M1.5 3.5 L6 6.8 L10.5 3.5" />
                          </>
                        )}
                      </svg>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="aip-action">
              <p className="mono aip-action-label">
                <span className="aip-ai-dot" />
                {chat.actionLabel}
              </p>
              <p className="aip-action-text">{chat.action}</p>
              <div className="aip-action-row">
                <span className="aip-btn is-approve">
                  <span className="aip-btn-label">{chat.approve}</span>
                  <span className="aip-btn-label is-sent">{chat.sent}</span>
                  <svg className="aip-cursor" viewBox="0 0 16 20">
                    <path d="M2 1.5 L2 15.5 L5.6 12.2 L8.2 18 L10.6 17 L8 11.3 L13 11.1 Z" />
                  </svg>
                </span>
                <span className="aip-btn is-edit">{chat.edit}</span>
                <span className="aip-signoff">
                  <svg viewBox="0 0 16 16">
                    <circle cx="8" cy="5.2" r="2.7" />
                    <path d="M2.8 14 C 2.8 9.6, 13.2 9.6, 13.2 14" />
                  </svg>
                  {chat.signOff}
                </span>
              </div>
            </div>
          </div>

          <div className="aip-chat-input">
            <span className="aip-input-field">
              <span className="aip-input-ph">{chat.placeholder}</span>
              <span ref={typed} className="aip-input-text" />
              <span className="aip-caret" />
            </span>
            <span className="aip-send">
              <svg viewBox="0 0 16 16">
                <path d="M8 13 V3.5 M3.8 7.6 L8 3.4 L12.2 7.6" />
              </svg>
            </span>
          </div>

          {/* Notes at other depths: one floats behind the window's corner, the reply comes in front. */}
          <div className="aip-note is-toast">
            <span className="aip-note-icon">
              <svg viewBox="0 0 16 16">
                <path d="M4 8.4 L6.8 11 L12 5.4" />
              </svg>
            </span>
            <span>
              <b>{chat.toast.title}</b>
              <small>{chat.toast.meta}</small>
            </span>
          </div>
          <div className="aip-note is-reply">
            <span className="aip-note-icon is-msg">
              <svg viewBox="0 0 16 16">
                <path d="M8 2.2 a5.8 5.8 0 0 0 -5 8.7 L2.3 13.7 L5.2 13 A5.8 5.8 0 1 0 8 2.2 Z" />
              </svg>
            </span>
            <span>
              <b>{chat.message.from}</b>
              <small>{chat.message.text}</small>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------- Beside the How heading: a test run against past cases ----------
   The rows tick through one by one when the section scrolls in (paused off screen); the markup is the finished run,
   which reduced motion and the prerendered page show. */

const run = aiPage.testRun

function TestRun() {
  const reducedMotion = usePrefersReducedMotion()
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = root.current
    if (!el || reducedMotion || typeof IntersectionObserver === 'undefined') return
    const rows = Array.from(el.querySelectorAll<HTMLElement>('.aip-run-row'))
    let elapsed = 0
    let last = 0
    let raf = 0
    const paint = () => {
      const { index, progress, complete } = testRunAt(elapsed, rows.length)
      rows.forEach((r, i) => {
        r.classList.toggle('is-done', i < index)
        r.classList.toggle('is-checking', i === index && !complete)
      })
      el.style.setProperty('--run', progress.toFixed(4))
      el.classList.toggle('is-complete', complete)
      return complete
    }
    const frame = (now: number) => {
      elapsed += last ? Math.min(100, now - last) : 0
      last = now
      raf = paint() ? 0 : requestAnimationFrame(frame)
    }
    paint()
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !raf && !el.classList.contains('is-complete')) {
          last = 0
          raf = requestAnimationFrame(frame)
        } else if (!e.isIntersecting) {
          cancelAnimationFrame(raf)
          raf = 0
        }
      },
      { threshold: 0.5 },
    )
    io.observe(el)
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      rows.forEach((r) => {
        r.classList.add('is-done')
        r.classList.remove('is-checking')
      })
      el.style.removeProperty('--run')
      el.classList.add('is-complete')
    }
  }, [reducedMotion])

  return (
    <div ref={root} className="aip-run is-complete">
      <div className="aip-run-bar">
        <span className="aip-run-title">
          <span className="aip-ai-dot" />
          {run.title}
        </span>
        <span className="mono aip-run-meta">{run.meta}</span>
      </div>
      <span className="aip-run-progress">
        <i />
      </span>
      <ul className="aip-run-rows">
        {run.rows.map((r) => (
          <li key={r.id} className={`aip-run-row is-done is-${r.tone}`}>
            <span className="aip-run-id">{r.id}</span>
            <span className="aip-run-result">
              <span className="aip-run-spin" />
              <span className="aip-run-text">{r.result}</span>
              <svg className="aip-run-mark" viewBox="0 0 16 16">
                {r.tone === 'flag' ? (
                  <path d="M4.5 13.5 V2.8 M4.5 3.2 H12 L10.2 5.8 L12 8.4 H4.5" />
                ) : r.tone === 'person' ? (
                  <>
                    <circle cx="6.5" cy="5" r="2.4" />
                    <path d="M2 13 C 2 9, 11 9, 11 13" />
                    <path d="M10.2 6.4 L11.8 8 L14.6 5" />
                  </>
                ) : (
                  <path d="M3.5 8.4 L6.6 11.2 L12.6 4.8" />
                )}
              </svg>
            </span>
          </li>
        ))}
      </ul>
      <p className="aip-run-foot">
        <span className="aip-run-foot-text is-running">{run.running}</span>
        <span className="aip-run-foot-text is-done">{run.done}</span>
      </p>
    </div>
  )
}

/**
 * Cards that turn toward a fine pointer (CSS variables --tx/--ty in degrees; the CSS eases them). Nothing on touch
 * screens or under reduced motion.
 */
function useTilt<T extends HTMLElement>(maxDeg = 6) {
  const ref = useRef<T>(null)
  const reducedMotion = usePrefersReducedMotion()
  useEffect(() => {
    const el = ref.current
    if (!el || reducedMotion || !window.matchMedia('(pointer: fine)').matches) return
    const move = (e: PointerEvent) => {
      const { rx, ry } = tiltAngles(pointerOffset(e.clientX, e.clientY, el.getBoundingClientRect()), maxDeg)
      el.style.setProperty('--tx', `${rx.toFixed(2)}deg`)
      el.style.setProperty('--ty', `${ry.toFixed(2)}deg`)
    }
    const leave = () => {
      el.style.removeProperty('--tx')
      el.style.removeProperty('--ty')
    }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
      leave()
    }
  }, [reducedMotion, maxDeg])
  return ref
}

/* ---------- Two ways to use AI ---------- */

function Ways() {
  return (
    <PageSection id="ways" title={aiPage.waysTitle}>
      <div className="aip-ways">
        {aiPage.ways.map((w) => (
          <WayCard key={w.key} way={w} />
        ))}
      </div>
    </PageSection>
  )
}

function WayCard({ way: w }: { way: (typeof aiPage.ways)[number] }) {
  const tilt = useTilt<HTMLDivElement>(8)
  return (
    <article className={`aip-way glass-card is-${w.key}`} data-reveal>
      {/* A small 3D scene: the window floats over its ghost and shadow, and turns toward the pointer. */}
      <div ref={tilt} className="aip-way-visual" aria-hidden="true">
        <div className="aip-way-scene">
          <span className="aip-way-shadow" />
          <span className="aip-way-ghost" />
          {w.key === 'inside' ? <SystemWindow /> : <ToolCard />}
        </div>
      </div>
      <p className="mono aip-way-label">{w.label}</p>
      <h3 className="aip-way-title">{w.title}</h3>
      <p className="aip-way-text">{w.text}</p>
      <a className="aip-way-link" href={w.key === 'inside' ? '#inside' : '#solutions'} onClick={jump}>
        {aiPage.waysLink} <span aria-hidden="true">↓</span>
      </a>
    </article>
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
  // Reorder: a package with a round "repeat" badge on its corner (the badge's fill hides the box edges behind it)
  <>
    <path d="M3 9.5 L12 5 L21 9.5 V19.5 L12 24 L3 19.5 Z" />
    <path d="M3 9.5 L12 14 L21 9.5 M12 14 V24" />
    <path d="M7.5 7.2 L16.5 11.7" />
    <circle className="aip-icon-badge" cx="23.5" cy="22.5" r="6.5" />
    <path d="M26.1 21.2 A2.9 2.9 0 1 0 26.1 23.8" />
    <path d="M26.4 18.9 L26.1 21.2 L23.9 20.8" />
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

function InsideCard({ item, icon }: { item: (typeof aiPage.inside)[number]; icon: ReactNode }) {
  const tilt = useTilt<HTMLElement>(5)
  return (
    <article ref={tilt} className="aip-inside-card" data-reveal>
      <div className="aip-inside-top">
        <span className="mono aip-sys">{item.system}</span>
        <span className="aip-icon-tile">
          <svg className="aip-icon" viewBox="0 0 32 32" aria-hidden="true">
            {icon}
          </svg>
        </span>
      </div>
      <h3 className="aip-card-title">{item.title}</h3>
      <p className="aip-card-text">{item.text}</p>
    </article>
  )
}

function Inside() {
  return (
    <PageSection id="inside" kicker={aiPage.ways[0].label} title={aiPage.insideTitle}>
      <div className="aip-inside">
        {aiPage.inside.map((item, i) => (
          <InsideCard key={item.title} item={item} icon={icons[i]} />
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
    <PageSection id="how" kicker={aiPage.howKicker} title={aiPage.howTitle} tone="light" aside={<TestRun />}>
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
