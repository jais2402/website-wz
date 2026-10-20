# SEO + GEO implementation plan

Built from `old-site-audit.md`, `keyword-geo-research.md` and `new-site-audit.md`. Legal pages follow
`docs/legal/research.md`.

## Decisions

- **Canonical origin: `https://www.wezigns.com`.** The old site has always run on https www, `brand.url` already uses
  it, and it keeps whatever equity exists. The bare domain, `http://` and `website-wz.vercel.app` 301 to it, set up in
  Vercel Domains. `website-wz.vercel.app` gets `X-Robots-Tag: noindex`.
- **Old URLs:** `/`, `/about-us`, `/our-services` and `/contact-us` are the same URLs on the new site (no redirect).
  `/index` → `/`, `/portfolio` and `/portfolio-item-*` → `/#work`, `/careers` → `/about-us` (a page about the
  company beats the home page as a soft landing). `trailingSlash: false` so `/about-us/` resolves.
- **Visible headlines stay** as the client wrote them. Keywords go into `<title>`, meta descriptions, structured
  data, the crawlable HTML snapshot and the hero eyebrows, not into rewritten H1s.
- **Claims:** "the leading … provider" stays (client decision), backed in structured data by checkable facts
  (founding date 2012, 11 countries, case-study results). "GST billing" is not used anywhere until confirmed.
- **Social cards:** PNG images (1200×630) are generated from code-drawn SVG at build time, so the page itself keeps
  its no-raster rule.
- **AI search bots are welcome, training crawlers are not** (client decision, 2026-10-20): robots.txt allows search
  engines and AI answer bots (OAI-SearchBot, ChatGPT-User, Claude-SearchBot, PerplexityBot) and disallows training
  crawlers (GPTBot, ClaudeBot, Google-Extended, Applebot-Extended, CCBot, Bytespider, Meta-ExternalAgent).
- **Fonts are self-hosted** (removes the only third-party request on page load, helps GDPR and first paint).

## Work streams (parallel, separate files)

1. **Head, structured data and crawl files**: `src/content/seo.ts` (per-page title, description, canonical, OG,
   breadcrumbs, JSON-LD data), a Vite plugin that injects it into each HTML head and writes `sitemap.xml` and
   `llms.txt`, `public/robots.txt`, OG card images, `vercel.json` (trailing slash, headers, careers redirect).
2. **Crawlable HTML snapshot**: a Vite plugin that renders each page's real copy from the content modules as
   semantic HTML inside `#root`; React replaces it on load. Same text users see. Inner pages preload their code so
   there is no flash.
3. **Fonts and on-page fixes**: self-hosted `@font-face`, heading word spacing for split lines, labelled SVGs.
4. **Legal + sitemap pages** (after the legal research): Privacy Policy, Terms, Cookie statement, an HTML sitemap
   page, footer links.

## Client actions (cannot be done in code)

Verify Google Search Console and Bing Webmaster Tools by DNS now and export the old site's data; claim/update the
Google Business Profile "WEZIGNS"; consistent NAP listings (LinkedIn, Clutch, GoodFirms, Justdial, IndiaMART);
confirm the Brisbane and Stoke-on-Trent offices; check the old host's error pages for the parking script; supply
`sameAs` profile URLs, CIN/GSTIN and named people for About.
