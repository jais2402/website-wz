// Code-drawn product illustrations (no raster images). All motion is CSS so it is cheap and pauses offscreen.

export function BuildArt() {
  return (
    <div className="art art-build" aria-hidden="true">
      <div className="win">
        <div className="win-bar">
          <i />
          <i />
          <i />
          <span className="mono">ops.wezigns.app</span>
        </div>
        <div className="win-body">
          <aside className="win-side">
            {Array.from({ length: 5 }, (_, i) => (
              <span key={i} className={i === 1 ? 'on' : ''} />
            ))}
          </aside>
          <div className="win-main">
            <div className="kpis">
              <b>
                <small>Orders</small>1,284
              </b>
              <b>
                <small>On time</small>98.2%
              </b>
              <b>
                <small>Stock</small>OK
              </b>
            </div>
            {Array.from({ length: 5 }, (_, i) => (
              <div className="row" key={i} style={{ animationDelay: `${i * 0.18}s` }}>
                <span className="dot" />
                <span className="bar" style={{ width: `${40 + ((i * 23) % 45)}%` }} />
                <span className={`tag t${i % 3}`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function ConnectArt() {
  const nodes = [
    { x: 50, y: 50, label: 'Core', big: true },
    { x: 14, y: 22, label: 'CRM' },
    { x: 86, y: 20, label: 'Stripe' },
    { x: 10, y: 74, label: 'ERP' },
    { x: 88, y: 76, label: 'AI' },
    { x: 50, y: 12, label: 'Gov API' },
    { x: 50, y: 90, label: 'Sheets' },
  ]
  return (
    <div className="art art-connect" aria-hidden="true">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {nodes.slice(1).map((n, i) => (
          <line key={i} x1="50" y1="50" x2={n.x} y2={n.y} className="flow" style={{ animationDelay: `${i * -0.4}s` }} />
        ))}
      </svg>
      {nodes.map((n) => (
        <span key={n.label} className={`node${n.big ? ' node-core' : ''}`} style={{ left: `${n.x}%`, top: `${n.y}%` }}>
          {n.label}
        </span>
      ))}
    </div>
  )
}

export function RunArt() {
  // A heartbeat-style uptime line drawn as a repeating path.
  const d = 'M0 40 L20 40 L26 40 L30 18 L34 58 L38 32 L42 40 L70 40 L76 40 L80 22 L84 54 L88 36 L92 40 L120 40'
  return (
    <div className="art art-run" aria-hidden="true">
      <div className="run-head mono">
        <span>
          <i className="live" /> All systems operational
        </span>
        <span>99.99%</span>
      </div>
      <svg viewBox="0 0 120 70" className="pulse-line" aria-hidden="true">
        <path d={d} />
        <path d={d} className="pulse-glow" />
      </svg>
      <div className="uptime">
        {Array.from({ length: 30 }, (_, i) => (
          <i key={i} className={i === 21 ? 'warn' : ''} />
        ))}
      </div>
    </div>
  )
}
