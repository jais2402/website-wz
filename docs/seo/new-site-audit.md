# New site: technical SEO and GEO audit

Scope: the `immersive-redesign` branch at `38eaccf`, built with `npm run build` on 2026-10-19, plus the live preview
of an older build at https://website-wz.vercel.app and the current old site at www.wezigns.com. Read-only audit: no
project file was changed except this report.

Pages audited (13 built HTML files): `/`, `/contact-us`, `/about-us`, `/our-services`, `/ai`, `/technology`, `/404`,
`/systems/{people,revenue,operations,ecommerce,finance,industry}`.

---

## Summary, ranked by severity

| # | Severity | Finding |
|---|---|---|
| 1 | **Critical (blocker)** | The home page renders **blank at any viewport under 900px** (all phones, Googlebot Smartphone). `Work.tsx` crashes in a layout effect and React unmounts the whole tree. |
| 2 | **Critical** | Every built HTML file has an **empty `<div id="root"></div>`**: 0 words of body text and 0 `<a href>` links in the raw HTML. AI crawlers and Bing see nothing but `<title>` and the meta description. |
| 3 | High | No `rel="canonical"`, no `og:url`, no `og:image`, `twitter:card=summary` with no image. Shared links show no picture. |
| 4 | High | No `sitemap.xml`, no `llms.txt`; `robots.txt` has no `Sitemap:` line. |
| 5 | High | No structured data (JSON-LD) on any page. No machine-readable NAP for the Chennai office. |
| 6 | High | Domain hygiene for the launch: `brand.url` and the AI-summary prompt use `https://www.wezigns.com` while the target is `wezigns.com`; `website-wz.vercel.app` is indexable (no `X-Robots-Tag`) and will duplicate the real domain; trailing-slash URLs (`/about-us/`, the form the old site used) return 404. |
| 7 | Medium | Multi-line H1s/H2s are built from `<span>` lines with no space between them: `textContent` reads "Every loose thread,woven intoone system." Text extractors (AI crawlers after prerendering, snippets, some screen readers) get run-together words. |
| 8 | Medium | Desktop home LCP is held back by the ~3 s preloader, and the hero H1 only exists after ~150 kB gzip of JS runs. three.js (264 kB gzip) downloads on every desktop page with a loom hero. |
| 9 | Medium | Titles are short and generic on key pages ("AI \| Wezigns", "About \| Wezigns", 12 to 17 chars) and no title mentions Chennai/India. System-page descriptions are 79 to 103 chars (room to add intent and location). |
| 10 | Low | `/contact-us` reuses the home `og:description` instead of its own. Render-blocking Google Fonts CSS (4 families, 11 faces). No `apple-touch-icon` or web manifest. 6 of 19 home SVGs are neither labelled nor `aria-hidden`. |

What is already right: `lang="en"` on every page, unique `<title>` and meta description per page, `theme-color`,
SVG favicon, `noindex` on `404.html`, `cleanUrls: true`, 308 redirects for the old URL slugs (`/portfolio-item-*`,
`/index`, `/careers`, `/about`, `/contact`, `/systems`), HTTPS + HSTS (Vercel default), immutable caching on
`/assets/*`, FAQ answers are in the DOM even when collapsed, `SplitReveal` headings keep their full text as
`aria-label` and in the DOM.

---

## 1. Home page blank under 900px (blocker, fix before anything else)

Reproduced on `vite preview` of the fresh build: at 375×812 and 796×372 `#root` is empty and the console shows
`Uncaught TypeError: Cannot read properties of null (reading 'offsetLeft')`. At 1440×900 the page renders fine.

Cause, `src/components/Work.tsx` (thread measurement, added in `c6f68c1`):

```ts
const intro = hint.offsetParent as HTMLElement
const start = { x: intro.offsetLeft + hint.offsetLeft + ... }
```

Under `@media (max-width: 899px)` (and desktop reduced motion) `.work-hint` is `display: none`, so `offsetParent`
is `null`. The throw happens inside `useLayoutEffect` and again in the `ResizeObserver` callback; with no error
boundary React unmounts the whole app. Google indexes mobile-first, so **Googlebot Smartphone would index an empty
home page**. Inner pages are not affected (checked at 375px: all render).

