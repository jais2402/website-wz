import type { GlyphName } from '@/components/atoms';

/**
 * The still drawing for each offering, keyed by its anchor.
 *
 * Keyed by slug rather than by position so reordering the offerings in
 * content/site.json keeps every drawing with its subject. Shared by the home
 * bento and the capability pages, so the two cannot disagree.
 */
export const GLYPH_BY_SLUG: Record<string, GlyphName> = {
  'custom-business-software': 'software',
  'business-process-automation': 'automation',
  'system-integration': 'integration',
  'data-and-reporting-systems': 'data',
  'customer-and-partner-platforms': 'platforms',
  'cloud-hosting-support-and-maintenance': 'hosting',
  'ai-and-gen-ai-integrations': 'ai',
  websites: 'websites',
  'ecommerce-systems': 'ecommerce',
};
