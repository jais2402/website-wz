// Shared analytics interface. Everything goes through `track()`, which is a no-op until the visitor has accepted
// analytics cookies and GA has loaded (see consent.ts / initAnalytics). Safe to call from anywhere.

export type TrackParams = Record<string, string | number | boolean>

type Sink = (name: string, params?: TrackParams) => void

let sink: Sink | null = null

/** Set by the GA loader once consent is granted; cleared when consent is withdrawn. */
export function setAnalyticsSink(next: Sink | null) {
  sink = next
}

/** Record an event (e.g. 'generate_lead', 'cta_click'). Does nothing without consent. */
export function track(name: string, params?: TrackParams) {
  try {
    sink?.(name, params)
  } catch {
    // Analytics must never break the page.
  }
}
