import type { MetadataRoute } from 'next';
import { content } from '@/lib/content';
import { capabilityPages } from '@/lib/pages';

/**
 * Static export renders this to /sitemap.xml at build time.
 *
 * The capability pages are derived from the content file, so adding an
 * offering adds its page here without a second edit. The fixed routes are
 * kept in step with app/ by hand — if a route is added, add it here.
 */
export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = content.meta.siteUrl.replace(/\/$/, '');
  const lastModified = new Date();

  return [
    { url: `${base}/`, lastModified, changeFrequency: 'monthly', priority: 1 },
    { url: `${base}/work/`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/capabilities/`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    ...Object.keys(capabilityPages).map((slug) => ({
      url: `${base}/capabilities/${slug}/`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    { url: `${base}/about/`, lastModified, changeFrequency: 'yearly', priority: 0.6 },
    { url: `${base}/contact/`, lastModified, changeFrequency: 'yearly', priority: 0.6 },
  ];
}
