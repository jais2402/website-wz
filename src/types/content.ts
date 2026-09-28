/**
 * Generated from content/schema/site.schema.json — run `pnpm content:types`.
 * The hand-written shape below is the minimum the app relies on; regenerate
 * rather than editing once the schema settles.
 */

export type Hue = 'blueprint' | 'pine' | 'ochre' | 'plum' | 'rose' | 'signal';
export type Side = 'l' | 'r' | 'c';

export interface Link {
  label: string;
  href: string;
  topic?: string;
  variant?: 'primary' | 'secondary';
}

export interface Headline {
  lead: string;
  accent?: string;
  muteFirst?: boolean;
}

export interface Metric {
  value: string;
  label: string;
}

export interface CaseStudy {
  slug: string;
  n?: string;
  hue?: Hue;
  region: string;
  sector: string;
  title: string;
  body: string[];
  tags?: string[];
  metrics: Metric[];
}

export type SectionPattern =
  | 'sequence'
  | 'statement'
  | 'statement-proof'
  | 'steps'
  | 'figures'
  | 'cases'
  | 'faq'
  | 'form'
  | 'prose';

export interface Section {
  id: string;
  scene?: string;
  side?: Side;
  pattern: SectionPattern;
  headline?: Headline;
  eyebrow?: string;
  lead?: string;
  link?: Link;
  items?: unknown[];
  [key: string]: unknown;
}

export interface SiteContent {
  meta: {
    name: string;
    since: number;
    tagline?: string;
    description?: string;
    email: string;
    markets: string[];
    siteUrl: string;
    og?: { image: string; imageAlt: string };
    TODO_business_facts: {
      phone: string | null;
      whatsapp: string | null;
      priceBand: string | null;
      shapeStagePaid: boolean | null;
      offices: unknown[];
      namedClients: unknown[];
      team: unknown[];
      certifications: unknown[];
      note?: string;
    };
  };
  nav: { primary: Link[]; cta: Link };
  hero: Section & { sub: string; actions: Link[] };
  sections: Section[];
  cases: CaseStudy[];
  testimonials: { enabled: boolean; items: unknown[]; note?: string };
  footer: Record<string, unknown>;
  pages: Record<string, Record<string, unknown>>;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Hand-written narrowings.
 *
 * The generated types above mirror the JSON Schema, which types `pages` and a
 * section's pattern-specific fields loosely. These give the pages a real shape
 * so routes do not cast at every use site.
 *
 * Keep in step with content/schema/site.schema.json.
 * ────────────────────────────────────────────────────────────────────────── */

export interface PageCta {
  title: string;
  body: string;
  action: Link;
}

export interface DocumentPage {
  title: string;
  description: string;
  headline: Headline;
  lead?: string;
  cta: PageCta;
}

export interface WorkPage extends DocumentPage {}

export interface CapabilitiesPage extends DocumentPage {
  rangeIntro?: string;
  stackIntro?: string;
}

export interface FooterContent {
  cta: { title: string; email: string; body: string; markets?: string[] };
  columns: Array<{ title: string; links: Link[] }>;
  wordmark: string;
  base: string[];
}
