import type { MetadataRoute } from 'next';
import { content } from '@/lib/content';

export const dynamic = 'force-static';

/**
 * Crawl policy.
 *
 * AI answer-engine crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended,
 * CCBot) are currently ALLOWED by virtue of the blanket `*` rule — they are not
 * named here, so nothing blocks them.
 *
 * That is the default, not a decision. Allowing them means the site can be cited
 * in AI answers, which matters for cohort D (referrers and consultants who
 * increasingly ask an assistant before making an introduction); it also means
 * the content may be used for training. **That trade-off is the CEO's call** —
 * see .claude/agents/geo-specialist.md and tasks.md. Record it in journal.md and
 * then make this explicit either way, rather than leaving it implied.
 */
export default function robots(): MetadataRoute.Robots {
  const base = content.meta.siteUrl.replace(/\/$/, '');
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
