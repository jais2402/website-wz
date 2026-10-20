// @vitest-environment node
// Underscore prefix: Vercel does not deploy this file as a function.
// vercel.json is hand-edited: these checks keep the security headers, the preview noindex and the legacy redirects
// from drifting out of step with the code they describe.
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { HEAD_SCRIPT } from '../scripts/vite-snapshot.ts'

type Header = { key: string; value: string }
type Rule = { source: string; has?: { type: string; value: string }[]; headers: Header[] }
type Redirect = { source: string; destination: string }
const config = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8')) as {
  headers: Rule[]
  redirects: Redirect[]
}

const csp = config.headers
  .flatMap((r) => r.headers)
  .find((h) => h.key.startsWith('Content-Security-Policy'))?.value

describe('vercel.json', () => {
  it('sends a CSP that allows the inline head script by its hash and forbids framing', () => {
    expect(csp).toBeDefined()
    const hash = createHash('sha256').update(HEAD_SCRIPT).digest('base64')
    expect(csp).toContain(`'sha256-${hash}'`)
    expect(csp).toContain("frame-ancestors 'none'")
    expect(csp).toContain('https://www.googletagmanager.com')
  })

  it('noindexes every *.vercel.app host, and never the production domain', () => {
    const rule = config.headers.find((r) => r.has?.some((c) => c.type === 'host'))
    expect(rule?.headers).toContainEqual({ key: 'X-Robots-Tag', value: 'noindex' })
    const re = new RegExp(`^${rule!.has![0].value}$`)
    expect(re.test('website-wz.vercel.app')).toBe(true)
    expect(re.test('website-wz-git-main-wezigns.vercel.app')).toBe(true)
    expect(re.test('www.wezigns.com')).toBe(false)
  })

  it('redirects the old site URLs, with specific portfolio rules above the wildcard', () => {
    const to = (source: string) => config.redirects.find((r) => r.source === source)?.destination
    expect(to('/index.php')).toBe('/')
    expect(to('/contact-us.php')).toBe('/contact-us')
    // No case-only redirect: if matching were case-insensitive, /About-Us → /about-us would loop.
    expect(to('/About-Us')).toBeUndefined()
    expect(to('/work')).toBe('/portfolio')
    expect(to('/sitemap_index.xml')).toBe('/sitemap.xml')
    expect(to('/portfolio-item-ckca-rental')).toBe('/portfolio#car-rental')
    const wildcard = config.redirects.findIndex((r) => r.source === '/portfolio-item-:slug')
    config.redirects.forEach((r, i) => {
      if (r.source.startsWith('/portfolio-item-') && r.source !== '/portfolio-item-:slug') expect(i).toBeLessThan(wildcard)
    })
  })
})
