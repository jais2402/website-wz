import type { MetadataRoute } from 'next';
import { content } from '@/lib/content';

/**
 * Three routes. Static export renders this to /sitemap.xml at build time.
 * Kept in step with app/ by hand — if a route is added, add it here.
 */
export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = content.meta.siteUrl.replace(/\/$/, '');
  const lastModified = new Date();

  return [
    { url: `${base}/`, lastModified, changeFrequency: 'monthly', priority: 1 },
    { url: `${base}/work/`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/capabilities/`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
  ];
}
