import robots from '../../public/robots.txt?raw'

/** The rules a named user agent gets: the lines of the group that lists it. */
function groupFor(agent: string) {
  const groups = robots.split(/\n\s*\n/)
  return groups.find((g) => g.split('\n').some((l) => l.trim() === `User-agent: ${agent}`)) ?? ''
}

describe('robots.txt', () => {
  it.each(['Googlebot', 'Bingbot', 'OAI-SearchBot', 'ChatGPT-User', 'Claude-SearchBot', 'PerplexityBot'])(
    'lets search and AI answer bot %s crawl the site',
    (agent) => {
      expect(groupFor(agent)).toContain('Allow: /')
      expect(groupFor(agent)).not.toMatch(/^Disallow: \/$/m)
    },
  )

  it.each(['GPTBot', 'ClaudeBot', 'Google-Extended', 'Applebot-Extended', 'CCBot'])(
    'blocks AI training crawler %s',
    (agent) => expect(groupFor(agent)).toMatch(/^Disallow: \/$/m),
  )

  it('names the sitemap', () => expect(robots).toContain('Sitemap: https://www.wezigns.com/sitemap.xml'))
})
