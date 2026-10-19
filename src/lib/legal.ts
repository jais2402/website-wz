// Small pure helpers for the legal pages (pages/legal/LegalPage.tsx) and their HTML snapshot (lib/snapshot.ts).

// Ids the page shell already uses: the closing contact block is #contact and the home hero is #top.
const RESERVED = new Set(['contact', 'top', 'root'])

/** The anchor id for a legal section. Section ids that clash with the shell get a `-section` suffix. */
export function legalAnchor(id: string) {
  return RESERVED.has(id) ? `${id}-section` : id
}

/** '2026-10-19' → '19 October 2026'. Anything that is not a YYYY-MM-DD date comes back unchanged. */
export function formatLegalDate(iso: string) {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return iso
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]
  const month = months[Number(m[2]) - 1]
  return month ? `${Number(m[3])} ${month} ${m[1]}` : iso
}

/** Splits text into plain parts and [placeholder] parts, so placeholders can be highlighted until they are filled. */
export function splitPlaceholders(text: string): { text: string; placeholder: boolean }[] {
  return text
    .split(/(\[[^\]]+\])/)
    .filter(Boolean)
    .map((part) => ({ text: part, placeholder: /^\[[^\]]+\]$/.test(part) }))
}
