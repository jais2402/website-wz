# tasks.md — roadmap and checklist

Single source of truth for what is being built and what is next.
Rules: one owner per task (an agent in `.claude/agents/`), acceptance criteria
before work starts, tick only when the Definition of Done in `standards.md` §7
passes. Decisions go to `journal.md`, not here.

**Status key** — `[ ]` todo · `[~]` in progress · `[x]` done · `[!]` blocked

---

## Phase 0 — Foundation (week 1)

- [x] Project scaffold, `.claude` docs, agent definitions — *PM*
- [x] `content/site.json` extracted from the approved prototype — *PM + Research*
- [x] `content/schema/site.schema.json` + `zod` parse wired into dev and CI — *Test*
- [x] `src/types/content.ts` generated from the schema — *Test*
- [x] Next 16 app scaffolded, `output: 'export'`, Turbopack, TS strict — *3D Eng*
- [x] `src/styles/tokens.css` — every token from `design.md` §1 in `@theme` — *Designer*
- [x] Dark mode: media query + `data-theme` override, boot script, no flash — *Designer*
- [x] Self-hosted Outfit + JetBrains Mono, subset, preloaded — *3D Eng*
- [x] ESLint with the atomic import-direction rule + Prettier + Tailwind class sort — *Test*
- [ ] CI: typecheck, lint, unit, build, Lighthouse CI, axe, size-limit — *Test*
- [x] `<html data-scroll-behavior="smooth">` (Next 16 no longer sets it) — *3D Eng*

**Acceptance:** `pnpm build` produces `out/`, CI green on an empty page, tokens
resolve in both themes, no font flash.

---

## Phase 1 — Atoms and molecules (week 1–2)

- [ ] Atoms: `Button` (primary/secondary/small), `TextLink`, `Swatch`, `Chip`,
      `Eyebrow`, `Figure`, `Rule`, `Icon`, `VisuallyHidden`, `SkipLink` — *Designer*
- [ ] Atoms: `ThemeToggle`, `MotionToggle` (persisted, respects `prefers-reduced-motion`) — *Designer*
- [ ] Molecules: `HeadlineSplit`, `FactRow`, `MetricPair`, `ProofStrip`,
      `StepBlock`, `DisciplineRow`, `AreaAccordion`, `TopicChips`, `Field`,
      `FaqItem`, `CaseTabs` — *Designer*
- [ ] Unit test + a11y assertion for every atom — *Test*
- [ ] Contrast check of every token pair, light and dark — *Designer + Test*

**Acceptance:** every atom renders from props alone, no content import below
`templates/`, axe clean in isolation, 40px minimum targets.

---

## Phase 2 — Organisms and the two templates (week 2–3)

- [ ] `SiteHeader` — sticky, progress bar, nav, theme + motion toggles, CTA — *Designer*
- [ ] `SiteFooter` — CTA block, three columns, large wordmark — *Designer*
- [ ] `SplitScrollTemplate` — the 50/50 alternating layout, `data-side` handling — *Designer*
- [ ] `DocumentTemplate` — `/work` and `/capabilities` shell — *Designer*
- [ ] `HeroSection`, `StatementSection` (with `ProofStrip`), `StepsSection`,
      `FiguresSection`, `FaqSection`, `ContactSection` — *Designer*
- [ ] `SequenceSection` — sticky list, one item open, hover opens, **inert below `lg`** — *Designer + 3D Eng*
- [ ] `CasesSection` — scroll advances the case, tabs jump — *Designer*
- [ ] Integration tests for every organism against real content — *Test*

**Acceptance:** the whole page renders correctly with the canvas switched off,
at 320 / 390 / 768 / 1280 / 1512, light and dark, keyboard only.

---

## Phase 3 — The 3D system (week 3–4)

- [ ] `SceneCanvas` — lazy-mounted after first paint, `aria-hidden`, capability check — *3D Eng*
- [ ] `useScrollState` — one rAF loop, section index + progress + side — *3D Eng*
- [ ] `Instances` — single `InstancedMesh`, N=64 rounded boxes, shared material — *3D Eng*
- [ ] Fifteen scene states as pure functions + boundary blending — *3D Eng*
- [ ] Camera pan per section side; annotation gutter reserved from label widths — *3D Eng*
- [ ] `Callouts` — dots, leader lines, aligned label column, collision handling — *3D Eng*
- [ ] Hue-on-attention: hover and scroll-active drive the highlight — *3D Eng*
- [ ] Fallbacks: no WebGL, reduced motion, low-power, paused — *3D Eng*
- [ ] Performance pass: draw calls, idle renders, DPR, memory over 5 minutes — *3D Eng + Test*
- [x] **Restore the 3D chunk budget in `package.json` size-limit** (≤320 KB) — *Test*

