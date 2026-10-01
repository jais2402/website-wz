# Wezigns — website

Custom software, built around how your business already works.
A static Next.js site with an interactive 3D system sculpture, premium editorial
layouts, and content informed by the company’s existing positioning study.

---

## Quick start

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm verify       # types, lint, content, unit tests, build, size budget
```

Node ≥ 20.9 required (Next 16). Turbopack is the default bundler — do not add a
webpack config. In environments that block Turbopack worker ports, use
`pnpm content:llms && pnpm exec next build --webpack` to verify the static export.

---

## Where things are

```
.claude/                AI + team context. Read these before changing anything.
  architecture.md       stack, data flow, 3D subsystem, infrastructure, budgets
  design.md             tokens, Tailwind v4 theme map, layout, atomic inventory, 3D rules
  context.md            business goals, audiences, study findings, CTA strategy
  standards.md          code, accessibility, performance, security, testing, DoD
  agents/               seven role definitions, each with its own checklist
content/
  site.json             every word a visitor can read — the single source of copy
  schema/               JSON Schema the content is validated against
src/
  app/                  routes only: /, /work, /capabilities
  components/
    atoms/              buttons, swatches, eyebrows — no imports from above
    molecules/          composed of atoms
    organisms/          sections; own their layout, not their data
    templates/          page shells
    three/              the WebGL scene (see its README for the contract)
  lib/                  content loader, hooks, utilities
  styles/               tokens.css (the @theme block), globals.css
  types/                content types, generated from the schema
tests/                  unit · e2e · a11y
tasks.md                roadmap and checklists — what is being built, by whom
journal.md              decisions and completed work, dated, append-only
```

---

## The five rules that matter most

1. **No placeholder ever ships.** Optional facts are `null` in `content/site.json`
   and render nothing. CI fails the build on bracketed text, `Lorem`, `TODO:` or
   `TBD`. In the study, visible `[Client name]` placeholders were named by 56 of
   80 users and poisoned belief in the real numbers.
2. **Content enters at the page.** Nothing below `templates/` imports
   `content/site.json`. ESLint enforces it.
3. **Imports travel upward only.** `atoms → molecules → organisms → templates →
   app`. ESLint enforces that too.
4. **The 3D is never in the critical path.** Lazy chunk, `frameloop="demand"`,
   `aria-hidden`, four tested fallbacks. Every fact it shows also exists as text.
5. **Phones get no scroll-gating.** Content uses direct, keyboard-accessible
   controls. Nothing depends on hover or a timed scroll sequence.

---

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Dev server |
| `pnpm build` | Static export to `out/` |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | ESLint, zero warnings allowed |
| `pnpm content:validate` | Schema + placeholder + anchor checks |
| `pnpm content:types` | Regenerate `src/types/content.ts` from the schema |
| `pnpm test` | Vitest unit and integration |
| `pnpm test:e2e` | Playwright: chromium, webkit, mobile chrome |
| `pnpm test:a11y` | axe on every route, light and dark |
| `pnpm size` | JS budget check |
| `pnpm lhci` | Lighthouse CI against the budgets |
| `pnpm verify` | Everything a PR must pass |

---

## Editing content

Business content lives in `content/site.json`. The redesigned homepage composes
it in `src/components/templates/PremiumHome.tsx`, with editorial labels there.
Its styles live in `src/styles/premium.css`; the lazy 3D scene is
`src/components/three/SystemSculpture.tsx`. Edit business content and run
`pnpm content:validate`. Two phrases are measured brand assets — **"Tell us what is not
working"** and **"…the moment when the business outgrows the workaround"** — and
should not be reworded without a study-grade reason. Tone rules are in
`.claude/context.md` §8.

Five facts are still missing and are the largest remaining lever on enquiries:
a price band, a named client, a team page, a phone number, and the security
position. Each has a `null` slot in `meta.TODO_business_facts`; fill the slot and
the matching component appears. See `tasks.md` § Blocked.

---

## Working with the agents

`.claude/agents/` defines seven roles, each with a checklist a PR is measured
against:

| Agent | Use it for |
|---|---|
| `3d-engineer` | anything under `src/components/three`, WebGL budgets, jank |
| `designer` | visual change, tokens, layout, hierarchy, cognitive load |
| `test-engineer` | test design, coverage, the release checklist, merge gates |
| `security-engineer` | headers, CSP, dependencies, the form, vendor questions |
| `product-manager` | scope, specs, sequencing, what waits |
| `research-analyst` | studies, findings, sizing a change, competitive evidence |
| `ceo` | trade-offs, commitments the company makes, the five missing facts |

Minimum review: Test Engineer on behaviour, Security on dependencies or headers,
Designer on visuals, 3D Engineer on the scene.

---

## Definition of Done

In `.claude/standards.md` §7. Short version: types and lint clean, tests written
and green, axe clean on every affected route in both themes, keyboard pass done
by hand, reduced-motion and no-WebGL paths verified, inside the performance
budget, no placeholder copy, works from 320px up, `journal.md` updated.

## Local preview and enquiry delivery

Run `pnpm dev --hostname 127.0.0.1 --port 3000` and open
`http://127.0.0.1:3000`. The preview remains local.

The homepage and contact page validate enquiries and prepare a `mailto:` draft
for the visitor to review and send using their email app. There is no server
delivery endpoint configured. Ambient 3D motion respects reduced-motion
preferences and the persistent pause button; without WebGL, a CSS sculpture
keeps the hero complete.

## Homepage refinement audit

See `docs/design-audit.md` for the typography scale, resolved browser comments,
light/dark accessibility checks, asset provenance, and remaining mobile loading
findings. Delivery stages follow scrolling while retaining direct navigation.
The original interactive 3D hero is restored, with separate case-study,
capabilities, integration, delivery, and contact sections. The larger
“Across your business” scroll journey remains. Mobile initially shows the
abstract artwork and loads live WebGL when the visitor explores the system.
See `docs/scroll-journey.md` for the current restoration notes.

## Local 3D refinements

Case cards are horizontal on desktop with live WebGL sculptures. Simplify,
Scale, and Secure sit below the hero with individual models. Capabilities and
integration have live models; FAQ answers animate open and closed; pricing
has a larger panel. Section models load near the viewport and respect pause
and reduced motion. See `docs/3d-refinements.md` for implementation and checks.


The capability journey has four areas (Build, Connect, AI, Run), with a sticky
heading and a native scroll runway on larger screens. Mobile keeps every
chapter in document flow. Delivery assembles a cube from foundation to finish;
integration visualises selected connections with flowing signals. Each case
has distinct local geometry and fallback artwork. Section WebGL contexts are
released offscreen; motion and reduced-motion preferences remain respected.
