# Go-live criteria

The checklist the site has to pass before launch at `https://www.wezigns.com`. Wezigns Software Private Limited
(Chennai) is a B2B custom-software studio serving SMEs in 11 countries. Every item has an id, what to check and the
pass condition. Audit against the **production build** (`npm run build && npx vite preview`), because head tags,
JSON-LD, `sitemap.xml`, `llms.txt` and the crawlable HTML snapshot are only injected at build time (see `vite.config.ts`).

Pages in scope: `/`, `/about-us`, `/our-services`, `/systems/{people,revenue,operations,ecommerce,finance,industry}`,
`/ai`, `/technology`, `/pricing`, `/portfolio`, `/contact-us`, `/privacy-policy`, `/terms-and-conditions`,
`/cookie-policy`, `/sitemap`, `404`. `/loom.html` is internal: it must stay unlinked and `noindex`.

Status per item: PASS, FAIL, N/A (with reason), or NEEDS-APPROVAL (a client or legal decision, not a code fix).

Sources: W3C "What's New in WCAG 2.2" and WebAIM WCAG 2.2 checklist (accessibility levels), web.dev / Google Search
Central (Core Web Vitals at p75: LCP, INP, CLS), Open Graph protocol and X card docs, 2025-2026 launch checklists
(staging-noindex leak, OG on every page, sitemap, forms, 28-day CrUX watch), GEO guides (llms.txt is low-cost but its
uptake by AI platforms is unproven, so it is a should, not a blocker). House rules come from `CLAUDE.md`.

---

## 1. Responsive layout (RL)

Viewports: **375x812** phone, **768x1024** and **1024x1366** tablet, **1440x900** laptop, **1920x1080** desktop,
**2560x1440** big monitor. Check each page at each viewport, scrolled top to bottom, including every pinned section.

| id | What to check | Pass condition |
| --- | --- | --- |
| RL-01 | Horizontal scroll | `document.documentElement.scrollWidth <= innerWidth` on every page at every viewport (house rule: 375px with no horizontal scroll). |
| RL-02 | Side gutter on phone | Text and cards keep at least 16px from the viewport edge at 375px. |
| RL-03 | Header and nav | Nav fits or collapses to a working menu; menu opens, closes (button and Esc) and does not trap scroll after close; logo never overlaps links. |
| RL-04 | Hero at each size | Headline, glass panel and loom/visual all visible in the first viewport at 1440x900; nothing clipped at 375x812; at 2560x1440 the hero is not a small island in empty space. |
| RL-05 | Max content width on big screens | At 1920 and 2560 content sits in a sensible max width (or scales intentionally); line length for body copy stays at or under ~80 characters. |
| RL-06 | Pinned / scroll sections | Story, services pin, systems explorer, Our Work and process complete their full sequence at each viewport with no jump, blank frame or stuck pin; desktop-only pins fall back to stacked layout below their breakpoint. |
| RL-07 | Tablet portrait and landscape | 768x1024 and 1024x1366 show no half-desktop states (overlapping columns, cramped 3-up grids, orphaned single cards). |
| RL-08 | Big display words | Satoshi display words fit their containers at every viewport (house rule: Satoshi sets wide); no word broken mid-letter or clipped. |
| RL-09 | Tables, pricing, forms | Pricing cards, comparison rows and the contact form reflow to one column on phone with readable labels and full-width inputs. |
| RL-10 | Orientation and resize | Rotating or resizing does not leave WebGL canvases mis-sized or ScrollTrigger pins misplaced (refresh on resize works). |

## 2. Visual polish (VP)

| id | What to check | Pass condition |
| --- | --- | --- |
| VP-01 | Alignment | Section headings, eyebrows and body share one left edge per section; grid columns align across rows. |
| VP-02 | Overflow and clipping | No text cut by `overflow:hidden`, no descenders clipped in big headings, no badges spilling out of cards. |
| VP-03 | Overlap | No element covers another unintentionally (fixed header over anchors, guide light over copy, AI card over knots, cookie/legal notes over footer). |
| VP-04 | Empty states | No card, chart or bento cell looks empty or unfinished at any viewport; every section has content in the first second it is visible (house rule: never feel empty or template-like). |
| VP-05 | Radius and spacing | Card radii, button radii and section padding come from tokens and are consistent per component type. |
| VP-06 | Colour rules | Accent is blue `#4d9fff` / `#8cc4ff`; no yellow or lime in UI text, icons or symbols (3D threads exempt). |
| VP-07 | Glass over 3D | All copy over WebGL sits on a frosted glass panel; no ancestor of a visible glass panel has `filter` or `opacity < 1` (that kills `backdrop-filter`). |
| VP-08 | Fonts | Satoshi, Instrument Serif italic and JetBrains Mono load from `/fonts`; no flash of a wrong font longer than the swap period; ₹ renders (Inter fallback). |
| VP-09 | Illustrations | All visuals code-drawn (CSS/SVG/WebGL): no raster images in the page body, no hero video. |
| VP-10 | Lite / no-WebGL mode | With WebGL unavailable or in lite mode every hero shows its SVG fallback; no blank black blocks. |
| VP-11 | Hover, focus, active states | Every button and link has visible hover and focus states; no stuck hover on touch. |
| VP-12 | Print | System pages print as a one-page summary (`print.css`). |

