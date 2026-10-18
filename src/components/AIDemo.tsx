import { useEffect, useRef, useState } from 'react'
import { ai } from '@/content/site'
import { SplitReveal } from './Reveal'

const SUGGESTION =
  'Invoice #0193 matches PO-2231 except quantity: 48 received vs 50 ordered. Suggest approving 48 and flagging the supplier for the short delivery.'

const ROWS = [
  { id: 'PO-2229', vendor: 'Gulf Safety Supplies', amt: '₹ 1,24,000', status: 'Approved' },
  { id: 'PO-2231', vendor: 'Apex Industrial', amt: '₹ 3,86,500', status: 'Review' },
  { id: 'PO-2234', vendor: 'Coastline Logistics', amt: '₹ 58,200', status: 'Approved' },
  { id: 'PO-2236', vendor: 'Northwind Traders', amt: '₹ 2,10,750', status: 'Pending' },
]

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
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setRun((r) => (r === 'idle' ? 'running' : r))
        io.disconnect()
      }
    }, { threshold: 0.4 })
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
        </div>

        <div className="ai-app" ref={root}>
          <div className="win-bar">
            <i />
            <i />
            <i />
            <span className="mono">Purchase approvals</span>
          </div>
          <table className="ai-table">
            <thead>
              <tr>
                <th>PO</th>
                <th>Vendor</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r) => {
                const status = r.id === 'PO-2231' && phase === 'approved' ? 'Approved' : r.status
                return (
                  <tr key={r.id} className={r.id === 'PO-2231' ? 'is-focus' : ''}>
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
              <span className="mono">Wezigns AI · suggestion</span>
            </div>
            <p>
              {SUGGESTION.slice(0, typed)}
              {phase === 'typing' && <span className="caret" />}
            </p>
            {phase === 'approved' ? (
              <div className="ai-done">
                <span>✓ Approved by you · logged to audit trail</span>
                <button className="link-btn" onClick={replay}>
                  Replay
                </button>
              </div>
            ) : (
              <div className="ai-actions">
                <button className="btn btn-ink btn-sm" disabled={phase !== 'ready'} onClick={() => setRun('approved')}>
                  Approve 48 units
                </button>
                <button className="btn btn-outline btn-sm" disabled={phase !== 'ready'} onClick={replay}>
                  Ask again
                </button>
                <span className="ai-human mono">Human in control</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
