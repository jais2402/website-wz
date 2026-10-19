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
    expect(splitPlaceholders('CIN: [CIN]. Name: [Name].')).toEqual([
      { text: 'CIN: ', placeholder: false },
      { text: '[CIN]', placeholder: true },
      { text: '. Name: ', placeholder: false },
      { text: '[Name]', placeholder: true },
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

describe('legal copy', () => {
  const docs = [privacyPolicy, termsOfUse, cookieStatement]
  const allText = docs.flatMap((d) => [d.lead, ...d.sections.flatMap((s) => [s.heading, ...s.body])]).join('\n')

  it('keeps only the agreed placeholders', () => {
    const found = new Set(allText.match(/\[[^\]]+\]/g))
    expect([...found].sort()).toEqual(['[CIN]', '[Designation]', '[Grievance Officer name]'])
  })

  it('no longer claims the site uses no cookies or no tracking', () => {
    expect(allText).not.toMatch(/no cookies|no tracking|does not use cookies|sets no cookies|GSTIN|confirm\]/i)
  })

  it('names every cookie and storage item the site uses', () => {
    const cookies = cookieStatement.sections.flatMap((s) => s.body).join('\n')
    for (const name of ['wz-consent', '_ga', '_ga_<container-id>', 'Cookie settings']) expect(cookies).toContain(name)
  })

  it('uses no em dashes', () => {
    expect(allText).not.toContain('—')
  })
})
