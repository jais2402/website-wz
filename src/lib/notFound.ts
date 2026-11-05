// The 404 page's "Did you mean…?": the closest real page to the address a visitor typed or followed.
// Pure: the page passes in `location.pathname` and the site's pages; no DOM, no React.

export type Destination = { path: string; label: string; words: string[] }

/** Lower case, no extension, no slashes or punctuation, as single words: '/Systems/HR_payroll.html' → ['systems', 'hr', 'payroll']. */
export function pathWords(path: string): string[] {
  let p = path.toLowerCase()
  try {
    p = decodeURIComponent(p)
  } catch {
    // A malformed escape: keep the raw text.
  }
  return p
    .replace(/[?#].*$/, '')
    .replace(/\.(html?|php|aspx?)$/, '')
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
}

/**
 * Edit distance (insertions, deletions, substitutions, and two neighbouring letters swapped counting as one edit), for
 * typos like 'pricng', 'protfolio' or 'peopel'.
 */
export function editDistance(a: string, b: string): number {
  if (a === b) return 0
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i])
  for (let j = 1; j <= b.length; j++) d[0][j] = j
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++) {
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1])
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1)
    }
  return d[a.length][b.length]
}

/** How well one typed word matches one of a page's words: 1 exact, less for a prefix or a near typo, 0 for none. */
function wordScore(typed: string, word: string): number {
  if (typed === word) return 1
  if (typed.length >= 3 && word.startsWith(typed)) return 0.8
  if (word.length >= 4 && typed.startsWith(word)) return 0.7
  const allowed = word.length >= 8 ? 2 : word.length >= 4 ? 1 : 0
  return allowed && editDistance(typed, word) <= allowed ? 0.75 : 0
}

// Words that fit many pages ('crm-software', 'ecommerce-development', '/systems/hr', the old site's 'portfolio-item-…'):
// they count a little, so the specific word decides.
const GENERIC = new Set([
  'item',
  'software',
  'development',
  'services',
  'service',
  'solutions',
  'solution',
  'systems',
  'system',
  'company',
  'online',
  'page',
  'new',
  'custom',
  'india',
  'chennai',
])

/**
 * The best page for a missing address, or null when nothing is a confident match (the 404 then just lists the main
 * pages). Every typed word counts (generic ones less); the page needs one good word match and a fair share of the address.
 */
export function suggestPage(path: string, destinations: Destination[]): Destination | null {
  const typed = pathWords(path)
  if (!typed.length) return null
  let best: { d: Destination; score: number } | null = null
  for (const d of destinations) {
    const per = typed.map((t) => Math.max(0, ...d.words.map((w) => wordScore(t, w))))
    const weight = typed.map((t) => (GENERIC.has(t) ? 0.3 : 1))
    const top = Math.max(...per)
    const score = per.reduce((sum, v, i) => sum + v * weight[i], 0) / weight.reduce((a, b) => a + b, 0)
    if (top >= 0.75 && score >= 0.34 && (!best || score > best.score)) best = { d, score }
  }
  return best?.d ?? null
}
