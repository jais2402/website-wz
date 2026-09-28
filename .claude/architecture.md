# architecture.md — stack, data flow, infrastructure

Verified against primary sources on 28 September 2026. Versions below are the
current majors; pin exact versions in `package.json` and bump deliberately.

---

## 1. Stack

| Layer | Choice | Version | Why |
|---|---|---|---|
| Framework | **Next.js**, App Router, static export | 16.3.x | Static export removes a server from the threat surface and the bill; App Router is the default router. Turbopack is the default bundler in 16 — a custom webpack config fails the build unless `--webpack` is passed |
| UI runtime | **React** | 19.3.x | Required by Next 16; R3F 9 peer range is `>=19 <19.4`, so do **not** move to 19.4 without checking R3F |
| Language | **TypeScript** | 5.7+ | `strict: true`, no `any` in `src/` |
| Styling | **Tailwind CSS** | 4.3.x | CSS-first `@theme`; tokens become both utilities and custom properties |
| 3D | **three.js** + **@react-three/fiber** + **@react-three/drei** | r186 / 9.8.x / 10.7.x | R3F 9 is the React 19 line |
| Scroll | Native scroll + `IntersectionObserver` + a single rAF loop | — | No scroll-hijacking library. The 3D reads scroll; it never drives it |
| Content | **JSON** (`content/site.json`) validated against a JSON Schema | — | One file, typed, no CMS until there is a reason |
| Forms | Progressive: a static POST endpoint (Formspree-class) or a serverless function on the host | — | Static export has no server. See §6 |
| Tests | **Vitest** (unit), **Playwright** (e2e + visual), **@axe-core/playwright** (a11y) | current | See `standards.md` §5 |
| Host | Any static host with header control (Cloudflare Pages / Netlify / S3+CloudFront) | — | Headers are required, see §7 |

**Node ≥ 20.9** (Next 16 minimum). Browser floor: Chrome/Edge/Firefox 111+, Safari 16.4+.

---

## 2. Repository layout

```
.claude/            architecture · design · context · standards · agents/
content/            site.json (all copy) + schema/site.schema.json
public/             fonts, og images, favicon — nothing generated
src/
  app/              route segments only; no business logic
    layout.tsx      fonts, theme boot, <SceneCanvas/> mount point
    page.tsx        the scroll journey
    work/page.tsx   deep-linkable case studies
    capabilities/   deep-linkable capability + range detail
  components/
    atoms/          no imports from molecules+
    molecules/      composed of atoms only
    organisms/      sections; own their layout, not their data
    templates/      page shells; receive content, place organisms
    three/          scene graph, states, materials, callout projection
  lib/              content loader, scroll store, hooks, utils
  styles/           tokens.css, globals.css
  types/            content.ts (generated from the schema)
tests/              unit · e2e · a11y
tasks.md            roadmap and checklists
journal.md          decisions, dated, append-only
```

**Import direction is enforced** (ESLint `no-restricted-imports`):
`atoms → molecules → organisms → templates → app`. Never upward. Only `app/` and
`templates/` may touch the content module.

---

## 3. Data flow

```
content/site.json
      │  build time only
      ▼
lib/content.ts ──► zod parse (dev + CI) ──► typed Content object
      │
      ├─► app/page.tsx ──────► SplitScrollTemplate ──► organisms ──► molecules ──► atoms
      ├─► app/work/page.tsx ─► DocumentTemplate
      └─► lib/scene-data.ts ─► three/ (only the fields the scene needs)
```

- The JSON is read at **build time**. No runtime fetch, no hydration cost.
- `zod` parses it in dev and CI; in production the parse is skipped and the types
  are trusted, because a failing parse would have failed the build.
- **Optional facts render optionally.** `meta.TODO_business_facts.phone === null`
  means the phone component does not mount. Same for testimonials, team, price
  band, certifications. No placeholders reach the DOM — this is the single
  hardest rule in the project (see `context.md` §3).
- Types are generated from the schema: `pnpm content:types`.

---

## 4. The 3D subsystem

```
three/
  SceneCanvas.tsx     <Canvas> wrapper, fixed behind content, aria-hidden
  useScrollState.ts   one rAF loop → {sectionIndex, progress, side, paused}
  states/             one pure function per section → a plain state object
  blend.ts            lerps state A → state B over the boundary band
  Instances.tsx       one InstancedMesh, N=64 rounded boxes
  Callouts.tsx        DOM overlay: dots, leader lines, label column
  materials.ts        palette → linear-space colours, one shared material
```

Rules that keep it inside budget:

- **One InstancedMesh.** Every part of every scene is an instance of the same
  rounded box. Draw calls stay in the low tens; R3F's own guidance is ≤1000 as an
  absolute maximum and "a few hundred or less" as the target.