## 3. Copy and content (CP)

| id | What to check | Pass condition |
| --- | --- | --- |
| CP-01 | Spelling and grammar | Zero typos and grammar errors across all pages, `alt`/`aria-label` text, meta descriptions and OG text. One spelling standard used throughout (British/Indian English). |
| CP-02 | Placeholders | No lorem ipsum, `TODO`, `TBD`, `XXX`, `example.com`, dummy phone numbers or `[brackets]` in rendered output (grep `dist/`). |
| CP-03 | House punctuation | No em dashes (`—`) and no `' · '` separators in rendered copy, titles, descriptions or OG text. |
| CP-04 | Tone | Plain, confident, SME-friendly; no hype words without proof; "you" focused; consistent with "Systems that grow with you." |
| CP-05 | Claims backed | Every number (years, projects, countries = 11, clients, uptime, savings) matches a source the client confirmed; demo numbers in the systems explorer are labelled illustrative. NEEDS-APPROVAL if unconfirmed. |
| CP-06 | Consistency of facts | Company name "Wezigns Software Private Limited", address, phone, email and country list identical on home, contact, footer, legal pages, JSON-LD and `llms.txt`. |
| CP-07 | CTA labels | CTAs are verb-first and specific ("Book a call", "Explore systems"); the same action uses the same label everywhere; each CTA goes to the right place. |
| CP-08 | Single source of copy | Copy lives in `src/content/*.ts`; no hard-coded strings in components (house rule). |
| CP-09 | Brand-safety | No Marvel/Loki names or assets anywhere (code, copy, alt, file names). |
| CP-10 | Legal copy | Privacy, terms and cookie pages are present and approved by legal (they are drafts: NEEDS-APPROVAL until signed off); "last updated" date is set. |
| CP-11 | Dates and year | Footer year and any "since"/"years" figures are current. |

## 4. SEO (SEO)

| id | What to check | Pass condition |
| --- | --- | --- |
| SEO-01 | Title | Unique per page, 50-60 characters, primary keyword first, brand last (`... \| Wezigns`). |
| SEO-02 | Meta description | Unique per page, 140-160 characters, states the offer and a reason to click. |
| SEO-03 | Canonical | Every indexable page has one absolute `rel=canonical` to its clean `https://www.wezigns.com/...` URL (no `.html`, no trailing-slash mismatch). |
| SEO-04 | One H1 | Exactly one `<h1>` per page, in the crawlable HTML, matching the page topic. |
| SEO-05 | Heading order | No skipped levels (H2 then H4); headings are not used for styling only. |
| SEO-06 | Internal links | Every page reachable from nav, footer or `/sitemap` within 2 clicks; no broken internal links (crawl returns 0 x 4xx); descriptive anchor text (no "click here"). |
| SEO-07 | `sitemap.xml` | Lists every indexable page with absolute canonical URLs, valid XML, excludes `loom`, `404`, `/api`; referenced in `robots.txt`. |
| SEO-08 | `robots.txt` | Allows search and AI crawlers, disallows `/api/`, points to the sitemap; no stray `Disallow: /`. |
| SEO-09 | No staging noindex leak | Production pages have no `noindex` meta or `X-Robots-Tag`; preview host `website-wz.vercel.app` does send `noindex`; `/loom.html` is `noindex`. |
| SEO-10 | Structured data | JSON-LD parses and passes Rich Results Test / Schema validator with zero errors: `Organization` (or `ProfessionalService`/`LocalBusiness` with Chennai address), `WebSite`, `BreadcrumbList` on inner pages, `FAQPage` only where the FAQ is visible, `Service` on service/system pages. |
| SEO-11 | hreflang | Single English site serving 11 countries: no hreflang needed (N/A) unless country or language variants exist; if added, they are reciprocal with `x-default`. |
| SEO-12 | 404 | Unknown URLs return HTTP 404 (not 200) with the custom `404.html`, which links home and to key pages. |
| SEO-13 | Redirects | Old wezigns.com URLs return 200 at the same slug or a single 301 to the new one; no chains; `http` and non-www 301 to `https://www.`. |
| SEO-14 | Crawlable content | Each page's main copy is in the served HTML (snapshot in `#root`), not only after JS runs. |
| SEO-15 | Image/visual alt | Meaningful SVG/visuals have accessible names; decorative canvases are `aria-hidden`. |
| SEO-16 | Search Console | Property verified, sitemap submitted, URL inspection passes for home and one inner page (post-launch, owner action). |

