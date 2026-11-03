import { describe, expect, it } from 'vitest'
import { CHAT_CYCLE, CHAT_FINAL, RUN_STEP, chatFlagsAt, testRunAt, typedChars } from './aiHero'

describe('chatFlagsAt', () => {
  it('starts empty, hidden for the reset', () => {
    const f = chatFlagsAt(0)
    expect(f.has('reset')).toBe(true)
    expect(f.has('out')).toBe(true)
    expect(f.has('asked')).toBe(false)
  })

  it('runs question → thinking → answer → action → sent in order', () => {
    expect(chatFlagsAt(1000).size).toBe(0)
    expect(chatFlagsAt(2600).has('thinking')).toBe(true)
    expect(chatFlagsAt(2600).has('asked')).toBe(true)
    expect(chatFlagsAt(3600).has('thinking')).toBe(false)
    expect(chatFlagsAt(3600).has('answer')).toBe(true)
    expect(chatFlagsAt(5000).has('sources')).toBe(true)
    expect(chatFlagsAt(5500).has('action')).toBe(true)
    expect(chatFlagsAt(5500).has('sent')).toBe(false)
    expect(chatFlagsAt(7000).has('press')).toBe(true)
    expect(chatFlagsAt(8500).has('sent')).toBe(true)
    expect(chatFlagsAt(8500).has('aim')).toBe(false)
  })

  it('ends on the finished conversation, fading out, then wraps', () => {
    const end = chatFlagsAt(CHAT_CYCLE - 1)
    for (const flag of CHAT_FINAL) expect(end.has(flag)).toBe(true)
    expect(end.has('out')).toBe(true)
    expect(chatFlagsAt(CHAT_CYCLE + 2600)).toEqual(chatFlagsAt(2600))
  })
})

describe('typedChars', () => {
  it('types the question, then clears the input once sent', () => {
    expect(typedChars(0, 40)).toBe(0)
    expect(typedChars(1000, 40)).toBeGreaterThan(0)
    expect(typedChars(2000, 40)).toBe(40)
    expect(typedChars(2400, 40)).toBe(0)
  })
})

describe('testRunAt', () => {
  it('ticks through the rows and fills the bar', () => {
    expect(testRunAt(0, 4)).toEqual({ index: 0, progress: 0, complete: false })
    expect(testRunAt(RUN_STEP * 1.5, 4).index).toBe(1)
    expect(testRunAt(RUN_STEP * 4, 4)).toEqual({ index: 4, progress: 1, complete: true })
    expect(testRunAt(RUN_STEP * 9, 4).complete).toBe(true)
  })
})
