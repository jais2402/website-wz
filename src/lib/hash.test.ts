import { describe, expect, it } from 'vitest'
import { anchorFromName, hashTarget } from './hash'

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

describe('anchorFromName', () => {
  it('turns an old portfolio name into the page anchor', () => {
    expect(anchorFromName('#Grace')).toBe('grace')
    expect(anchorFromName('#tech_guy')).toBe('tech-guy')
    expect(anchorFromName('#Datalogic%20technologies')).toBe('datalogic-technologies')
    expect(anchorFromName('#Datalogic technologies')).toBe('datalogic-technologies')
    expect(anchorFromName('#arabic-baptist-%20church-of-christ')).toBe('arabic-baptist-church-of-christ')
    expect(anchorFromName('#Software-PHD')).toBe('software-phd')
    expect(anchorFromName('#car-rental')).toBe('car-rental')
  })

  it('returns null for an empty or punctuation-only hash, and never throws on a bad escape', () => {
    expect(anchorFromName('')).toBeNull()
    expect(anchorFromName('#')).toBeNull()
    expect(anchorFromName('#__')).toBeNull()
    expect(anchorFromName('#%E0%A4%A')).toBe('e0-a4-a')
  })
})
