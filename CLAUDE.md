# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

Immersive marketing site for **Wezigns Software Private Limited** (Chennai), a custom-software studio.
The brief: immersive and "wow" at the level of tines.com, clay.com, triptych.co and atlasmotion.com. The page must
never feel empty or template-like. Copy is sourced from the client's current site (website-wz.vercel.app).

Brand story: _"Systems that grow with you."_ Told in one visual language, **threads**: tangled threads pulled
through a glowing loom (hero), then the same threads weave into **Simplify** (a woven panel) → **Scale** (a lattice
cone that widens as it rises) → **Secure** (a woven sphere round a glowing core), and the sphere hands off to a
**globe** with gold threads from Chennai to the 11 countries served.

## Pages (Vite multi-page)

- `index.html` → `src/main.tsx` → `App.tsx`: **the final site.** Section order: time-loom hero (`loom/hero.tsx`)
  → weave in/out → thread story (Simplify / Scale / Secure) → tools + stats → services → systems explorer →
  before/after slider (`loom/sections.tsx`) → AI demo → work → process → pricing (`components/Pricing.tsx`) →
  integrations → countries globe
  (`components/Countries.tsx`) → FAQ → loom-style contact
  (`LoomContact`) → footer. `main.tsx` imports both `index.css` and `loom/loom.css`.
- `contact.html` → `src/contact/main.tsx` → `ContactPage.tsx`: `/contact` (clean URL in dev, preview and Vercel).
  Address, phone and email cards, the enquiry form (`ContactForm`, sending switchable in `lib/enquiry.ts`), and the
  loom from the hero beside the headline (`ContactLoom` → `LoomScene view="contact"`, SVG art in lite mode).
- `about.html`, `ai.html`, `technology.html`, `404.html` (Vercel serves it for unknown URLs), `systems/{people,revenue,operations,ecommerce,finance,industry}.html` → one entry,
  `src/pages/main.tsx`, which picks the page from `<body data-page>` (`PageRouter.tsx`). Shared shell, hero, section
  and CTA in `src/pages/shell.tsx` + `pages.css`; each page has its own folder and prefixed CSS (`ab-`, `aip-`, `sy-`).
  Every hero has a visual: the 3D loom (`pages/HeroLoom.tsx`, About and 404), the live dashboard (systems), the
  animated SVG (AI), the CSS 3D layer stack (`technology/StackVisual.tsx`). Their copy is in `src/content/pages.ts` (Technology copy and `stack` are in `site.ts`). System pages print as
  a one-page summary (`src/pages/print.css` + print rules in `system.css`).
- `api/enquiry.ts`: Vercel Function that emails enquiries through Resend (`RESEND_API_KEY`, see
  `docs/enquiry-setup.md`). Without it (e.g. `npm run dev`), both forms fall back to mailto. Adding a page = an `.html` file + an entry in `INPUTS` in `vite.config.ts`.
- `loom.html` → `src/loom/main.tsx`: the original concept-B page, kept **internal only** (not linked from the
  site). Both entries are listed in `build.rolldownOptions.input` in `vite.config.ts`.
- The loom visuals are original, inspired by a reference image the client shared: never use Marvel/Loki names or
  assets anywhere. The look is recognisable, so flag it in client reviews (see `docs/concept-study.md`).
- Unused alternates kept for reference: `components/Hero.tsx` (particle hero) and `components/Contact.tsx`
  (contact over the particle globe). They are not rendered.
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
                         centre → beside the proof headline. Anchor maths in lib/guide.ts; the 3D scenes publish
                         screen positions (loomStore.mouth, sceneStore.core). Desktop only, off in lite mode.
  hooks/motion.ts      ← GSAP/ScrollTrigger registration, Lenis, scrollToTarget(), reduced-motion
  hooks/useCountUp.ts  ← count-up numbers (instant under reduced motion)
  components/Areas.tsx ← systems explorer: pins on desktop, scroll steps through the 5 systems; data + chart
                         kinds live in `areas` in content/site.ts (numbers there are illustrative demo data)
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
- Every effect must respect `prefers-reduced-motion` (Lenis is disabled, the preloader is skipped, CSS animations stop).
- Desktop-only effects (horizontal service pin, cursor ring, pointer repulsion) are gated by `gsap.matchMedia`
  or `(pointer: fine)`.

## Design system

- Colours (tokens in `:root`): ink `#07070c` background, **accent blue `#4d9fff`** (token still named `--lime`
  for history; light blue `#8cc4ff` replaced the old gold), primary CTA blue gradient `--cta-1/2/3`, violet
  `#8b7bff`, coral `#ff7a59`, cream `#f2efe6` for the single light section (AI demo). No yellow/lime in UI text,
  icons or symbols. The 3D threads (loom hero, story) keep their multicolour / gold palette.
- Type: Inter Tight (display, tight negative tracking), Inter (body), Instrument Serif italic (accent words),
  JetBrains Mono (uppercase labels).
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
   services pin, systems explorer, before/after, AI demo, countries globe, contact.