- **`frameloop="demand"`** plus `invalidate()` on scroll, pointer and theme
  change. An idle page renders nothing.
- **`dpr={[1, 1.75]}`**, clamped further to `1` when `hardwareConcurrency ≤ 4`
  or `deviceMemory ≤ 4`. R3F's default is `[1, 2]`.
- **Never `setState` in `useFrame`.** Mutate refs. State that must reach React
  (the current section name) is throttled and set outside the frame.
- **Geometry and material are created once** and shared; nothing is allocated per
  frame. Colours are pooled `THREE.Color` objects.
- **Fallbacks:** no WebGL → `.no3d` class, canvas unmounted, layout reflows to a
  single column. `prefers-reduced-motion` → states snap, no transitions, no yaw.
- The canvas is decorative. **If a fact only exists in the 3D, it does not exist.**

---

## 5. Routing and pages

| Route | Type | Purpose |
|---|---|---|
| `/` | static | The scroll journey. Anchors: `#build #ai #moment #principles #range #how #pricing #evidence #work #integration #tech #faq #contact` |
| `/work` | static | All case studies, one anchor each (`/work#safety-training`). The link an influencer sends |
| `/capabilities` | static | Eight disciplines + the thirty systems + what a system is made of |
| `/404` | static | — |

Static export constraints that apply here: no middleware/proxy, no `cookies()`
or `headers()`, no Server Actions, no ISR, and `next/image` needs a custom loader
or plain `<img>` with explicit dimensions. Route Handlers are GET-only and must
be `force-static`.

Note for this design: Next 16 no longer overrides `scroll-behavior: smooth`
unless `<html data-scroll-behavior="smooth">` is set — required here.

---

## 6. The contact form

Static export means no server. Two acceptable options; decide in `journal.md`
before building:

- **A — Host function.** Cloudflare Pages Function / Netlify Function at
  `/api/contact`, posting to email + a store. Keeps the domain first-party and
  lets us rate-limit.
- **B — Managed endpoint.** Formspree-class POST. Fastest, but adds a
  third-party origin to the CSP and puts submissions on someone else's system.

Either way: honeypot field, timing check, no PII in analytics, no third-party
script in the form path, and the "replies within one working day" promise must
be true operationally before it ships.

---

## 7. Infrastructure

```
git push ──► CI (typecheck · lint · unit · build · Lighthouse CI · axe · Playwright)
        └─► static host ──► CDN (immutable assets, 1y) ──► browser
```

- `out/` is the build artifact. Assets are content-hashed and cached
  `public, max-age=31536000, immutable`; HTML is `no-cache, must-revalidate`.
- **Security headers** (host config, since there is no server):
  `Content-Security-Policy`, `Strict-Transport-Security`,
  `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`,
  `Permissions-Policy` (deny camera/mic/geolocation), `Cross-Origin-Opener-Policy`.
  Exact policy in `standards.md` §4.
- Fonts are **self-hosted** in `public/fonts` (woff2, `font-display: swap`,
  preloaded). No Google Fonts request: it costs a third-party connection, a CSP
  entry and a privacy question.
- Analytics: privacy-first, cookieless, self-hostable. No consent banner needed
  if nothing is stored on the device — confirm before adding anything else.

---

## 8. Performance budget

Enforced in CI. Derived from the 2026 performance-inequality baseline
(9 Mbps / 100 ms RTT, mid-tier Android) and Core Web Vitals thresholds.

| Budget | Limit | Enforced by |
|---|---|---|
| JS transferred, initial route | **≤ 180 KB** gzip (excluding the 3D chunk) | `size-limit` in CI |
| 3D chunk (three + R3F + scene), lazy | ≤ 320 KB gzip, loaded after first paint | dynamic import, CI check |
| Total page weight, first view | ≤ 1.4 MB | Lighthouse CI |
| LCP (p75, mobile) | ≤ 2.5 s | CrUX + Lighthouse CI |
| INP (p75) | ≤ 200 ms | RUM |
| CLS (p75) | ≤ 0.1 | Lighthouse CI |
| Long tasks during scroll | none > 50 ms | Playwright trace |

The 3D canvas is **never** in the critical path: it mounts after first paint,
behind `content-visibility`, and the page is complete and readable without it.

---

## 9. Decisions still open

Record each in `journal.md` when settled.

1. Form transport — option A or B (§6).
2. Host — Cloudflare Pages vs Netlify (header syntax differs).
3. Analytics vendor.
4. Whether `/work` case studies become MDX per case when a fifth case lands.
5. When the business facts arrive (price band, clients, team), whether `/about`
   and `/pricing` become routes or sections.
