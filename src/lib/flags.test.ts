import { countries } from '@/content/site'
import { flagEmoji } from './flags'

describe('flagEmoji', () => {
  it('builds regional-indicator flags', () => {
    expect(flagEmoji('IN')).toBe('🇮🇳')
    expect(flagEmoji('gb')).toBe('🇬🇧')
  })

  it('returns an empty string for invalid codes', () => {
    expect(flagEmoji('')).toBe('')
    expect(flagEmoji('IND')).toBe('')
  })

  it('has a valid code for every country we list', () => {
    for (const c of countries) expect(flagEmoji(c.code)).not.toBe('')
  })
})
