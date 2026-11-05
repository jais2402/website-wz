# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

Immersive marketing site for **Wezigns** (Chennai), a custom-software studio.
The brief: immersive and "wow" at the level of tines.com, clay.com, triptych.co and atlasmotion.com. The page must
never feel empty or template-like. Copy is sourced from the client's current site (website-wz.vercel.app).

Brand story: _"Systems that grow with you."_ Told in one visual language, **threads**: tangled threads pulled
through a glowing loom (hero), then the same threads weave into **Simplify** (a woven panel) → **Scale** (a lattice
cone that widens as it rises) → **Secure** (a woven sphere round a glowing core), and the sphere hands off to a
**globe** with gold threads from Chennai to the 11 countries served.

## Pages (Vite multi-page)

- `index.html` → `src/main.tsx` → `App.tsx`: **the final site.** Section order: time-loom hero (`loom/hero.tsx`)
  → weave in/out → thread story (Simplify / Scale / Secure) → tools + stats → what we build (`Offer.tsx`) →
  systems explorer → AI demo → work → pricing (`components/Pricing.tsx`, also the only telling of the four stages:
  Understand → Shape → price agreed → Build → Run) → integrations → countries globe
  (`components/Countries.tsx`) → FAQ → loom-style contact
  (`LoomContact`) → footer. `main.tsx` imports both `index.css` and `loom/loom.css`.
- `contact-us.html` → `src/contact/main.tsx` → `ContactPage.tsx`: `/contact-us` (clean URL in dev, preview and Vercel).
  Pages keep the old wezigns.com slugs (`/contact-us`, `/about-us`, `/our-services`) so those URLs need no redirect.
  Address, phone and email cards, the enquiry form (`ContactForm`, sending switchable in `lib/enquiry.ts`), and the
  loom from the hero beside the headline (`ContactLoom` → `LoomScene view="contact"`).
- `about-us.html`, `our-services.html` (systems overview), `ai.html`, `technology.html`, `privacy-policy.html`,
  `terms-and-conditions.html`, `cookie-policy.html` (legal copy in `src/content/legal.ts`, drafts for
  legal review, see `docs/legal/research.md`; GA4 loads only after the cookie banner's Accept, see `docs/analytics.md`), `portfolio.html` (`/portfolio`, all case studies + earlier systems), `404.html` (Vercel serves it for unknown URLs; it names the missing address, offers the closest page from
  `notFoundPage.suggest` via `lib/notFound.ts`, and reports `page_not_found` to GA after consent), `website-development.html`
  (`/website-development`, `src/pages/website/`, copy `websitePage` in pages.ts), `systems/{people,revenue,operations,ecommerce,finance,industry}.html` → one entry,
  `src/pages/main.tsx`, which picks the page from `<body data-page>` (`PageRouter.tsx`). There is no HTML sitemap:
  `/sitemap.xml` (and `llms.txt`) are generated at build by `scripts/vite-seo.ts` from `src/content/seo.ts`; the
  footer's "Sitemap" link points to it and `/sitemap` redirects there (`vercel.json`). Shared shell, hero, section
  and CTA in `src/pages/shell.tsx` + `pages.css`; each page has its own folder and prefixed CSS (`ab-`, `aip-`, `sy-`).
  Every `PageSection` gets a light pool + dot field (`.pg-glow`), a numbered thread-and-knot mark that draws in on
  entry (`SectionMark`, CSS counter) and `is-on`/`is-in` classes; cards opt in to a pointer spotlight with `data-spot`
  (`data-spot="tilt"` also tilts; not on `data-reveal` elements, GSAP owns their transform). Small list glyphs:
  `src/pages/glyphs.tsx` (order per list in `glyphNames.ts`).
  Every hero has a visual: a 3D loom variant (`pages/HeroLoom.tsx` → `LoomScene variant`: `classic` for contact,
  `spindle` (diagonal, blue, orbit rings) for About, `frayed` (broken, coral) for 404), the live dashboard (systems), the
  AI chat window (AI, a CSS 3D stage looping on the timeline in `lib/aiHero.ts`), the CSS 3D layer stack (`technology/StackVisual.tsx`). Their copy is in `src/content/pages.ts` (Technology copy and `stack` are in `site.ts`; each system page's tool groups are in `src/content/systemTools.ts`, research in `docs/tools-research.md`). System pages print as
  a one-page summary (`src/pages/print.css` + print rules in `system.css`).
- `api/enquiry.ts`: Vercel Function that emails enquiries through Resend and adds each one as a row in a Google Sheet
  (`api/_sheets.ts`, `GOOGLE_SHEETS_*` / `GOOGLE_SHEET_*`; success when either took it). `npm run dev` serves it from
  `.env.local` (`scripts/vite-enquiry-dev.ts`). Resend: `RESEND_API_KEY`, see
  `docs/enquiry-setup.md`). Without it (e.g. `npm run dev`), both forms fall back to mailto. Adding a page = an `.html` file + an entry in `INPUTS` in `vite.config.ts`.
