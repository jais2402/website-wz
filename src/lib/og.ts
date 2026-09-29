import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { content } from './content';

/**
 * The share image, only when the file is actually in public/.
 *
 * A missing og:image is silent; one that points at a 404 renders a broken card
 * in every chat a referrer pastes the link into, and the Organization logo
 * 404s with it. Build time only (static export): drop the file into
 * public/og/ and the tags appear on the next build, with no code change.
 */
export function ogImage(): { url: string; alt: string } | null {
  const og = content.meta.og;
  if (!og) return null;
  return existsSync(join(process.cwd(), 'public', og.image)) ? { url: og.image, alt: og.imageAlt } : null;
}
