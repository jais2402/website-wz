import { useEffect, useRef, useState } from 'react'
import { ai, aiDemo, ctas, sampleDataLabel } from '@/content/site'
import { SplitReveal } from './Reveal'

const SUGGESTION = aiDemo.suggestion

type Phase = 'idle' | 'typing' | 'ready' | 'approved'
type RunState = 'idle' | 'running' | 'approved'

/** Live "AI inside your screens" demo: the suggestion types itself, and a person approves it. */
export function AIDemo() {
  const root = useRef<HTMLDivElement>(null)
  const [run, setRun] = useState<RunState>('idle')
  const [typed, setTyped] = useState(0)
  // "ready" is derived from typing progress rather than stored, so no effect has to flip it.
  const phase: Phase = run === 'running' ? (typed >= SUGGESTION.length ? 'ready' : 'typing') : run

  // Start typing once the demo scrolls into view.
  useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setRun((r) => (r === 'idle' ? 'running' : r))
          io.disconnect()
        }
      },
      { threshold: 0.4 },
    )
    if (root.current) io.observe(root.current)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (phase !== 'typing') return
    const t = setTimeout(() => setTyped((n) => Math.min(SUGGESTION.length, n + 2)), 18)
    return () => clearTimeout(t)
  }, [phase, typed])

  const replay = () => {
    setTyped(0)
    setRun('running')
  }

  return (
    <section id="ai" className="panel ai">
      <div className="wrap ai-grid">
        <div className="ai-copy">
          <SplitReveal as="h2" className="display" text={ai.title} />
          <p className="lead">{ai.body}</p>
          <ul className="ai-points">
            {ai.points.map((p) => (
              <li key={p.title}>
                <b>{p.title}</b> {p.text}
              </li>
            ))}
          </ul>
          <a className="btn btn-ink section-link" href={ctas.aiDemo.href}>
            {ctas.aiDemo.label} <span aria-hidden="true">→</span>
          </a>
        </div>

        <div className="ai-app" ref={root}>
          <div className="win-bar">
            <i />
            <i />
            <i />
            <span className="mono">{aiDemo.window}</span>
            <span className="mono win-sample">{sampleDataLabel}</span>
          </div>
          <table className="ai-table">
            <thead>
              <tr>
                {aiDemo.columns.map((c) => (
                  <th key={c}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {aiDemo.rows.map((r) => {
                const status = r.id === aiDemo.focusId && phase === 'approved' ? aiDemo.approvedStatus : r.status
                return (
                  <tr key={r.id} className={r.id === aiDemo.focusId ? 'is-focus' : ''}>
                    <td className="mono">{r.id}</td>
                    <td>{r.vendor}</td>
                    <td className="mono">{r.amt}</td>
                    <td>
                      <span className={`status s-${status.toLowerCase()}`}>{status}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          <div className={`ai-card phase-${phase}`} aria-live="polite">
            <div className="ai-card-head">
              <span className="ai-orb" aria-hidden="true" />
              <span className="mono">{aiDemo.cardLabel}</span>
            </div>
            <p>
              {SUGGESTION.slice(0, typed)}
              {phase === 'typing' && <span className="caret" />}
            </p>
            {phase === 'approved' ? (
              <div className="ai-done">
                <span>{aiDemo.done}</span>
                <button className="link-btn" onClick={replay}>
                  {aiDemo.replay}
                </button>
              </div>
            ) : (
              <div className="ai-actions">
                <button className="btn btn-ink btn-sm" disabled={phase !== 'ready'} onClick={() => setRun('approved')}>
                  {aiDemo.approve}
                </button>
                <button className="btn btn-outline btn-sm" disabled={phase !== 'ready'} onClick={replay}>
                  {aiDemo.askAgain}
                </button>
                <span className="ai-human mono">{aiDemo.human}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
