import { aiSummary } from '@/content/site'
import { summaryUrl } from './aiSummary'

describe('summaryUrl', () => {
  it('encodes spaces, &, ?, parentheses and non-ASCII', () => {
    const url = summaryUrl('https://example.com/?q={q}', 'Who are you? (Wezigns & co) — Chennai ₹')
    expect(url).toBe(`https://example.com/?q=${encodeURIComponent('Who are you? (Wezigns & co) — Chennai ₹')}`)
    expect(url).toContain('Who%20are%20you%3F')
    expect(url).toContain('%26')
    expect(url).toContain('%E2%80%94')
    expect(url).not.toMatch(/ /)
    // the query keeps exactly one parameter: & and ? inside the prompt never split it
    const params = new URL(url).searchParams
    expect([...params.keys()]).toEqual(['q'])
    expect(params.get('q')).toBe('Who are you? (Wezigns & co) — Chennai ₹')
  })

  it('leaves a template without {q} unchanged', () => {
    expect(summaryUrl('https://example.com/', 'hi')).toBe('https://example.com/')
  })

  it('gives every engine an https URL carrying the encoded prompt', () => {
    expect(aiSummary.engines).toHaveLength(5)
    for (const engine of aiSummary.engines) {
      const url = summaryUrl(engine.url, aiSummary.prompt)
      expect(url.startsWith('https://')).toBe(true)
      expect(url).toContain(encodeURIComponent(aiSummary.prompt))
      expect(url).not.toContain('{q}')
      expect(new URL(url).searchParams.get('q')).toBe(aiSummary.prompt)
    }
  })
})