Fix: return early when `hint.offsetParent` is null (or measure from `row` instead), and add a top-level error
boundary around each section so one broken effect cannot blank the page. Add a jsdom test that mounts `Work` with
`.work-hint` hidden.

## 2. What a non-JS crawler sees

Raw HTML of every built page (`dist/*.html`, `dist/systems/*.html`): `<head>` metadata, then
`<body><div id="root"></div></body>`. Visible body text: **0 characters on all 13 pages.** Internal `<a href>`
links in raw HTML: **0** (nav, footer, system links and CTAs are all created by React).

After JavaScript (measured in the browser at 1440px) the content is rich: the home page has ~11,500 characters,
1 H1, ~20 H2s and ~60 links; inner pages have 58 to 71 links each with sensible H1 → H2 → H3 trees.

Impact by crawler:

- **Googlebot**: renders JavaScript, but in a second, queued pass (seconds to days) under a render budget. This
  site needs ~150 kB gzip of JS before the first word appears and the home page triggers WebGL and GSAP. Link
  discovery waits for rendering too, so new pages are found more slowly. Today, with bug #1, the mobile render is
  empty.
- **Bingbot** (also feeds ChatGPT search, Copilot, DuckDuckGo, Yahoo): renders JS only partially and
  inconsistently. Expect thin or empty pages.
- **AI crawlers** (GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-User, PerplexityBot, Perplexity-User,
  CCBot, Applebot-Extended, Meta-ExternalAgent): **do not execute JavaScript.** They see the title and one meta
  description per page, nothing else. The site's own "Executive AI Summary" buttons send users to ChatGPT, Claude,
  Perplexity, Gemini and Grok with a prompt that points at the site: when those assistants fetch the page they find
  an empty shell and fall back on stale third-party data (or the 2018 "Design Crew" site).
- **Social previews** (LinkedIn, WhatsApp, Slack, X): read only `<head>`; see item 3.

## 3. Head metadata per page

| Page | Title (chars) | Description (chars) | og:title | og:description | Notes |
|---|---|---|---|---|---|
| `/` | Wezigns \| Custom business software since 2012 (45) | 141 | = title | own copy | OK |
| `/contact-us` | Contact \| Wezigns (17) | 131 | = title | **home og:description** | duplicate |
| `/about-us` | About \| Wezigns (15) | 138 | = title | = description | title too generic |
| `/our-services` | Custom software and business systems \| Wezigns (46) | 152 | = title | = description | OK |
| `/ai` | AI \| Wezigns (12) | 157 | = title | = description | title too generic |
| `/technology` | Technology \| Wezigns (20) | 142 | = title | = description | |
| `/systems/people` | People & workforce systems \| Wezigns (36) | 95 | = title | = description | description short |
| `/systems/revenue` | Revenue & customers systems \| Wezigns (37) | 79 | | | description short |
| `/systems/operations` | Operations & supply chain systems \| Wezigns (43) | 85 | | | description short |
| `/systems/ecommerce` | Ecommerce systems \| Wezigns (27) | 103 | | | |
| `/systems/finance` | Finance & governance systems \| Wezigns (38) | 87 | | | description short |
| `/systems/industry` | Industry systems \| Wezigns (26) | 93 | | | |
| `/404` | Page not found \| Wezigns (24) | 77 | none | none | `noindex` (correct) |

Missing on every page: `<link rel="canonical">`, `og:url`, `og:image` (+ `og:image:width/height/alt`), `og:locale`,
`twitter:title/description/image` (fall back to OG, acceptable), `summary_large_image`, `apple-touch-icon`,
`manifest`. No `<meta name="robots">` on indexable pages (fine: default is index, follow; add
`max-image-preview:large` once an OG image exists).

`og:image`: the no-raster rule covers the page itself. Social cards need a 1200×630 PNG or JPG (SVG is not
supported by LinkedIn, X, WhatsApp, Facebook). Proposal that respects the rule: draw the cards in SVG (code, like the
rest of the site) and rasterise them at build time to `dist/og/<page>.png`. Confirm with the client.