- Load order (Lighthouse work): each entry (`src/main.tsx`, `src/pages/main.tsx`, `src/contact/main.tsx`) is tiny and
  imports its app (`boot.tsx` next to it) only once the first content is on screen (`lib/afterFirstPaint.ts`). The
  build prerenders the inner pages and contact into `#root` (`scripts/vite-prerender.ts` → `scripts/prerender.mjs`,
  React `renderToString` inside jsdom, no hydration: createRoot replaces it with the same markup), makes their page
  CSS real stylesheets and lists their app chunks in `<body data-modulepreload>` to fetch after that paint. The home
  page is not prerendered (its HTML preloader is the first paint). A page component must render in jsdom without
  WebGL or layout; a page that fails is shipped without a prerender (warning in the build log).
- `loom.html` → `src/loom/main.tsx`: the original concept-B page, kept **internal only** (not linked from the
  site). Both entries are listed in `build.rolldownOptions.input` in `vite.config.ts`.
- The loom visuals are original, inspired by a reference image the client shared: never use Marvel/Loki names or
  assets anywhere. The look is recognisable, so flag it in client reviews (see `docs/concept-study.md`).
- Unused alternates kept for reference: `components/Hero.tsx` (particle hero) and `components/Contact.tsx`
  (contact over the particle globe). They are not rendered.
- The home preloader waits for `homeGate` (`lib/loadGate.ts`): fonts, window load, and both canvases reporting via
  `scene/Warmup.tsx` (shaders compiled + first frames drawn). It opens after 12 s regardless.
- Machines that can't run the live loom (no WebGL, a software renderer, or a GPU that fails the frame test or
  drops under ~25 fps: `gfx/gfxMode.ts`, `gfx/frameTest.ts`; `?gfx=live|poster|auto` forces it) get the 2D
  "chaos to system" hero instead (`loom/ChaosHero.tsx`, Before/After style: tangle + problem cards → one glowing knot → a single line into the "after" dashboard, `loom/SystemApp.tsx`, shared with the slider; maths in `lib/chaos.ts`, cards in `loom.chaos`
  in site.ts), the lighter story scene, and no blur or moving grain (`html[data-gfx]` in index.css). A testing
  badge (`?badge=1`, on by default in dev and preview) shows which version a device gets.
  `lib/webgl.ts` checks whether a WebGL context can be created; without one the 3D scenes are not mounted
  and the home preloader does not wait for them. One WebGL canvas at a time
  (`lib/canvasSlot.ts`). `npm run build && npm run perf:audit` measures frame rates with the GPU and with SwiftShader.
- 3D render budget (`lib/render.ts`, `hooks/useBudgetDpr.ts`): each canvas renders at most ~1.6M pixels and
  the browser scales it up; bloom runs at half resolution. Built for laptops without a dedicated GPU: keep it.
- Two WebGL canvases share the page: the loom hero (in its sticky section) and the fixed canvas (story threads +
  countries globe, with bloom on desktop).
  Each pauses itself when off screen; keep it that way.