## 5. Open Graph and social cards (OG)

| id | What to check | Pass condition |
| --- | --- | --- |
| OG-01 | Core tags | Every page has `og:title`, `og:description`, `og:image`, `og:url`, `og:type` (`website`), `og:site_name`, `og:locale` (`en_IN` or `en_GB`). |
| OG-02 | Absolute URLs | `og:url` equals the canonical; `og:image` is an absolute `https://www.wezigns.com/og/...png` URL. |
| OG-03 | Image spec | Each page's image is 1200x630 PNG/JPG, under 1 MB (ideally under 300 KB), on-brand, text readable at thumbnail size, key content inside the centre safe area. |
| OG-04 | Per-page image | Each page uses its own image from `public/og/` (home, about, services, each system, ai, technology, pricing, portfolio, contact, legal, 404). |
| OG-05 | Image reachable | `curl -I` on every `og:image` returns 200 with `content-type: image/*`, no auth, no redirect loop. |
| OG-06 | Image alt and size | `og:image:width` 1200, `og:image:height` 630, `og:image:alt` set. |
| OG-07 | Twitter / X | `twitter:card` = `summary_large_image`, plus `twitter:title`, `twitter:description`, `twitter:image` (or falls back to OG). |
| OG-08 | Previews render | LinkedIn Post Inspector, Facebook Sharing Debugger and an X/Slack/WhatsApp paste show the correct title, description and image for home, contact and one system page. |
| OG-09 | Copy rules | OG/Twitter text follows CP-01 and CP-03 (no em dashes or ` · `). |

## 6. Accessibility, WCAG 2.2 AA (A11Y)

| id | What to check | Pass condition |
| --- | --- | --- |
| A11Y-01 | Text contrast (1.4.3) | Body text at least 4.5:1, large text at least 3:1, including text on glass panels over the brightest 3D frame. |
| A11Y-02 | Non-text contrast (1.4.11) | Input borders, focus rings, icons that carry meaning at least 3:1. |
| A11Y-03 | Focus visible (2.4.7) | Every focusable element shows a clear focus indicator. |
| A11Y-04 | Focus not obscured (2.4.11, new in 2.2) | A focused element is never fully hidden by the fixed header, guide light or any overlay. |
| A11Y-05 | Keyboard (2.1.1, 2.1.2) | All nav, menus, tabs, before/after slider, FAQ, pricing toggles and forms operable by keyboard; no traps; skip link to main. |
| A11Y-06 | Landmarks and structure | One `header`, `nav`, `main`, `footer` per page; lists are lists; `lang="en"` on `<html>`. |
| A11Y-07 | Names, alt, ARIA | Icon buttons have accessible names; form inputs have labels; ARIA used correctly (axe returns 0 serious/critical). |
| A11Y-08 | Reduced motion (2.3.3 good practice, house rule) | With `prefers-reduced-motion: reduce`: Lenis off, preloader skipped, CSS animations stop, count-ups instant, pins still readable. |
| A11Y-09 | Target size (2.5.8, new in 2.2) | Pointer targets at least 24x24 CSS px or spaced so a 24px circle does not overlap a neighbour (footer links, dots, slider handle, carousel controls). |
| A11Y-10 | Dragging (2.5.7, new in 2.2) | Before/after slider and any drag interaction has a single-pointer or keyboard alternative. |
| A11Y-11 | Reflow and zoom (1.4.10, 1.4.4) | 320px width / 400% zoom with no loss of content; 200% text zoom does not clip. |
| A11Y-12 | Forms and errors (3.3.1, 3.3.3) | Errors announced, tied to fields (`aria-describedby`), with fix suggestions; success state announced. |
| A11Y-13 | Accessible authentication (3.3.8) | N/A unless a login is added. |
| A11Y-14 | Pause/stop (2.2.2) | Auto-moving content over 5 s (marquees, ticker, globe spin) can be paused or stops under reduced motion. |

## 7. Performance (PERF)

