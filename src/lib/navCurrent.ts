// Which header link matches the page being viewed. Pure, so it is unit-tested.

/** "/systems/people.html", "/systems/people/" and "/systems/people" are the same page. */
export function cleanPath(pathname: string): string {
  const p = pathname
    .replace(/\.html$/, '')
    .replace(/\/index$/, '')
    .replace(/\/+$/, '')
  return p || '/'
}

/** True when `href` (a page link such as "/about-us") is the current page. In-page anchors are never current. */
export function isCurrentPage(pathname: string, href: string): boolean {
  if (!href.startsWith('/')) return false
  return cleanPath(pathname) === cleanPath(href.split(/[?#]/)[0])
}

/** True when the current page is inside a section, e.g. any "/systems/…" page for the Systems menu. */
export function inSection(pathname: string, prefix: string): boolean {
  return cleanPath(pathname).startsWith(prefix)
}
