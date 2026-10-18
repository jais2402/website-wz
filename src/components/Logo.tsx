/** Wezigns mark: two chevrons forming a W, joined by a node, a "system" glyph. */
export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M3 8l6.5 16L16 11l6.5 13L29 8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="16" cy="11" r="3.2" fill="var(--lime)" />
    </svg>
  )
}

export function Logo() {
  return (
    <span className="logo">
      <LogoMark />
      <span>Wezigns</span>
    </span>
  )
}