| id | What to check | Pass condition |
| --- | --- | --- |
| PERF-01 | LCP | p75 under 2.5 s (lab on mid-tier mobile, 4G throttle, as a proxy until CrUX data exists). |
| PERF-02 | INP | p75 under 200 ms; no long tasks over 200 ms on scroll or tap (WebGL init chunked or deferred). |
| PERF-03 | CLS | Under 0.1; fonts and lazy sections do not shift layout. |
| PERF-04 | Lighthouse | Mobile Performance at least 80 (3D site), Accessibility, Best Practices and SEO at least 95, on home and one inner page. |
| PERF-05 | JS size | Initial JS (gzip) for the home page reported and justified; three.js scene stays in a lazy chunk; inner pages do not load the home scene. |
| PERF-06 | Fonts | Self-hosted WOFF2, critical faces preloaded, `font-display: swap`, subset where possible. |
| PERF-07 | Caching | `/assets/*` immutable for 1 year (set in `vercel.json`); HTML not long-cached. |
| PERF-08 | WebGL hygiene | Each canvas pauses when off screen (house rule); no GPU work when tab hidden; mobile uses reduced thread counts. |
| PERF-09 | Console | Zero errors and zero warnings in the console on every page (dev noise excluded only in preview build check). |
| PERF-10 | Network | No 404s for assets, fonts or OG images; no requests to third-party hosts that are not listed in the privacy policy. |

## 8. Tech and security (SEC)

| id | What to check | Pass condition |
| --- | --- | --- |
| SEC-01 | HTTPS | Valid certificate on `www.wezigns.com` and apex; HTTP redirects to HTTPS. |
| SEC-02 | HSTS | `Strict-Transport-Security: max-age>=31536000; includeSubDomains` once HTTPS on all subdomains is confirmed (NEEDS-APPROVAL for preload). |
| SEC-03 | Security headers | `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options` (or CSP `frame-ancestors`), `Permissions-Policy` present (already in `vercel.json`); a `Content-Security-Policy` (at least report-only) added. securityheaders.com grade A or better. |
| SEC-04 | Enquiry form | `/api/enquiry` sends via Resend when `RESEND_API_KEY` is set; validation on client and server; rate limit or honeypot against spam; graceful mailto fallback if the API fails; success and error states shown. Test send needs owner approval. |
| SEC-05 | Analytics and consent | If analytics is added, it is cookieless/no-storage or behind consent; privacy and cookie pages describe exactly what runs (today: no cookies, no storage, no banner). |
| SEC-06 | Secrets | No API keys or tokens in `dist/`, git history or client bundle (`grep -ri "key\|secret\|token" dist`); env vars only in Vercel. |
| SEC-07 | Icons and manifest | `favicon.svg` plus a PNG/ICO fallback, `apple-touch-icon` 180x180, `theme-color` meta; web manifest optional (N/A unless PWA wanted). |
| SEC-08 | Legal pages | Privacy policy, terms and cookie policy present, linked from every footer, and approved (CP-10). Company identity (CIN, registered address) shown where Indian law expects it. |
| SEC-09 | Error pages | `404.html` served by Vercel for unknown routes; API errors do not leak stack traces. |
| SEC-10 | Dependencies | `npm audit --omit=dev` shows no high/critical issues in shipped code. |
| SEC-11 | Gates | `npm run validate` and `npm run build` pass on the release commit (house rule). |
| SEC-12 | Browsers | Latest Chrome, Safari (macOS + iOS), Firefox and Edge, plus Samsung Internet on Android: no broken layout, WebGL falls back cleanly. |

## 9. GEO / AI visibility (GEO)

| id | What to check | Pass condition |
| --- | --- | --- |
| GEO-01 | `llms.txt` | Served at `/llms.txt` (200, `text/plain`), describes the company, services, countries and links to key pages with absolute URLs; facts match CP-06. |
| GEO-02 | Crawlable HTML | `curl` of each page (no JS) returns the H1, main copy and links. |
| GEO-03 | AI crawlers allowed | `robots.txt` allows the named AI search bots (already done); no CDN/bot-protection rule blocks them. |
| GEO-04 | Answerable passages | Services, systems, pricing and FAQ pages have short passages that answer one question each with concrete facts (what, for whom, cost range, timeline, location). |
| GEO-05 | Entity consistency | Name, address, phone and services identical across site, JSON-LD, `llms.txt`, Google Business Profile and LinkedIn (off-site items: owner action). |

---

## Definition of done

Launch is a go when every item is PASS or N/A, and every NEEDS-APPROVAL item has a written decision from the owner.
Any FAIL in RL-01, SEO-03, SEO-09, SEO-12, OG-05, A11Y-01, A11Y-05, SEC-04, SEC-06 or SEC-11 is a launch blocker.
After launch: watch Search Console and CrUX for 28 days and re-run PERF-01 to PERF-03 on field data.