**Acceptance:** zero renders when idle, draw calls under 100, no jank on a
mid-tier Android, all four fallbacks verified, the 3D chunk outside the
critical path.

---

## Phase 4 — Pages, SEO, form (week 4–5)

- [ ] `/` assembled from `content/site.json` — *PM*
- [ ] `/work` — anchors per case, correct order (India case first) — *PM*
- [ ] `/capabilities` — disciplines, the thirty systems, the stack — *PM*
- [ ] Metadata per route: title, description, canonical, OG image — *PM*
- [ ] `sitemap.xml`, `robots.txt`, JSON-LD `Organization` + `WebSite` — *PM*
- [ ] Contact form: endpoint decision (see `architecture.md` §6), honeypot,
      timing check, validation, error and success states — *Security*
- [ ] 404 page — *Designer*

**Acceptance:** every anchor in `site.json` resolves, form delivers end to end,
metadata correct on all routes.

---

## Phase 5 — Hardening and launch (week 5–6)

- [ ] Security headers configured at the host and **verified on the deployed URL** — *Security*
- [ ] CSP report-only for one week, reports read, then enforced — *Security*
- [ ] `npm audit` clean, dependencies pinned, lockfile committed — *Security*
- [ ] Full Playwright matrix: chromium, webkit, mobile chrome — *Test*
- [ ] axe on every route, light and dark, zero serious or critical — *Test*
- [ ] Lighthouse CI within budget on all three routes — *Test*
- [ ] Manual keyboard pass, screen-reader spot check, 400% zoom at 320px — *Test*
- [ ] Analytics live, privacy-first, no PII — *Security + PM*
- [ ] Release checklist in `.claude/agents/test-engineer.md` completed — *Test*
- [ ] Launch decision recorded in `journal.md` — *CEO*

---

## Blocked — waiting on business facts

These are the five levers the 200-user study measured. Each one is a slot in
`content/site.json → meta.TODO_business_facts`; fill the slot and the component
renders itself. **Nothing here ships as a placeholder.**

- [!] **Price band** + whether the Shape stage is paid — ~45 of 200 users — *CEO*
- [!] **Two named clients**, or one reference willing to take a call — ~40 — *CEO*
- [!] **Team page**: founders and leads, faces, tenure, headcount — ~35 — *CEO*
- [!] **Phone number** + WhatsApp for India — ~20 — *CEO*
- [!] **Security position**: certification status or an honest statement of what
      we do instead, DPA, data residency — ~18 — *CEO + Security*

When any of these arrives:
1. Add the fact to `content/site.json`.
2. Build the component that renders it (it is already designed as an optional slot).
3. Re-run the five-second test and the intent question with the Research Analyst.
4. Record the before/after in `journal.md`.

---

## Backlog — page-side, evidence-ranked

- [ ] Phone-first short route: eight screens, one case, the price commitment,
      a persistent call button — *Designer + PM*
- [ ] One legacy-takeover case study — the problem cohorts A and C arrive with,
      and the only claim with no example behind it — *PM* (needs a real project)
- [ ] Name a pointed specialism above the eight disciplines; breadth still reads
      as generalist to roughly one in ten — *PM*
- [ ] Sector filter on `/work` — *PM*
- [ ] Testimonials: turn on when real quotes exist (`testimonials.enabled`) — *PM*
- [ ] Pronunciation or lockup cue so the name survives being heard once — *Designer*
- [ ] `/about` and `/pricing` as routes once the facts exist — *PM*

---

## Release checklist

Run in full before every deploy. Owner: **Test Engineer**, signed off by **CEO**.

- [ ] Full e2e matrix green
- [ ] axe green, all routes, both themes
- [ ] Lighthouse CI within budget, all routes
- [ ] No console errors on any route
- [ ] Every internal and external link resolves
- [ ] Form submits to the real endpoint and the team receives it
- [ ] Metadata, sitemap, robots, OG image correct
- [ ] Security headers verified on the deployed URL
- [ ] No placeholder string anywhere in the content
- [ ] `journal.md` entry for this release
- [ ] Rollback path known and written down
