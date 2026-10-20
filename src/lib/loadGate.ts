// A "load gate": a set of named jobs (fonts, the page, each 3D scene) the home preloader waits for, so the site is
// shown only once everything is downloaded and the 3D shaders are compiled. A timeout opens the gate anyway, so a
// slow or broken job can never keep the page hidden.

export type Gate = {
  /** Marks a job done (unknown or repeated names are ignored). */
  done: (job: string) => void
  /** Share of jobs done, 0..1. */
  progress: () => number
  /** Resolves when every job is done or the timeout passes. */
  ready: Promise<void>
  isReady: () => boolean
}

export function createGate(jobs: readonly string[], timeoutMs = 12000): Gate {
  const pending = new Set(jobs)
  let open = pending.size === 0
  let resolve: () => void = () => {}
  const ready = new Promise<void>((r) => (resolve = r))
  const finish = () => {
    if (open && pending.size > 0) return
    open = true
    resolve()
  }
  if (open) resolve()
  const timer = setTimeout(() => {
    open = true
    resolve()
  }, timeoutMs)
  return {
    done(job) {
      if (!pending.delete(job)) return
      if (pending.size === 0) {
        clearTimeout(timer)
        finish()
      }
    },
    progress: () => (open ? 1 : (jobs.length - pending.size) / jobs.length),
    ready,
    isReady: () => open,
  }
}

/** The home page gate: fonts, the window load event, the loom hero canvas and the fixed story/globe canvas. */
export const homeGate = typeof window === 'undefined' ? null : createGate(['fonts', 'page', 'loom', 'scene'])

if (homeGate) {
  document.fonts?.ready.then(() => homeGate.done('fonts'))
  if (document.readyState === 'complete') homeGate.done('page')
  else window.addEventListener('load', () => homeGate.done('page'), { once: true })
}
