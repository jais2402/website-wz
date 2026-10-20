import { describe, expect, it } from 'vitest'
import { hashTarget } from './hash'

describe('hashTarget', () => {
  it('returns the id of a plain hash', () => {
    expect(hashTarget('#faq')).toBe('faq')
    expect(hashTarget('#before-after')).toBe('before-after')
    expect(hashTarget('contact')).toBe('contact')
  })

  it('rejects empty, selector-like and odd hashes', () => {
    expect(hashTarget('')).toBeNull()
    expect(hashTarget('#')).toBeNull()
    expect(hashTarget('#a b')).toBeNull()
    expect(hashTarget('#x,.y')).toBeNull()
    expect(hashTarget('#1abc')).toBeNull()
    expect(hashTarget('#%3Cscript%3E')).toBeNull()
  })
})
