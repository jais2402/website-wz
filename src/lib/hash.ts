/** The element id a location hash points at (`#faq` → `faq`), or null when it is empty or not a plain id. */
export function hashTarget(hash: string): string | null {
  const id = hash.startsWith('#') ? hash.slice(1) : hash
  return /^[A-Za-z][\w-]*$/.test(id) ? id : null
}
