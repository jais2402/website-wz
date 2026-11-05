/** The element id a location hash points at (`#faq` → `faq`), or null when it is empty or not a plain id. */
export function hashTarget(hash: string): string | null {
  const id = hash.startsWith('#') ? hash.slice(1) : hash
  return /^[A-Za-z][\w-]*$/.test(id) ? id : null
}

/**
 * An old portfolio name as the page's anchor: lower case, spaces, underscores and other punctuation as single hyphens
 * ('Datalogic%20technologies' → 'datalogic-technologies', 'tech_guy' → 'tech-guy'). The old wezigns.com item URLs
 * redirect to /portfolio#<their name as written>, and the anchors on the page use this form.
 */
export function anchorFromName(hash: string): string | null {
  let id = hash.startsWith('#') ? hash.slice(1) : hash
  try {
    id = decodeURIComponent(id)
  } catch {
    // A malformed escape: keep the raw text.
  }
  id = id
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return id || null
}
