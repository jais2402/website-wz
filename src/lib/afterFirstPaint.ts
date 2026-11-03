// Starts the app once the browser has put on screen what the HTML already holds (the home preloader, an inner
// page's prerendered first screen), so the app's ~170 kB of JavaScript neither competes with that first paint for
// bandwidth nor runs before it. The entry files are tiny and import the app from here.
//
// "On screen" is the browser's own record of it: the first largest-contentful-paint entry (presented, not just
// committed: a node React swaps out a frame later would otherwise never count as the paint the visitor saw).
// Browsers without that entry type (Safari) wait two frames instead (rAF fires just before a paint; a task queued
// from it runs after that paint). rAF never fires in a background tab, so a timeout starts the app regardless.

const nextPaint = () =>
  new Promise<void>((resolve) => {
    if (typeof requestAnimationFrame === 'function') requestAnimationFrame(() => setTimeout(resolve, 0))
  })

function firstContentPresented(): Promise<void> {
  const supported =
    typeof PerformanceObserver !== 'undefined' &&
    PerformanceObserver.supportedEntryTypes?.includes('largest-contentful-paint')
  if (!supported) return nextPaint().then(nextPaint)
  return new Promise((resolve) => {
    const po = new PerformanceObserver(() => {
      po.disconnect()
      // Queued as a task, so the app starts after the observer callback and not inside it.
      setTimeout(resolve, 0)
    })
    po.observe({ type: 'largest-contentful-paint', buffered: true })
  })
}

export function afterFirstPaint(start: () => void, fallbackMs = 2500): void {
  let started = false
  const go = () => {
    if (started) return
    started = true
    start()
  }
  setTimeout(go, fallbackMs)
  firstContentPresented().then(go, go)
}

/**
 * Starts downloading the modules listed in <body data-modulepreload> (space-separated URLs, written at build time by
 * scripts/vite-prerender.ts for pages whose first screen is in the HTML), as <link rel="modulepreload">, so the
 * page's own chunks load alongside the app instead of after it.
 */
export function preloadListedModules(): void {
  const list = document.body.dataset.modulepreload?.split(' ').filter(Boolean) ?? []
  for (const href of list) {
    const link = document.createElement('link')
    link.rel = 'modulepreload'
    link.crossOrigin = ''
    link.href = href
    document.head.appendChild(link)
  }
}
