# standards.md — the bar, and how it is checked

Nothing merges that fails a gate in §7. Facts verified 28 September 2026 with
sources; where a claim could not be verified it says so rather than guessing.

---

## 1. Code quality

**TypeScript**
- `strict: true`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`.
- `any` is banned in `src/`. `unknown` + a narrow is the answer.
- Props are explicit interfaces, exported next to the component.
- No default exports except Next's required `page.tsx` / `layout.tsx`.

**React**
- Server Components by default. `"use client"` only where there is state, an
  event handler or a browser API — and it goes on the smallest possible leaf.
- No `useEffect` for anything derivable during render.
- Event handlers are named `onThing`; booleans read `isX` / `hasX`.
- Lists need stable keys from the content, never the array index.

**Components**
- One component per file, named after the file.
- Atomic import direction is enforced by ESLint: `atoms → molecules → organisms
  → templates → app`. Never upward, never sideways between siblings.
- A component that needs more than 5 props probably wants a sub-component or an
  object prop.
- No component reads `content/site.json` directly below `templates/`.

**Styling**
- Tailwind utilities only. No CSS modules, no inline `style` except for values
  computed at runtime (3D callout positions).
- No hard-coded hex, px font-size, or arbitrary value that duplicates a token.
- Class order is enforced by `prettier-plugin-tailwindcss`.

**Naming and files**
- Components `PascalCase.tsx`; hooks `useThing.ts`; utilities `kebab-case.ts`.
- Anchor ids match `content/site.json` section ids exactly — they are public URLs.

**Commits** — Conventional Commits. `feat|fix|perf|a11y|refactor|docs|test|chore`,
scope = atomic level or route, e.g. `feat(organisms): sequence section`.

---

## 2. Accessibility — WCAG 2.2 level AA

Current standard is **WCAG 2.2** (W3C Recommendation, Oct 2023, updated Dec 2024);
WCAG 3.0 is an early draft and not a target.
<https://www.w3.org/WAI/standards-guidelines/wcag/>

**Criteria this design touches most**

| SC | Level | Requirement | Our rule |
|---|---|---|---|
| 1.4.3 Contrast (Minimum) | AA | Text 4.5:1, large text 3:1 | Enforced by token pairs; checked in CI |
| 1.4.11 Non-text Contrast | AA | UI components and meaningful graphics 3:1 | Swatches, borders, focus rings |
| 2.4.11 Focus Not Obscured (Min) | AA | Focused element not entirely hidden by author content | `scroll-margin-top` clears the sticky header on every focusable |
| 2.5.7 Dragging Movements | AA | No drag-only operation | The testimonial swipe always has buttons |
| 2.5.8 Target Size (Minimum) | AA | ≥ 24×24 CSS px | We use ≥ 40px; chips get padding, not just a hit area |
| 3.2.6 Consistent Help | A | Help in the same relative place | Contact link is in the header on every page |
| 3.3.7 Redundant Entry | A | Don't re-ask for what was entered | Topic chip pre-fills the form subject |

New in 2.2 and *not* required at AA: 2.4.13 Focus Appearance is AAA. 4.1.1
Parsing is obsolete and removed.
<https://www.w3.org/TR/WCAG22/>

**Non-negotiables**
- Semantic landmarks: one `<h1>` per page, ordered headings, `<main>`, `<nav>`,
  `<footer>`, `<section aria-labelledby>`.
- Keyboard: every interactive reachable and operable; visible focus at all times;
  no keyboard trap; skip-link first in the tab order.
- The 3D canvas is `aria-hidden="true"` and non-focusable. Everything it shows
  also exists as text.
- `prefers-reduced-motion: reduce` removes transitions and ambient motion; the
  pause control is an explicit alternative and persists.
  <https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion>
- Form fields have real `<label>`s; errors are text, associated with the field,
  and announced; never colour-only.
- Zoom to 400% at 320px width with no loss of content or horizontal scroll.
- `lang` set; page titles unique and descriptive.

**Legal note.** The European Accessibility Act (Directive (EU) 2019/882) has
applied since **28 June 2025**; it targets consumer-facing e-commerce services
rather than every brochure site, with microenterprise exemptions and transitional
periods to 2030. A marketing site with a contact form is unlikely to be in scope,
but AA is the bar regardless.
<https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32019L0882>

---

## 3. Performance

**Core Web Vitals** remain LCP, INP, CLS, assessed at the **75th percentile**,
mobile and desktop separately. <https://web.dev/articles/vitals>

| Metric | Good | Our gate |
|---|---|---|
| LCP | ≤ 2.5 s | ≤ 2.0 s in Lighthouse CI (mobile profile) |
| INP | ≤ 200 ms | ≤ 150 ms |
| CLS | ≤ 0.1 | ≤ 0.05 |

**Budgets** (see `architecture.md` §8): ≤180 KB JS on the initial route excluding
the lazily-loaded 3D chunk, ≤320 KB for the 3D chunk, ≤1.4 MB first view. These
sit inside the 2026 performance-inequality guidance for a 9 Mbps / 100 ms
baseline device. <https://infrequently.org/2025/11/performance-inequality-gap-2026/>

**Rules**
- Fonts self-hosted woff2, preloaded, `font-display: swap`, subset to Latin.
- Images: explicit `width`/`height`, modern formats, lazy below the fold.
- The 3D bundle is dynamically imported after first paint and behind a
  capability check.
- No third-party script in the critical path. Every addition needs a line in
  `journal.md` saying what it costs.
- Animate `transform` and `opacity` only. No layout-triggering animation.
- `content-visibility: auto` on long off-screen sections.

**3D specifics** — one `InstancedMesh`, shared geometry and material,
`frameloop="demand"`, `dpr={[1,1.75]}`, no allocation in `useFrame`, no
`setState` in `useFrame`, `visible` toggling instead of mount/unmount.
R3F's own guidance: keep draw calls well under 1000, "optimally a few hundred or
less". <https://r3f.docs.pmnd.rs/advanced/scaling-performance>

---

## 4. Security

Static site, no database, one form. The realistic threats are supply chain,
injected third-party script, form abuse, and header misconfiguration.

**Headers** (set at the host; there is no server):

```
Content-Security-Policy: default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';        # Tailwind emits no inline <script>; review if this can drop
  img-src 'self' data:;
  font-src 'self';
  connect-src 'self' <form-endpoint> <analytics>;
  frame-ancestors 'none'; base-uri 'self'; form-action 'self' <form-endpoint>;
  object-src 'none'; upgrade-insecure-requests
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-origin
```

CSP is reported before it is enforced: ship `Content-Security-Policy-Report-Only`
for one week, read the reports, then enforce.

**Supply chain**
- Lockfile committed; `npm ci` in CI, never `npm install`.
- Dependencies pinned to exact versions. A new dependency needs a journal entry:
  what it does, its weight, and what it replaces.
- `npm audit --audit-level=high` and a Dependabot/Renovate schedule.
- No postinstall scripts from transitive dependencies without review.

**Form**
- Honeypot + minimum time-to-submit; rate limit at the edge.
- Validate and length-cap every field on the receiving side; never trust the client.
- Escape on output; the success state prints no user input back to the page.
- No PII in analytics, logs or URLs. Submissions go to one inbox with a retention
  rule, not to a spreadsheet that outlives its purpose.

**Content**
- No `dangerouslySetInnerHTML`. If rich text ever arrives, sanitise server-side
  at build time and whitelist tags.
- `rel="noopener noreferrer"` on every external link.
- Secrets live in the host's env. `.env.example` documents names only. Nothing
  prefixed `NEXT_PUBLIC_` is a secret, by definition.

---

## 5. Testing

| Layer | Tool | What it covers | Gate |
|---|---|---|---|
| Types | `tsc --noEmit` | whole repo | zero errors |
| Lint | ESLint + Prettier | rules above, import direction | zero errors |
| Content | zod parse of `site.json` | schema, required fields, no `[placeholder]` strings | passes |
| Unit | Vitest + Testing Library | atoms, molecules, `lib/` pure functions | ≥ 80% on `lib/`, every atom rendered |
| Integration | Vitest | organisms with real content fixtures | key sections render from JSON |
| E2E | Playwright (chromium, webkit, mobile chrome) | nav, sequences, form, deep links, theme, reduced motion, no-WebGL | all pass |
| A11y | `@axe-core/playwright` on every route, light + dark | zero serious/critical violations | hard gate |
| Visual | Playwright screenshots, 1512 / 1280 / 390 | section-level diffs | reviewed, not auto-merged |
| Perf | Lighthouse CI | budgets in §3 | fails the build if exceeded |

**Manual checklist before any release** — see `tasks.md` § Release checklist.

**Rules.** A bug fix ships with the test that would have caught it. Tests assert
what the user sees, not implementation detail. No test depends on network or on
`content/site.json` being a particular length.

---

## 6. Content discipline

- **`content/site.json` is the only source of copy.** No string literal in a
  component that a visitor can read.
- A CI check fails the build on `[`…`]` placeholder patterns, `Lorem`, `TODO:` or
  `TBD` anywhere in the content file's rendered fields.
- Optional facts are `null`, never a placeholder. A `null` renders nothing.
- Copy changes follow `context.md` §8 tone rules and keep the two owned phrases
  intact.

---

## 7. Definition of Done

A change is done when **all** of these are true:

- [ ] Types pass, lint passes, no new `any`
- [ ] Unit + integration tests written and passing
- [ ] Playwright e2e green on chromium, webkit and mobile chrome
- [ ] axe reports zero serious/critical on every affected route, light and dark
- [ ] Keyboard-only pass done by hand on the affected flow
- [ ] `prefers-reduced-motion` and no-WebGL paths both verified
- [ ] Lighthouse CI within budget; JS budget not exceeded
- [ ] Copy comes from `content/site.json` and contains no placeholder
- [ ] Works at 320px, 390px, 768px, 1280px, 1512px with no horizontal scroll
- [ ] Light and dark both checked
- [ ] `journal.md` updated — an entry for any decision made, **and a session
      close-out entry before the session ends**
- [ ] `tasks.md` checkbox ticked

---

## 8. Review roles

Every PR gets the relevant agent's checklist run against it — see
`.claude/agents/`. Minimum: **Test Engineer** on any behaviour change,
**Security Engineer** on any dependency, header, or form change, **Designer** on
any visual change, **3D Engineer** on any change under `src/components/three/`.
