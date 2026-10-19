/**
 * Case motif: a small code-drawn window of the system we built, one row per module (the case's tags), each with a
 * filled bar and a check, in the case's accent colour (`--tone` on an ancestor). Used on the home page's Our Work
 * cards and on /portfolio. Bar lengths vary by position so rows don't look identical. Below them, an activity
 * chart grows to fill the card's free height (hidden where there is no room).
 */
const FILL = [88, 66, 78, 54]
/** Weekly activity bars under the modules: rising, with a little wobble. Fills whatever height the card leaves. */
const BARS = [34, 42, 38, 51, 47, 58, 55, 66, 61, 72, 69, 80, 76, 88]

export function CaseArt({ modules, className = '' }: { modules: readonly string[]; className?: string }) {
  return (
    <div className={`case-art ${className}`.trim()} aria-hidden="true">
      <div className="case-art-bar">
        <i />
        <i />
        <i />
      </div>
      <ul>
        {modules.slice(0, 4).map((m, k) => (
          <li key={m}>
            <span className="case-art-name">{m}</span>
            <span className="case-art-track">
              <b style={{ width: `${FILL[k % FILL.length]}%` }} />
            </span>
            <svg viewBox="0 0 12 12" className="case-art-ok">
              <path d="M2.5 6.3 5 8.6l4.5-5" />
            </svg>
          </li>
        ))}
      </ul>
      <div className="case-art-chart">
        {BARS.map((h, k) => (
          <i key={k} style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  )
}
