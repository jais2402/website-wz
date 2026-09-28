# Wezigns — website

Custom software, built around how your business already works.
A static Next.js site with a scroll-driven WebGL scene, built to an atomic
design system, from a design direction validated with a 200-user study.

---

## Quick start

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm verify       # types, lint, content, unit tests, build, size budget
```

Node ≥ 20.9 required (Next 16). Turbopack is the default bundler — do not add a
webpack config.

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
5. **Phones get no scroll-gating.** Below 1000px every list is open, nothing
   depends on hover.

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

All copy lives in `content/site.json`. Edit it, run `pnpm content:validate`, and
the site follows. Two phrases are measured brand assets — **"Tell us what is not
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
