/** Emoji flag from an ISO 3166-1 alpha-2 code ("IN" → 🇮🇳), built from regional-indicator symbols. */
export function flagEmoji(code: string): string {
  const cc = code.trim().toUpperCase()
  if (!/^[A-Z]{2}$/.test(cc)) return ''
  return String.fromCodePoint(...[...cc].map((ch) => 0x1f1e6 + ch.charCodeAt(0) - 65))
}
