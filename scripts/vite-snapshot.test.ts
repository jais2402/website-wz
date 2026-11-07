// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { festiveAttrs } from '../src/lib/festive.ts'
import { festiveFromEnv } from '../src/lib/snapshot.ts'
import { HEAD_SCRIPT } from './vite-snapshot.ts'

/** Runs the real inline head script with the given attributes at time `at`; returns the classes it put on <html>. */
function runHeadScript(attrs: Record<string, string>, at: number) {
  const classes = new Set<string>()
  const dataset = Object.fromEntries(
    Object.entries(attrs).map(([k, v]) => [k.slice(5).replace(/-(\w)/g, (_, c: string) => c.toUpperCase()), v]),
  )
  const document = {
    documentElement: { classList: { add: (c: string) => classes.add(c), remove: (c: string) => classes.delete(c) } },
    currentScript: { dataset },
    querySelector: () => null,
  }
  new Function('document', 'Date', 'setTimeout', HEAD_SCRIPT)(document, { now: () => at }, () => {})
  return [...classes]
}

describe('festive loader switch', () => {
  it('is off without VITE_FESTIVE', () => {
    expect(festiveFromEnv({})).toBeNull()
    expect(runHeadScript({}, Date.now())).toEqual(['js'])
  })

  it('goes festive from the env and switches itself off at the end date', () => {
    const now = Date.parse('2026-11-08T10:00:00+05:30')
    const w = festiveFromEnv({ VITE_FESTIVE: 'diwali' }, now)!
    expect(w.until).toBe(Date.parse('2026-11-16T00:00:00+05:30'))
    expect(runHeadScript(festiveAttrs(w), now)).toEqual(['js', 'festive-diwali'])
    expect(runHeadScript(festiveAttrs(w), w.until - 1)).toEqual(['js', 'festive-diwali'])
    expect(runHeadScript(festiveAttrs(w), w.until)).toEqual(['js'])
  })

  it('waits for VITE_FESTIVE_FROM', () => {
    const w = festiveFromEnv(
      { VITE_FESTIVE: 'diwali', VITE_FESTIVE_FROM: '2026-11-07T18:00:00+05:30' },
      Date.parse('2026-11-07T10:00:00+05:30'),
    )!
    expect(runHeadScript(festiveAttrs(w), w.from! - 1)).toEqual(['js'])
    expect(runHeadScript(festiveAttrs(w), w.from!)).toEqual(['js', 'festive-diwali'])
  })
})
