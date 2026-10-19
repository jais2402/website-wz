import { cookieStatement, privacyPolicy, termsOfUse } from '@/content/legal'
import { formatLegalDate, legalAnchor, splitPlaceholders } from './legal'

describe('legalAnchor', () => {
  it('keeps ordinary ids and moves ids the page shell already uses', () => {
    expect(legalAnchor('your-rights')).toBe('your-rights')
    expect(legalAnchor('contact')).toBe('contact-section')
    expect(legalAnchor('top')).toBe('top-section')
  })

  it('gives every section of each document a unique anchor that does not clash with #contact', () => {
    for (const doc of [privacyPolicy, termsOfUse, cookieStatement]) {
      const ids = doc.sections.map((s) => legalAnchor(s.id))
      expect(new Set(ids).size).toBe(ids.length)
      expect(ids).not.toContain('contact')
    }
  })
})

describe('formatLegalDate', () => {
  it('writes an ISO date out in full', () => {
    expect(formatLegalDate('2026-10-19')).toBe('19 October 2026')
    expect(formatLegalDate('2027-01-05')).toBe('5 January 2027')
  })

  it('leaves anything else alone', () => {
    expect(formatLegalDate('[date]')).toBe('[date]')
    expect(formatLegalDate('2026-13-01')).toBe('2026-13-01')
  })
})

describe('splitPlaceholders', () => {
  it('marks [square bracket] placeholders and keeps the rest as text', () => {
    expect(splitPlaceholders('CIN: [CIN]. GSTIN: [GSTIN].')).toEqual([
      { text: 'CIN: ', placeholder: false },
      { text: '[CIN]', placeholder: true },
      { text: '. GSTIN: ', placeholder: false },
      { text: '[GSTIN]', placeholder: true },
      { text: '.', placeholder: false },
    ])
    expect(splitPlaceholders('No placeholders.')).toEqual([{ text: 'No placeholders.', placeholder: false }])
  })

  it('loses no text', () => {
    for (const s of privacyPolicy.sections.flatMap((x) => x.body)) {
      expect(
        splitPlaceholders(s)
          .map((p) => p.text)
          .join(''),
      ).toBe(s)
    }
  })
})
