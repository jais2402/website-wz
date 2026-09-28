import site from '@content/site.json';
import type {
  CapabilitiesPage,
  FooterContent,
  SiteContent,
  WorkPage,
} from '@/types/content';

/**
 * The only place the content file is read.
 * Build time only — nothing here reaches the client bundle as a fetch.
 *
 * In dev and CI the JSON is parsed against the schema (scripts/validate-content.mjs
 * runs the same check in the pipeline), so a bad edit fails before it ships.
 */
export const content = site as unknown as SiteContent;

export function getSection<T extends SiteContent['sections'][number]['id']>(id: T) {
  const section = content.sections.find((s) => s.id === id);
  if (!section) throw new Error(`Section "${id}" is missing from content/site.json`);
  return section;
}

export function getCase(slug: string) {
  return content.cases.find((c) => c.slug === slug);
}

/** Optional business facts render nothing until they are real. See .claude/context.md §6. */
export function hasFact(key: keyof SiteContent['meta']['TODO_business_facts']): boolean {
  const value = content.meta.TODO_business_facts?.[key];
  return value !== null && value !== undefined && (!Array.isArray(value) || value.length > 0);
}

/**
 * Typed accessors for the document pages.
 *
 * The schema types `pages` as an open record, so without these every route
 * casts at each use site — which is both noisy and a place for a real type
 * error to hide. Narrowed once, here.
 */
export const footer = content.footer as unknown as FooterContent;

export const pages = {
  work: content.pages.work as unknown as WorkPage,
  capabilities: content.pages.capabilities as unknown as CapabilitiesPage,
};