## Stack

Vite 8 · React 19 · TypeScript 6 · three.js + @react-three/fiber 9 + drei · GSAP 3 (ScrollTrigger, @gsap/react) ·
Lenis smooth scroll · @react-three/postprocessing (bloom, loom page only) · Vitest + Testing Library (jsdom) · oxlint · Prettier. Plain CSS, no Tailwind.

## Commands

- `npm run dev`: dev server (http://localhost:5173, or `$PORT`). The loom page is at `/loom.html`
- `npm test`: Vitest once (`npm run test:watch` for watch mode)
- `npm run lint`: oxlint
- `npm run typecheck`: `tsc -b`
- `npm run validate`: test + lint + typecheck (run before every commit)
- `npm run build`: typecheck + production build to `dist/`

> The project folder must not contain `#` in its path: Vite (dev, build **and** Vitest) breaks on it.

## Architecture

```
src/
  content/site.ts      ← ALL copy, contact details, countries. Edit text here, never inside components.
  lib/                 ← pure, unit-tested logic (no React/three imports)
    shapes.ts          ← particle morph targets per stage + stageWeights()
    story.ts           ← pinned-story scroll progress → stage (with plateaus)
    sceneStore.ts      ← mutable bridge: ScrollTriggers write, the R3F loop reads
    charts.ts          ← SVG path builders, en-IN number formatting, pinned-explorer index/tab-fill maths
    geo.ts             ← great-circle arcs between lat/lon points, globe facing rotation
    math.ts, enquiry.ts (form validation + send: POST /api/enquiry, mailto fallback), aiSummary.ts
  scene/               ← the single fixed WebGL canvas (lazy-loaded chunk)
    Scene.tsx          ← Canvas, camera rig, pauses rendering when no [data-3d-zone] is on screen
    ThreadField.tsx    ← story threads (760 strands × 130 pts + 4.2k riders desktop; 320 × 90 + 1.6k mobile);
                         GLSL in threadShaders.ts (tangle → weave → helix cone → sphere, shared threadPos())
    Globe.tsx          ← countries globe: dot shell, latitude rings, pins, gold arcs from the HQ (lib/geo.ts)
    Dust.tsx           ← background dust. ParticleField.tsx / Markers.tsx / shaders.ts are the old point-cloud
                         story, kept for reference and not rendered
  components/          ← one file per page section, in page order in App.tsx
  components/GuideLight.tsx ← the loom's white glow travelling with scroll: loom mouth → weave knot → story shape
                         centre → top of the woven tower beside the proof headline (`ProofTower.tsx`, CSS 3D, builds
                         on scroll). Our Work has a thread strung through a knot on every card (`lib/thread.ts`). Anchor maths in lib/guide.ts; the 3D scenes publish
                         screen positions (loomStore.mouth, sceneStore.core). Desktop only, off without WebGL.
  hooks/motion.ts      ← GSAP/ScrollTrigger registration, Lenis, scrollToTarget(), reduced-motion
  hooks/useCountUp.ts  ← count-up numbers (instant under reduced motion)
  components/Areas.tsx ← "The systems we build": six cards (no pin), each a code-drawn scene
                         (`SysArt.tsx`), one sample figure and a link to its system page; data in `areas` in site.ts.
                         Our Work (`Work.tsx`) is a one-screen bento of five cases (`workSection.featured`): a wide lead tile with its results, then 1 + 3 tiles; no CaseArt there (it stays on /portfolio)
  components/Charts.tsx ← mini dashboard charts (line/area/bars/ring/gauge/heatmap/funnel/stack/list/dots)
  loom/                ← The Loom page: LoomPage (sections), LoomScene (threads, particles, loom machine, bloom),
                         shaders.ts (shared strandPos() for threads + particles), store.ts, loom.css
  lib/loom.ts          ← strand/particle buffers + chaosEnvelope() (mirrored in loom/shaders.ts; keep in sync)
  index.css            ← design tokens (:root) + all section styles, organised by section
```

### How the 3D layer works (read before touching scene/ or scroll code)

1. One fixed `<Canvas>` sits behind the page (z-index 0); `main` and `footer` sit above it (z-index 1).
2. Sections marked `data-3d-zone` (Story and Countries) are **transparent** and show the canvas. All other
   sections are opaque `.panel`s that slide over it. When no zone is visible the canvas sets `frameloop="never"`.
3. Scroll → `sceneStore.stage` (0–3) is written by the ScrollTrigger in `Story.tsx`; `ThreadField` damps toward
   it and the shader blends four thread shapes by triangle weights. `sceneStore.globe` (0..1, written by
   `Countries.tsx`) fades the story threads out and the globe in; `sceneStore.highlight` lights a country's arc.
4. **Always mutate uniforms through the live material** (`materialRef.current.uniforms`), never through the
   `useMemo` object. R3F can give the material a different uniforms object, and the GPU then silently stops updating.
5. Never `setState` inside `useFrame`. Never put per-frame values in React state.

### Motion conventions

- GSAP via `useGSAP(() => …, { scope })` so everything auto-reverts on unmount.
- Page-level smooth scroll is Lenis. Use `scrollToTarget()` for in-page links. `window.scrollTo` gets
  overridden by Lenis.
- Every effect must respect `prefers-reduced-motion` (Lenis is disabled, the preloader is a still loader, CSS animations stop).
- Desktop-only effects (horizontal service pin, cursor ring, pointer repulsion) are gated by `gsap.matchMedia`
  or `(pointer: fine)`.

## Positioning and social cards

- Three offerings, everywhere: websites, custom software, software products (the six Systems pages are the product /
  SaaS / MVP offering). The "What we build" block (`components/Offer.tsx`, copy `offer` in site.ts) sits on the home
  page after the stats and on /our-services; `seo.ts` `site.offerings` mirrors it in JSON-LD and llms.txt.
- Social cards (`public/og/<id>.png`, `npm run og`) show each page's hero, read from `src/content/heroes.ts`; seo.ts
  `card` is `heroCard(id)`, which is also the image alt text. Re-run `npm run og` after changing a hero.

## Design system

- Colours (tokens in `:root`): ink `#07070c` background, **accent blue `#4d9fff`** (token still named `--lime`
  for history; light blue `#8cc4ff` replaced the old gold), primary CTA blue gradient `--cta-1/2/3`, violet
  `#8b7bff`, coral `#ff7a59`, cream `#f2efe6` for the light sections (AI demo, What we build, Pricing). No yellow/lime in UI text,
  icons or symbols. The 3D threads (loom hero, story) keep their multicolour / gold palette.
- Type: **Satoshi** (display and body) + **Instrument Serif italic** (accent words, `.serif`, client choice) +
  JetBrains Mono (labels). Self-hosted in `public/fonts` (`src/fonts.css`); Inter stays only as a glyph fallback
  (Satoshi has no ₹). Satoshi sets wider than a condensed face: size big display words to fit their containers.
- Copy that sits over 3D gets a **frosted glass** panel (`.hero-glass`, `.story-copy`, `.loom-intro`, `.glass-card`):
  never put body text straight onto the particles. Don't put `filter`/`opacity < 1` on an ancestor of a glass
  panel while it is visible; that disables `backdrop-filter`.
- All illustrations are code-drawn (CSS/SVG/WebGL). No raster images and no hero video, by client decision.
- Layout must work at 375px with no horizontal scroll. Check the mobile preset after every layout change.

## Workflow

1. Copy changes go in `src/content/site.ts`.
2. Add or extend tests for any new logic in `src/lib/` (co-located `*.test.ts`).
3. Run `npm run validate` and `npm run build` before committing.
4. Check visually in the browser at desktop (1440×900) and mobile (375×812): loom hero, weave, each story step,
   what we build, systems explorer, AI demo, pricing, countries globe, contact.
