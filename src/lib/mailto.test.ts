import { buildMailto } from './mailto'

describe('buildMailto', () => {
  it('addresses Wezigns and encodes the subject and body', () => {
    const url = buildMailto(['A website', 'Hosting & support'], 'Asha', 'Our orders live in 3 spreadsheets & a chat')
    expect(url.startsWith('mailto:hello@wezigns.com?subject=')).toBe(true)
    const params = new URLSearchParams(url.split('?')[1])
    expect(params.get('subject')).toBe('Enquiry: A website, Hosting & support')
    expect(params.get('body')).toContain('Our orders live in 3 spreadsheets & a chat')
    expect(params.get('body')).toContain('— Asha')
  })

  it('falls back to a general subject and prompt text', () => {
    const params = new URLSearchParams(buildMailto([], '', '   ').split('?')[1])
    expect(params.get('subject')).toBe('Enquiry: General')
    expect(params.get('body')).toContain('Tell us what is not working')
  })
})
