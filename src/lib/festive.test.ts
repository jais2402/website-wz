import { describe, expect, it } from 'vitest'
import {
  activeFestive,
  diwaliArt,
  festiveAttrs,
  festiveOpen,
  festiveWindow,
  kolamDots,
  kolamPath,
} from './festive'

const defaults = { diwali: { until: '2026-11-16T00:00:00+05:30' } }
const nov7 = Date.parse('2026-11-07T12:00:00+05:30')
const classes = (...names: string[]) => ({ contains: (c: string) => names.includes(c) })

describe('festiveWindow', () => {
  it('is off without VITE_FESTIVE, or for a festival it does not know', () => {
    expect(festiveWindow({}, defaults, nov7)).toBeNull()
    expect(festiveWindow({ theme: '' }, defaults, nov7)).toBeNull()
    expect(festiveWindow({ theme: 'off' }, defaults, nov7)).toBeNull()
    expect(festiveWindow({ theme: 'holi' }, defaults, nov7)).toBeNull()
  })

  it('runs to the default end date, from straight away', () => {
    expect(festiveWindow({ theme: ' Diwali ' }, defaults, nov7)).toEqual({
      festive: 'diwali',
      from: null,
      until: Date.parse('2026-11-16T00:00:00+05:30'),
    })
  })

  it('takes the start and end dates from the env, ignoring one it cannot read', () => {
    const w = festiveWindow({ theme: 'diwali', from: '2026-11-07', until: '2026-11-10T00:00:00+05:30' }, defaults, nov7)
    expect(w).toEqual({ festive: 'diwali', from: Date.parse('2026-11-07'), until: Date.parse('2026-11-10T00:00:00+05:30') })
    expect(festiveWindow({ theme: 'diwali', until: 'next week' }, defaults, nov7)?.until).toBe(
      Date.parse(defaults.diwali.until),
    )
  })

  it('is null once the end date has passed, so a later build ships no festive markup', () => {
    expect(festiveWindow({ theme: 'diwali' }, defaults, Date.parse('2026-11-16T00:00:00+05:30'))).toBeNull()
  })
})

describe('festiveOpen (the head script)', () => {
  const w = { from: Date.parse('2026-11-07T00:00:00+05:30'), until: Date.parse('2026-11-16T00:00:00+05:30') }
  it('opens at the start date and switches itself off at the end date', () => {
    expect(festiveOpen(w, w.from - 1)).toBe(false)
    expect(festiveOpen(w, w.from)).toBe(true)
    expect(festiveOpen(w, w.until - 1)).toBe(true)
    expect(festiveOpen(w, w.until)).toBe(false)
    expect(festiveOpen({ from: null, until: w.until }, 0)).toBe(true)
  })

  it('writes the window as data attributes in milliseconds', () => {
    expect(festiveAttrs({ festive: 'diwali', from: null, until: 5 })).toEqual({ 'data-festive': 'diwali', 'data-until': '5' })
    expect(festiveAttrs({ festive: 'diwali', from: 1, until: 5 })).toEqual({
      'data-festive': 'diwali',
      'data-from': '1',
      'data-until': '5',
    })
  })
})

describe('activeFestive', () => {
  it('follows the class the head script put on <html>', () => {
    expect(activeFestive(classes('js', 'festive-diwali'), '')).toBe('diwali')
    expect(activeFestive(classes('js'), '')).toBeNull()
  })

  it('can be forced on or off from the address, for previews', () => {
    expect(activeFestive(classes('js'), '?festive=diwali')).toBe('diwali')
    expect(activeFestive(classes('festive-diwali'), '?festive=off')).toBeNull()
    expect(activeFestive(classes('js'), '?festive=nope')).toBeNull()
  })
})

describe('kolam', () => {
  it('is one closed thread with a dot inside every loop and between every pair', () => {
    const d = kolamPath()
    expect(d.startsWith('M86 0')).toBe(true)
    expect(d.endsWith('Z')).toBe(true)
    expect(d.match(/M/g)).toHaveLength(1)
    expect(kolamDots()).toHaveLength(16)
  })

  it('stays inside the picture', () => {
    const nums = kolamPath().match(/-?\d+(\.\d+)?/g)!.map(Number)
    expect(Math.max(...nums.map(Math.abs))).toBeLessThanOrEqual(86)
  })

  it('draws the diwali art with the kolam as a measured path, so progress can draw it in', () => {
    expect(diwaliArt()).toContain('class="dw-kolam" pathLength="1"')
    expect(diwaliArt()).not.toMatch(/\/>/)
  })
})
