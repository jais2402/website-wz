import { useId } from 'react'

// Simplified, code-drawn marks for the AI assistants (no image files). All decorative: the link carries the name.

function ChatGpt() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="#10a37f" strokeWidth="2.6">
      <g transform="translate(24 24)">
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <rect key={a} x="-3" y="-17" width="12" height="22" rx="6" transform={`rotate(${a})`} />
        ))}
      </g>
    </svg>
  )
}

function Claude() {
  // 12 rounded rays of alternating length
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" stroke="#d97757" strokeWidth="3.6" strokeLinecap="round">
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * Math.PI) / 6 + 0.12
        const r = i % 2 ? 15 : 19
        return (
          <line
            key={i}
            x1={(24 + Math.cos(a) * 4).toFixed(2)}
            y1={(24 + Math.sin(a) * 4).toFixed(2)}
            x2={(24 + Math.cos(a) * r).toFixed(2)}
            y2={(24 + Math.sin(a) * r).toFixed(2)}
          />
        )
      })}
    </svg>
  )
}

function Perplexity() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="#20808d" strokeWidth="2.4" strokeLinejoin="round">
      <path d="M24 5v38" />
      <path d="M12 6l12 11 12-11v11M12 6v11" />
      <rect x="9" y="17" width="30" height="12" />
      <path d="M24 29L13 40V29M24 29l11 11V29" />
    </svg>
  )
}

function Gemini() {
  const id = useId()
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="6" y1="8" x2="42" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#4285f4" />
          <stop offset="0.35" stopColor="#9b72cb" />
          <stop offset="0.6" stopColor="#ea4335" />
          <stop offset="0.8" stopColor="#fbbc04" />
          <stop offset="1" stopColor="#34a853" />
        </linearGradient>
      </defs>
      <path d="M24 4c0 11 9 20 20 20-11 0-20 9-20 20 0-11-9-20-20-20 11 0 20-9 20-20z" fill={`url(#${id})`} />
    </svg>
  )
}

function Grok() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round">
      <path d="M33 12.5A14 14 0 1 0 37.5 29" />
      <path d="M11 38L38 9" />
    </svg>
  )
}

const logos: Record<string, () => React.JSX.Element> = {
  chatgpt: ChatGpt,
  claude: Claude,
  perplexity: Perplexity,
  gemini: Gemini,
  grok: Grok,
}

/** Logo for an engine key in `aiSummary.engines` (nothing for an unknown key). */
export function AiLogo({ engine }: { engine: string }) {
  const Logo = logos[engine]
  return Logo ? <Logo /> : null
}
