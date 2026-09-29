import { content } from '@/lib/content';
import type { Hue } from '@/types/content';

/**
 * The scene's view of the content.
 *
 * Hues, titles and ordering come from content/site.json so the model can never
 * disagree with the page. The geometric constants below are the approved
 * prototype's — they are the design, not parameters to tune.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
const S: Record<string, any> = Object.fromEntries(
  content.sections.map((s) => [(s as any).id, s]),
);
/* eslint-enable @typescript-eslint/no-explicit-any */

/** Single-letter hue codes used by the range rows in the content file. */
const HUE_CODE: Record<string, Hue> = {
  '': 'blueprint',
  o: 'ochre',
  p: 'pine',
  u: 'plum',
  s: 'signal',
};

export interface Disc {
  hue: Hue;
  /** Short label for the 3D callout — the full title is too long beside a module. */
  short: string;
}

/** Module heights for the eight disciplines. From the prototype. */
export const DISC_HEIGHT = [1.3, 0.9, 1.1, 1.6, 0.8, 1.2, 1.0, 0.7, 1.45];

/** Callout labels, shortened. The full titles live in the DOM. */
const DISC_SHORT = [
  'Custom software',
  'Automation',
  'Integration',
  'Data and reporting',
  'Platforms',
  'Hosting and support',
  'AI and Gen-AI',
  'Websites',
  'Ecommerce',
];

export const DISC: Disc[] = (S.build?.items ?? []).map(
  (item: { hue?: Hue }, i: number) => ({
    hue: item.hue ?? 'blueprint',
    short: DISC_SHORT[i] ?? '',
  }),
);

export const RANGE: Array<{ hue: Hue; title: string }> = (S.range?.items ?? []).map(
  (item: { hue?: string; title: string }) => ({
    hue: HUE_CODE[item.hue ?? ''] ?? 'blueprint',
    title: item.title,
  }),
);

export const PROC: Array<{ title: string; output: string }> = (S.how?.items ?? []).map(
  (item: { title: string; output?: string }) => ({
    title: item.title,
    output: item.output ?? '',
  }),
);

export const INT: Array<{ hue: Hue; title: string }> = (S.integration?.items ?? []).map(
  (item: { hue?: Hue; title: string }) => ({
    hue: item.hue ?? 'blueprint',
    title: item.title,
  }),
);

/** The stack layers the tech section names — one plate each, top to bottom. */
export const TECH: string[] = (S.tech?.layers ?? []) as string[];

/** Countries served — the names in the regions chapter. One marker each. */
export const REGIONS: string[] = (S.regions?.layers ?? []) as string[];

export const CASES = content.cases.map((c) => ({
  hue: (c.hue ?? 'blueprint') as Hue,
  region: c.region,
  sector: c.sector,
}));

/**
 * content/site.json names its scenes for what they depict; the prototype's
 * state functions are keyed by the section they belong to. This maps one to
 * the other, so the content file keeps its own vocabulary.
 */
export const SCENE_ALIAS: Record<string, SceneKey> = {
  workarounds: 'hero',
  disciplines: 'build',
  intelligence: 'ai',
  onesystem: 'moment',
  principles: 'principles',
  range: 'range',
  stages: 'how',
  price: 'price',
  since2012: 'evidence',
  cases: 'work',
  connected: 'integration',
  architecture: 'tech',
  questions: 'faq',
  start: 'contact',
  regions: 'regions',
};

/** Scene order. */
export const SCENES = [
  'hero', 'build', 'ai', 'moment', 'principles', 'range', 'how',
  'price', 'evidence', 'regions', 'work', 'integration', 'tech', 'faq', 'contact',
] as const;

export type SceneKey = (typeof SCENES)[number];

/**
 * NOTE for centred chapters: the stage computes scale as
 * clamp(0.42, 1.1, (stageWidth / W) / 0.45 * boost), and a centred stage is the
 * full width — so any boost above ~0.5 hits the 1.1 cap and does nothing.
 * Pricing's 0.3 gives ~0.67: a model that fits under a taller text block.
 *
 * Per-scene camera scale multiplier. The prototype tuned these by eye against
 * the reading column; they are design values.
 */
export const BOOST: Record<string, number> = {
  hero: 0.8, build: 0.78, ai: 0.72, moment: 0.6, principles: 0.82,
  range: 1.28, how: 0.88, pricing: 0.5, evidence: 0.85, work: 0.86,
  integration: 0.64, tech: 0.74, faq: 0.9, contact: 0.9,
  // Centred: see the note above — below ~0.5 is where the value takes effect.
  regions: 0.44,
};