Title suggestions (keep under ~60 chars): "Custom AI solutions and AI workflows | Wezigns", "About Wezigns, custom software
company in Chennai", "HR and payroll software, built for you | Wezigns". Final wording should come from
`docs/seo/keyword-geo-research.md`.

## 4. Indexing files, redirects, domains

- `public/robots.txt`: `User-agent: * / Allow: /`. No `Sitemap:` line. No explicit AI-crawler policy (allowing all
  is the right call for a services firm wanting AI visibility; say so explicitly).
- `sitemap.xml`: missing (404 on the preview). `llms.txt`: missing.
- 404: the new build has `404.html` with `noindex`; Vercel serves it with status 404 for unknown paths. (The live
  preview is older and returns Vercel's plain-text 404.)
- `cleanUrls: true`: `/about-us.html` → 308 `/about-us` (good). **Trailing slashes are not handled**:
  `/about-us/` → 404. The old site's links and Google's index use `/about-us/` style. Add `"trailingSlash": false`
  so they 308 to the slash-less form.
- Old URL map: the old sitemap lists `http://wezigns.com/` + `/contact-us`, `/index`, `/about-us`,
  `/our-services`, `/portfolio`, `/careers` and ~45 `/portfolio-item-*` URLs. All are covered by the existing
  redirects or by real pages. Check that the case-sensitive slugs (`portfolio-item-CKCa-rental`, `-Ish`, `-Grace`)
  match `/portfolio-item-:slug` (they should; verify after launch).
- www vs apex: today both `wezigns.com` and `www.wezigns.com` answer 200 on the old Apache host (no
  canonicalisation). On Vercel, add both domains, make **`wezigns.com` primary** and set `www` to 308 → apex
  (Domains settings, not `vercel.json`). HTTP → HTTPS and HSTS are automatic on Vercel.
- `brand.url = 'https://www.wezigns.com'` and the AI-summary prompt hard-code `www`. Change to
  `https://wezigns.com` before launch so canonicals, JSON-LD and AI prompts all agree.
- `website-wz.vercel.app` (production alias) sends no `X-Robots-Tag`, so it is indexable and will duplicate the real
  domain. After the domain moves: redirect it to `wezigns.com` (host-conditioned redirect) or send
  `X-Robots-Tag: noindex` for that host. Vercel adds `noindex` only to preview deployments, not this alias.
- Submit the new sitemap in Google Search Console and Bing Webmaster Tools (Bing also feeds ChatGPT search); use the
  Change of Address tool only if the property changes host (www → apex counts).

## 5. Structured data

None today. Recommended JSON-LD (one `@graph` per page, stable `@id`s so pages reference one Organization):

| Page | Types |
|---|---|
| All pages | `Organization` + `ProfessionalService` (one node, `@id: https://wezigns.com/#org`): `name` Wezigns, `legalName` Wezigns Software Private Limited, `url`, `logo` (PNG), `email` contact@wezigns.com, `telephone` +91 44 2364 3252, `foundingDate` 2012, `address` PostalAddress (#4 / 25B, 1st Floor, Block 1, Boopathy Street, Arcot Road, Virugambakkam, Chennai 600092, Tamil Nadu, IN), `areaServed` the 11 countries in `countries`, `sameAs` (LinkedIn etc.: **needs client input**). `WebSite` (`@id: /#website`, `publisher` → org; no `SearchAction`, there is no site search). `WebPage` per URL. |
| `/` | the above + `FAQPage` from `faq` (Google shows FAQ rich results only for gov/health sites now, but the markup still helps AI answers) + `ItemList` of the six systems. |
| `/our-services` | `CollectionPage` + `ItemList` of `Service` nodes (link to each system page) + `BreadcrumbList`. |
| `/systems/*` | `Service` (`serviceType`, `name` = title, `description` = intro, `provider` → org, `areaServed`, `hasOfferCatalog` from `modules`) + `BreadcrumbList` (Home › Our services › {title}). |
| `/ai` | `Service` ×2 (AI workflows, Custom AI solutions) + `BreadcrumbList`. |
| `/technology` | `WebPage` + `BreadcrumbList` (optionally `about` → `DefinedTerm` per stack item; low value). |
| `/about-us` | `AboutPage` (`mainEntity` → org) + `BreadcrumbList`. |
| `/contact-us` | `ContactPage` + org `contactPoint` (`contactType` sales, `telephone`, `email`, `availableLanguage` en) + `BreadcrumbList`. |

Do not add `aggregateRating`, `review` or geo coordinates unless they are real and confirmed. Case-study numbers in
`areas` are illustrative demo data: keep them out of structured data.

## 6. On-page

- **Headings**: one H1 per page everywhere. H2/H3 trees are meaningful (checked by rendering every page).
  `SplitReveal` keeps the text in the DOM and sets `aria-label` on the heading, so the accessible name is intact.
  Problem: multi-line headings (`loom.title`, `PageHero` title arrays, the pricing H2) render lines as adjacent
  `<span>`s with no whitespace, so `textContent` is "Every loose thread,woven intoone system.", "From small
  businessto enterprisesystems.", "AI that doesreal workfor your business." Fix: emit `{' '}` between line spans
  (CSS `display:block` keeps the look).
- Home H2 "Executive AI Summary" appears on every page: fine, but consider an `<aside>` and an H2 that says what it
  is ("Ask an AI assistant about Wezigns").
- Contact page has only an H1; the address/phone/email cards have no headings. Add H2s ("Visit", "Call", "Email")
  for structure and for local intent.
- **Internal linking**: strong once rendered (nav lists every page, footer lists every system, each system page links
  to "Other systems we build"). Anchor text is descriptive. Footer hash links get a `/` prefix on inner pages
  (`/#build`), which is correct. Home case studies live at `/#work` only: no standalone case-study URLs to rank.
- **Images/SVG**: no raster images. 13 of 19 SVGs on home are `aria-hidden`; 6 have neither a label nor
  `aria-hidden`. Charts carry "Sample data" text; keep them decorative (`aria-hidden`) and make sure the numbers
  that matter exist as text.
- **WebGL text**: the threads labels (`threadsIn`, `untangle`) exist only in the canvas, which is fine as long as the
  before/after copy carries the same message in HTML (it does).
- **Language**: `lang="en"` everywhere. Copy is en-IN in places (en-IN number formatting in charts); consider
  `og:locale=en_IN`. No hreflang needed (one language).

## 7. Performance signals

Build output (gzip), critical path per page type:

| Page | Render-blocking CSS | JS before first paint of content | Lazy, but fetched at once on desktop |
|---|---|---|---|
| `/` | ~20 kB (LiteProvider 12.3, loom 4.4, EnquiryForm 1.8, sections 1.3) | ~153 kB: LiteProvider (React DOM) 67.5, EnquiryForm chunk (GSAP + ScrollTrigger) 65.0, main 9.8, sections 5.1, jsx 3.4, store 1.9 | loom chunk (three.js + R3F) **264 kB**, Scene 5.5 |
| Inner pages | ~17 kB + page CSS 1 to 3 kB | ~72 kB + `pages` 6.8 + page chunk 0.9 to 3.1 (+ GSAP chunk where used) | loom 264 kB for the hero loom (skipped in lite mode) |
| `/contact-us` | ~19 kB | ~140 kB | loom 264 kB (contact loom; SVG in lite mode) |

Plus Google Fonts CSS (render-blocking, third-party origin) and 11 font faces across Inter, Inter Tight,
Instrument Serif and JetBrains Mono.

- **LCP**: on home, the LCP candidate is the H1 in `.loom-intro`, which exists only after the JS above executes. On
  desktop the preloader (2.1 s counter + 0.65 s fade + 1 s wipe) covers it, so desktop LCP is ~3.5 s or more even on
  fast connections. Phones skip the preloader (good). Inner pages: the `PageHero` H1, after ~80 kB JS.
- **CLS**: risks are font swap (Inter Tight with tight tracking vs the fallback), ScrollTrigger pin spacers inserted
  after load, and the Work thread SVG sized by `setSvg` after measuring. Static HTML in `#root` (plan below) adds a
  swap risk that must be handled (see Phase 2 notes).
- **INP/TBT**: three.js shader compilation and GSAP setup on the main thread at load on desktop. Lite mode and the
  FPS watchdog limit damage on weak devices.
- Suggestions: self-host the fonts (subset Latin, `woff2`, `preload` Inter Tight 600/700 and Inter 400, metric-matched
  fallback with `size-adjust`), drop unused weights; start the loom chunk download after first paint or on
  `requestIdleCallback`; consider skipping the preloader when the page is opened from search (it delays the first
  view of the H1 for every desktop visitor).

## 8. Headers (`vercel.json`)

Present: `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options: DENY`, `Permissions-Policy`,
`Cache-Control: immutable` on `/assets/*`; HSTS from Vercel. HTML gets `max-age=0, must-revalidate` (correct).

Missing or worth adding:
- `X-Robots-Tag: noindex` for the `*.vercel.app` host (host-conditioned `has` rule), and for `/api/*`.
- `Cache-Control` for `/sitemap.xml`, `/robots.txt`, `/llms*.txt`, `/og/*` (e.g. `max-age=3600`).
- `Content-Security-Policy` (not an SEO factor; a security gap worth closing: fonts.googleapis.com,
  fonts.gstatic.com, `/api/enquiry`).
- `Link: <https://wezigns.com/...>; rel="canonical"` is not needed once the HTML has canonicals.

---

## Implementation plan

Order matters: Phase 0 is a bug fix; Phases 1 to 3 are build-time only and do not touch the React components'
behaviour.

### Phase 0: stop the mobile crash (today)

1. Guard `Work.tsx` measure: `if (!intro) return` (and skip when `.work-hint` is hidden).
2. Add a small `SectionBoundary` error boundary around each home section and each inner page body.
3. Test: mount `Work` with `.work-hint { display:none }` in jsdom; assert no throw.

### Phase 1: one SEO source of truth + head tags (low risk)

- New `src/content/seo.ts` (pure data, no imports beyond `site.ts`/`pages.ts`): per route `path`, `title`,
  `description`, `ogTitle`, `ogDescription`, `ogImage`, `breadcrumb`, `schema` kind, `indexable`. Set
  `SITE_URL = 'https://wezigns.com'` here and in `brand.url`.
- New `src/lib/seo.ts` (pure, unit-tested): `escapeHtml`, `headTags(route)` → canonical, OG, Twitter,
  robots `max-image-preview:large`; `jsonLd(route)` → `<script type="application/ld+json">` with the `@graph`
  from section 5; `sitemapXml(routes)`; `llmsTxt(routes)`.
- Vite plugin in `vite.config.ts` (`name: 'seo'`), using `transformIndexHtml(html, ctx)`: map `ctx.filename` /
  `ctx.path` to the route, then inject head tags before `</head>`. The `.html` entry files keep only charset,
  viewport, favicon and fonts; titles and descriptions move to `seo.ts` (one place to edit, matches the "copy lives
  in content/" rule). Works in dev and build. `vite.config.ts` can import the TS content modules directly (Vite
  bundles the config).
- Test: a vitest that runs `headTags` for every route and asserts unique titles, descriptions 120 to 160 chars,
  absolute canonical without trailing slash, og:image present.

### Phase 2: real content in the raw HTML (the main fix)

**Recommended: static semantic snapshot in `#root`, generated from the content modules.**

- `src/lib/staticHtml.ts` (pure string templates, or JSX rendered with `react-dom/server`'s
  `renderToStaticMarkup` in a separate `src/seo/` folder; both avoid window/WebGL). One renderer per page type:
  home, services, system (by slug), ai, technology, about, contact, 404. Each outputs: a `<header>` with the real
  nav (`<a href>` to every page), the page's `<main>` with H1 (with spaces between lines), H2/H3, paragraphs and
  lists from `site.ts` / `pages.ts` (system modules, pains, impact; FAQ Q&A; process; pricing; contact NAP in an
  `<address>`), and the real footer links.
- The same `transformIndexHtml` hook replaces `<div id="root"></div>` with
  `<div id="root"><div class="seo-static">…</div></div>`.
- No client change is required: `createRoot(...).render()` clears the container on its first commit, so users get
  the app, crawlers get the same words. This is not cloaking: the text is identical, visible, and shown to everyone
  until JS takes over.
- Swap handling (avoid a flash or CLS):
  - Reuse the app's own classes (`wrap`, `display`, `pg-hero`, `pg-title`, `lead`) so the render-blocking CSS
    already styles the snapshot like the real hero.
  - Inner pages: `pages/main.tsx` wraps `PageRouter` in `<Suspense fallback={null}>`, so React would clear the
    snapshot and show nothing until the lazy page chunk arrives. Either preload the page chunk
    (`<link rel="modulepreload">` injected per page by the plugin) or keep the snapshot as the Suspense fallback by
    making the fallback a component that renders nothing and deferring the first `render()` until
    `import('./PageRouter')` resolves. The second option is a two-line change in `pages/main.tsx`.
  - Home desktop: the preloader covers the swap. Home mobile: keep the snapshot hero visually close to the real one
    (same H1 classes).
  - Mark decorative snapshot blocks with no extra styling; do not hide the snapshot with `display:none`,
    `visibility:hidden` or off-screen positioning (that would look like cloaking).
- Drift protection: a vitest that renders the real page in jsdom and the snapshot, and asserts every H1/H2 text in
  the app appears in the snapshot.

**Alternative: full prerender with `react-dom/server` + `hydrateRoot`.** Assessed as **not low risk** now:
`LiteProvider` probes WebGL with a canvas inside a `useState` initializer, `usePrefersReducedMotion`,
`GuideLight` and `useLite` read `window.matchMedia` during render, the lite vs WebGL trees differ by device (hydration
mismatches by design), GSAP `from()` tweens set initial states in effects, and the R3F scenes are lazy. It needs
`typeof window` guards in ~6 places, a "server" lite decision and careful mismatch handling. A middle path is
`renderToString` at build time with window shims, then keep `createRoot` (no hydration) so the server markup is only
a snapshot. That gives exact markup parity but costs more than the template approach for the same crawler benefit.
Revisit only if the snapshot drifts.

### Phase 3: indexing files

| File | Where | How |
|---|---|---|
| `robots.txt` | keep static in `public/` | Add `Sitemap: https://wezigns.com/sitemap.xml`; keep `Allow: /`; optionally list GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot, Google-Extended, Applebot-Extended with `Allow: /` to make the policy explicit; `Disallow: /api/`. |
| `sitemap.xml` | build plugin (`generateBundle` → `this.emitFile`) | From the route list in `seo.ts` (same list as `INPUTS`, minus `404`; never `loom.html`). `<lastmod>` = build date or last git commit date per source file. |
| `llms.txt` | build plugin | Markdown per llmstxt.org: H1 Wezigns, one-paragraph summary (from `aiSummary.prompt` facts), sections "Systems", "AI", "Company", "Contact" with links to each page and a one-line description each. |
| `llms-full.txt` (optional) | build plugin | The same text as the static snapshots, as Markdown, in one file. |
| OG images | build script or plugin | SVG card templates in code → PNG 1200×630 via `@resvg/resvg-js` at build into `dist/og/`. |
| `vercel.json` | static | `"trailingSlash": false`; host-conditioned redirect or `X-Robots-Tag: noindex` for `website-wz.vercel.app`; `X-Robots-Tag: noindex` on `/api/(.*)`; cache headers for the files above. |

### Phase 4: polish

- Titles and descriptions rewritten from the keyword research (Chennai/India, "custom software", "HR software",
  "AI workflows").
- Spaces between heading line spans; H2s on the contact cards; label or hide the 6 unlabelled SVGs.
- Self-hosted fonts with preload; idle-load the loom chunk; reconsider the desktop preloader.
- `apple-touch-icon` (PNG 180×180) and a minimal `site.webmanifest`.

### Verification after each phase

- `curl -s https://<preview>/systems/people | sed -n '/<body/,$p'` shows the H1, modules and links.
- `npm run validate`, `npm run build`, desktop 1440×900 and mobile 375×812 checks (CLAUDE.md workflow).
- Google Rich Results Test and Schema.org validator on each page type; URL Inspection (live test) in Search
  Console for `/` on smartphone; Bing URL Inspection.
- Lighthouse mobile on `/` and one system page (LCP, CLS) before and after Phase 2.
