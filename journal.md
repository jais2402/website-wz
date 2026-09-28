# journal.md — decisions and completed work

Append-only. Newest entry at the top. One entry per decision or per completed
piece of work. A decision entry states the options, the choice, and the reason —
the reason is the part future-you needs.

**This file is the handover.** A session that ends without an entry here has lost
its context — the next session starts by reading the top of this file and must be
able to resume from it without asking. Writing the entry is part of finishing the
work, not an optional tidy-up afterwards.

## Entry formats

**Decision, delivery or reversal:**

```
## YYYY-MM-DD — Title
**Type:** decision | delivery | reversal
**Owner:** agent or person
**Context:** why this came up
**Options:** what was considered
**Decision:** what we chose
**Because:** the reason, in the terms that mattered
**Consequences:** what this now constrains or unlocks
```

**Session close-out** — written at the end of every working session, after the
entries for anything decided or delivered in it:

```
## YYYY-MM-DD — Session: <what was worked on>
**Type:** session
**Done:** what actually changed, named by file
**State:** where the project stands now — what exists, what runs, what does not
**Next:** the obvious next action, specific enough to start from cold
**Blocked:** what is waiting, and on whom
```

`State` and `Next` are the two that matter. A `Done` list without them tells the
next session what happened but not where it is standing.

---

## 2026-09-28 — next.config.mjs: dropped the `eslint` key, pinned the Turbopack root
**Type:** decision
**Owner:** 3D Engineer
**Context:** `next dev` emitted three warnings on every start.
**Decisions:**
1. Removed `eslint: { ignoreDuringBuilds: false }`. It is not a valid
   `next.config` key in Next 16 — linting is its own step now. Nothing is lost:
   `pnpm verify` runs `pnpm lint` before `pnpm build`.
2. Added `turbopack.root`, derived from the config file's own location via
   `fileURLToPath(new URL('.', import.meta.url))` rather than a hardcoded path,
   so it survives a move or a fresh clone.
**Because (2):** Turbopack infers the workspace root by walking up for a
lockfile. There is an unrelated `package.json` and `package-lock.json` in the
home directory dated 28 April, so it was adopting `~` as the project root. Those
files were left alone — they are the user's and may belong to something. If they
are leftovers, deleting them would fix this for every Node project on the machine.
**Consequences:** `next dev` starts clean. Build re-verified: four static routes.

---

## 2026-09-28 — Next 16 appends a block to CLAUDE.md; we keep it
**Type:** decision
**Owner:** PM
**Context:** `next dev` prints "Generated CLAUDE.md for AI agents". First reading
was that it had overwritten the project brief. It had not — it appends between
`<!-- BEGIN:nextjs-agent-rules -->` and `<!-- END:nextjs-agent-rules -->`, and
all 155 existing lines were intact.
**Options:** (a) delete the block, (b) disable with `agentRules: false`, (c) keep it.
**Decision:** (c). Keep it, and commit it with the work.
**Because:** it regenerates on every `next dev`, so deleting it only produces a
permanently dirty tree. The content is also useful — it points at
`node_modules/next/dist/docs/` for Next 16's breaking changes, which is exactly
the gap an agent working from older training data would fall into.
**Consequences:** `CLAUDE.md` now has a machine-managed tail. Edit above the
BEGIN marker only. `agentRules: false` in `next.config.mjs` turns it off if the
block ever conflicts with a project rule.

---

## 2026-09-28 — Session: dev server warnings cleared, running locally
**Type:** session
**Owner:** PM

**Done**
- `next.config.mjs`: removed the invalid `eslint` key, pinned `turbopack.root`.
  Both entries above.
- Confirmed the Next-generated `CLAUDE.md` block is additive, not destructive.
- Rebuilt and re-verified: compiles clean, four static routes.
- Site served and checked at http://localhost:3000.

**State**
- `next dev` starts with **no warnings**.
- `pnpm verify` passes: typecheck, lint, content validation, 18 tests, static
  build, 164.21 kB brotlied against the 180 kB budget.
- **No dev server is running.** Cleaning up a background server, a broad
  `pkill -f "next dev"` also killed the one the user had started in their own
  terminal. Restart with `pnpm dev`. Lesson for next time: match the specific
  PID, or never background a server the user is also running.
- Everything from the previous session's State still holds: no 3D scene, fonts
  not self-hosted, axe and the Playwright matrix never run, not a git repository.

**Next**
Unchanged from the previous session: `git init` and first commit; Phase 3 (the 3D
system, restoring the 320 KB chunk budget); `pnpm exec playwright install` then
the a11y and e2e matrix; self-host Outfit and JetBrains Mono; Phase 4 metadata,
sitemap, robots, JSON-LD and the form endpoint decision.

**Blocked**
Unchanged: the five business facts (CEO); form transport, host and analytics
vendor (architecture.md §9); the AI-crawler stance in `robots.txt` (CEO).

---

## 2026-09-28 — Dependency: tailwind-merge, and why `cn` was a real bug
**Type:** decision
**Owner:** Designer + Code Reviewer
**Context:** The header CTA stayed visible at 390px despite `hidden sm:inline-flex`.
**Cause:** `src/lib/cn.ts` only joined strings. `cn('inline-flex', 'hidden')` emitted
both classes and let CSS source order — not intent — decide the winner.
**Options:** (a) wrap the call site in a `<span class="hidden sm:block">`,
(b) merge Tailwind conflicts in `cn`.
**Decision:** (b). Added `tailwind-merge@3.3.1` (3.x is the Tailwind v4 line) and
taught it this project's tokens via `extendTailwindMerge`, so `text-d1` (a size)
and `text-ink` (a colour) are not confused for one another.
**Because:** every component here takes `className` as the supported way to adjust
it. Without conflict resolution that prop is unreliable for any utility colliding
with a base class — a silent failure, and directly against the editability goal.
A call-site patch would have fixed one symptom and left the mechanism broken.
**Weight:** ~4 KB. Replaces a hand-rolled join. Regression test in
`tests/unit/new-atoms.test.tsx`.
**Consequences:** `className` overrides now behave as documented everywhere.

---

## 2026-09-28 — 3D chunk size budget removed until Phase 3
**Type:** decision
**Owner:** Test Engineer
**Context:** `pnpm size` failed because the `out/_next/static/chunks/*three*.js`
glob matches nothing — there is no 3D chunk yet.
**Options:** (a) leave it failing, (b) remove the entry, (c) keep it and let
`verify` stay red.
**Decision:** Removed the entry from `package.json`, with a task in `tasks.md`
Phase 3 to restore it (≤320 KB gzip) alongside the scene.
**Because:** a permanently red gate gets ignored, which is worse than a tracked
absence. size-limit has no "allow missing" option.
**Consequences:** the 3D budget is unguarded until that task is done. It is
written into Phase 3 so it cannot be quietly lost.

---

## 2026-09-28 — Session: Phase 1 and 2 built — the site renders end to end
**Type:** session
**Owner:** PM

**Done**
- Installed the `wezigns-web` artifact scaffold, keeping the existing `.claude/`
  (13 agents, 6 skills) and `journal.md` over the artifact's 7-agent subset.
  **`content/site.json` now exists** — the blocker named in the last session.
- Baseline repairs: added `vitest.config.ts`, `tests/setup.ts`,
  `playwright.config.ts`; fixed 4 typecheck errors; installed `typescript-eslint`
  and scoped its rule to TS files (it was failing on `.mjs`).
- **Atoms** (+5): `Chip`, `Figure`, `Rule`, `ThemeToggle`, `MotionToggle`.
- **Molecules** (+9): `FactRow`, `MetricPair`, `StepBlock`, `DisciplineRow`,
  `TopicChips`, `Field`, `FaqItem`, `AreaAccordion`, `CaseTabs`.
- **Organisms** (+11): `Section`, `SequenceSection`, `StatementSection`,
  `StatementProofSection`, `StepsSection`, `ProseSection`, `FiguresSection`,
  `CasesSection`, `FaqSection`, `SiteHeader`, `SiteFooter`.
- **Templates:** `DocumentTemplate`, and `SectionRenderer` — the pattern→organism
  map that makes the page editable from JSON alone.
- All three routes wired: `/`, `/work`, `/capabilities`.
- `src/lib/prefs.ts` — theme and motion via `useSyncExternalStore`, replacing a
  setState-in-effect pattern React 19 flags.
- 15 new tests (18 total, all passing), including a placeholder-copy regression
  test and a `cn` conflict test.

**Bugs found and fixed in review**
1. `cn` did not resolve Tailwind conflicts — see the entry above. Found by
   measuring the DOM at 390px, not by reading code.
2. Sticky headline overlapped its own list in `SequenceSection`. Rebuilt as a
   tall track with a sticky inner block, advanced by `IntersectionObserver`
   sentinels rather than a scroll listener (architecture.md §5).
3. Theme toggle read "DK" while already dark — `getTheme()` only checked
   `data-theme`, which is unset when the visitor is on the system preference.
4. `<title>` rendered "Work · Wezigns · Wezigns"; site.json already carries the
   suffix, so the routes now use `title: { absolute }`.
5. Nav and footer links were 18–19px tall, under the 24px WCAG 2.2 SC 2.5.8 floor
   and the project's own 40px rule. Raised to `min-h-10`.
6. Theme/motion localStorage keys did not match the boot script (`wz-theme`),
   which would have flashed on load.

**Not a bug:** right-hand sections looked clipped in a scaled screenshot.
Measured `scrollWidth` against viewport — zero overflowing elements. The pane was
cropping. Worth recording: the measurement prevented a fix to working code.

**State**
- `pnpm verify` passes end to end: typecheck, lint, content validation, 18 tests,
  static build, size budget.
- Initial route JS **164.21 kB brotlied against a 180 kB limit**.
- All three routes render and were checked by eye at 1512px and 390px, light and
  dark. DOM audit: one `<h1>`, no heading skips, single `main`/`header`/`footer`,
  no unlabelled controls, no nameless interactive elements, skip link first, no
  horizontal overflow.
- **The 3D scene does not exist.** `src/components/three/` holds only its README.
  This is the correct order — Phase 2's acceptance criterion is that the page
  renders correctly with the canvas off, which it now does.
- pnpm is not on the system PATH. Installed to `~/.local/bin` via corepack
  (`corepack enable` needed root for `/usr/local/bin`). Add `~/.local/bin` to
  PATH, or prefix commands with it.
- Still not a git repository.

**Next**
1. `git init`, `.gitignore` is already present, first commit.
2. Phase 3 — the 3D system, per `.claude/agents/3d-engineer.md`. Restore the
   320 KB chunk budget at the same time.
3. `pnpm exec playwright install` then run `test:e2e` and `test:a11y` — the
   browsers are not installed, so **axe and the e2e matrix have never run**. The
   DOM audit above is a sanity check, not a substitute.
4. Fonts: Outfit and JetBrains Mono are referenced in tokens but not self-hosted
   in `public/fonts` yet — currently falling back to system-ui.
5. Phase 4 — metadata per route, sitemap, robots, JSON-LD, and the form endpoint
   decision (architecture.md §6).

**Blocked**
- The five business facts — CEO. Every dependent component is built to appear the
  day its slot stops being `null`.
- Form transport, host, analytics vendor — architecture.md §9.
- AI-crawler stance in `robots.txt` — CEO, raised by `geo-specialist`.

---

## 2026-09-28 — Session: project setup, docs installed, agent roster and skills
**Type:** session
**Owner:** PM

**Done**
- Project moved and renamed twice: `weigzn website design ` (trailing space) →
  `weigzn-website` → `wezigns-website`. Name confirmed as **Wezigns** by the owner.
- `.claude/architecture.md`, `design.md`, `context.md`, `standards.md` — replaced
  the earlier placeholder scaffold with the approved documents.
- `README.md`, `tasks.md`, `journal.md` — installed at root.
- `CLAUDE.md` — written, then rewritten once the approved docs arrived (the first
  version recorded "no WebGL", which is the opposite of the real design).
- `.claude/agents/` — thirteen role definitions plus `README.md`. The seven named
  in `README.md`, plus `content-steward`, `business-analyst`, `seo-specialist`,
  `geo-specialist`, `design-reviewer`, `code-reviewer`.
- `.claude/skills/` — six vendored from `affaan-m/ECC` (MIT), plus `README.md`
  recording what was rejected and why.
- This entry's own rule: `journal.md` header now defines a session close-out
  format; `standards.md` §7 and `CLAUDE.md` require one every session.

**State**
- Documentation and process are complete. **No implementation exists.**
- `src/` contains only `.gitkeep`. There is no `package.json`, no build, nothing
  runs. `pnpm dev` and `pnpm verify` in `README.md` are aspirational.
- Not a git repository yet — `git init` has not been run.
- The thirteen agents are live and selectable. The six skills are vendored in-repo.
- The five business facts remain unsupplied; every component that needs one stays
  unbuilt by design.

**Next**
Phase 0 in `tasks.md`, in dependency order. The first two are hard blockers:
1. **`content/site.json` + `content/schema/site.schema.json`** — logged as
   delivered in the 2026-09-28 scaffold entry but **not present in the folder**.
   It is the single source of all copy, so nothing in Phase 1 onward can start.
   It cannot be reconstructed — it came from the approved prototype.
2. **`package.json`** and the Next 16 app scaffold — `output: 'export'`,
   Turbopack, TS strict, React pinned to 19.3.x.
3. `src/styles/tokens.css` from `design.md` §1, both themes.
4. ESLint with the atomic import-direction rule; CI wiring.
5. `git init` and the first commit.

**Blocked**
- `content/site.json` — on whoever holds the approved prototype export.
- The five business facts — on the CEO. Ranked by measured intent lift in
  `context.md` §6: price band (~45 of 200), named clients (~40), team page (~35),
  phone number (~20), security position (~18).
- Form transport, host, and analytics vendor — open decisions in
  `architecture.md` §9, needed before Phase 4 and Phase 5.
- AI-crawler stance in `robots.txt` — a CEO decision about training use, raised by
  `geo-specialist`, needed before Phase 4.

---

## 2026-09-28 — Added design-reviewer and code-reviewer; vendored six ECC skills
**Type:** delivery
**Owner:** PM
**Delivered:** Two reviewer agents and six skills, taking the roster to thirteen
agents.
**Decision — author/reviewer split:** `design-reviewer` is separate from
`designer`, and `code-reviewer` separate from `test-engineer`, because the person
who just built something is the worst judge of whether it renders correctly at
320px in dark mode. Both drive Playwright: `design-reviewer`'s evidence is a
screenshot, not a source file, and `code-reviewer` verifies behavioural claims
("lazy-loads after first paint", "renders nothing when idle") in a browser rather
than believing the diff.
**Adopted from ECC:** the confidence gate — >80% confidence to report, HIGH and
CRITICAL require the snippet plus a concrete failure scenario, and **zero findings
is a valid review**. Manufactured findings are the primary failure mode of an LLM
reviewer and train people to skim past real ones.
**Decision — skills kept to six.** Ten were vendored, then four removed
(`accessibility`, `design-system`, `security-review`, `seo`) once it was clear each
duplicated something `.claude/` already said more specifically. The filter: a skill
earns its place only if it adds what our own docs do not.
**Because:** this project's documents are unusually specific. A generic skill that
restates them in weaker terms is not neutral — it gives an agent a second, looser
source to follow when the two disagree. Hence the precedence rule: `.claude/` wins.
**Notable exclusion:** the `motion-*` skills are built on `motion/react`. The
project has no animation library by decision (`architecture.md` §5), so installing
them would push a forbidden dependency.
**Consequences:** ECC is MIT (© 2026 Affaan Mustafa); skills are vendored with
attribution in `.claude/skills/README.md` rather than installed as a plugin, which
would have pulled in 292 skills and 68 agents colliding with ours. Two gaps remain
uncovered by any skill: Three.js/R3F and GEO — both carried by their agents instead.

---

## 2026-09-28 — Added business-analyst, seo-specialist and geo-specialist
**Type:** decision
**Owner:** PM
**Context:** Requested after the initial eight. SEO had been explicitly rejected a
day earlier as already-covered; that judgement is overturned by the request, and
writing it surfaced an issue the earlier reasoning had missed.
**Decision:** Three more agents, taking the roster to eleven.
**Because:**
- `business-analyst` — `context.md` §7 lists success metrics with no definitions,
  and the analytics vendor is still open (`architecture.md` §9 #3). Scoped narrowly
  to traceability and measurement so it does not duplicate the PM on a three-route
  site.
- `seo-specialist` — the earlier rejection treated SEO as metadata plumbing inside
  the PM's Phase 4. It missed the real issue: `context.md` §4 records that half of
  users misspell the name as "Wedesigns". For a referral-led business that is a
  broken branded-search path — the search that follows a recommendation fails. That
  is an owned problem, not a checklist item.
- `geo-specialist` — separate from SEO on current evidence: the overlap between
  top search results and AI-cited sources has fallen from ~70% to below 20%
  (industry analysis, 2026). Cohort D increasingly asks an assistant before making
  an introduction.
**Notable:** GEO's most valuable property here already exists for another reason.
Rule 4 — every fact the 3D scene shows also exists in the DOM as text — was written
for accessibility, and is simultaneously what makes this site extractable by AI
crawlers. The agent's first job is defensive: stop anyone weakening it.
**Consequences:** SEO and GEO share `robots.txt` and structured data and must agree
before either edits it. The AI-crawler stance (allow `GPTBot` and peers, or block)
is a CEO decision about training use and needs its own journal entry before
`robots.txt` ships. GEO practices are dated September 2026 and flagged as
fast-moving; `llms.txt` is included with an explicit note that adoption is
unconfirmed.

---

## 2026-09-28 — Agent definitions written; one role added beyond the seven
**Type:** delivery
**Owner:** PM
**Context:** `README.md` and `standards.md` §8 both make agent checklists a merge
gate, but `.claude/agents/` did not exist, so the Definition of Done could not
fully run.
**Delivered:** Eight role definitions plus an index. Format follows the ECC
convention (`github.com/affaan-m/ECC`): YAML frontmatter (`name`, `description`,
`tools`, `model`), the shared prompt-defense baseline, then role →
non-negotiables → workflow → PR checklist → anti-patterns. Each checklist is drawn
from this project's own gates, not from generic advice.
**Decision:** Added **`content-steward`** as an eighth role. The seven split
ownership of the content file three ways — Test owns the CI placeholder check, PM
owns page assembly, CEO owns the facts — leaving nobody owning the words
themselves, despite "no placeholder ever ships" being rule 1 and the tone rules
being measured assets.
**Because:** The most expensive finding in the study was an editorial failure, not
a mechanical one. A CI regex catches `[Client name]`; it does not catch "Get in
touch" quietly replacing the highest-recall string the brand owns.
**Considered and rejected:** separate a11y, performance and SEO agents. Each is
already owned by two existing roles, and a third owner lets both defer.
**Consequences:** Review minimums in `standards.md` §8 now extend to Content
Steward on any `content/site.json` change and CEO on any new public claim. Model
assignment is deliberate: opus for the judgment roles (PM, Research, CEO), sonnet
for the rule-checking roles.

---

## 2026-09-28 — Superseded the placeholder scaffold; reversed the no-WebGL decision
**Type:** reversal
**Owner:** PM
**Context:** Before the approved docs were available, this working directory was
scaffolded from scratch with placeholder `.claude/` files. Working from no
business information, that scaffold recorded two decisions that are now known to
be wrong: **"subtle motion only — no WebGL / 3D runtime"**, and a neutral
placeholder colour palette. It also carried the company name as "Weigzn".
**Decision:** The authoritative `architecture.md`, `design.md`, `context.md` and
`standards.md` replace the placeholder versions wholesale. `README.md`,
`tasks.md` and `journal.md` added. `CLAUDE.md` rewritten from the opposite
premise. The no-WebGL decision is **reversed**: the scroll-driven WebGL scene is
the site's differentiator (see the 3D decision entry below).
**Because:** The placeholder docs were written to be replaced the moment real
context existed. Keeping them would have actively misled — a file that says
"no Three.js" in a repo whose whole design rests on an `InstancedMesh` is worse
than no file at all.
**Consequences:** Nothing from the placeholder scaffold survives except the empty
`src/` directory. The `web-3d-master` plugin installed at user scope **is** now
relevant to this project, where the earlier `CLAUDE.md` told agents to ignore it.
**Resolved (same day):** the company name is **Wezigns**, confirmed by the owner.
The earlier placeholder scaffold had used "Weigzn". The directory was renamed
`weigzn-website` → `wezigns-website` and every document checked; no misspelling
survives outside this historical entry. Worth holding onto: `context.md` §4
records that half of users misspell the name as "Wedesigns" ten minutes later,
which re-files the company as a design shop at the moment of recommendation —
the backlog carries a pronunciation/lockup cue for exactly this reason.

---

## 2026-09-28 — Project scaffolded from the approved prototype
**Type:** delivery
**Owner:** PM
**Context:** The scroll prototype has been through a 200-user simulation study
(three rounds, four cohorts) and is approved as the design direction. It is now
being rebuilt as a production site.
**Delivered:** `.claude/` (architecture, design, context, standards), seven agent
definitions, `content/site.json` with all copy extracted from the prototype,
`tasks.md`, this journal, README, package manifest, and the atomic source
skeleton.
**Consequences:** All copy now lives in one JSON file. No component below
`templates/` may import it. Every fact the business has not supplied is `null`
and renders nothing.

---

## 2026-09-28 — Stack: Next.js 16 static export, React 19.3, Tailwind 4, R3F 9
**Type:** decision
**Owner:** 3D Engineer + PM
**Context:** The site is a marketing site with a heavy WebGL scroll experience
and no server-side data.
**Options:** (a) Next.js static export, (b) Astro + islands, (c) Vite + React SPA.
**Decision:** Next.js 16.3 App Router with `output: 'export'`.
**Because:** Static output removes a server from the threat surface and the bill,
while the App Router gives us file-based routes for the two deep-link pages the
study said we need. Astro was close, but the 3D scene is stateful across the
whole page, which suits one React tree. React is pinned to 19.3.x because
`@react-three/fiber` 9 declares `react >=19 <19.4`.
**Consequences:** No middleware, no Server Actions, no ISR, no `cookies()`.
`next/image` needs a custom loader or plain `<img>`. Turbopack is the default
bundler in 16, so a webpack config would fail the build. Security headers must
be set at the host, not in the app.

---

## 2026-09-28 — Content lives in one JSON file, not a CMS
**Type:** decision
**Owner:** PM
**Context:** The site is roughly 6,000 words and changes rarely; the company has
no editorial team.
**Options:** (a) JSON in the repo, (b) MDX per section, (c) headless CMS.
**Decision:** One `content/site.json`, validated by a JSON Schema and parsed with
zod in dev and CI.
**Because:** A CMS adds an origin, a cost and an outage mode for content that
changes a few times a year. JSON gives us types, a diff in review, and a hard
gate against placeholder strings.
**Consequences:** Revisit when a fifth case study lands or when someone
non-technical needs to edit weekly. MDX per case is the likely next step.

---

## 2026-09-28 — Nothing placeholder ships, ever
**Type:** decision
**Owner:** CEO
**Context:** In round 1 of the study, visible `[Client name]` placeholders were
named by 56 of 80 users and caused several to stop believing the real
case-study numbers.
**Decision:** Optional facts are `null` in the content file and render nothing.
CI fails the build on bracketed placeholders, `Lorem`, `TODO:` or `TBD` in any
rendered field.
**Because:** An absence costs less than a fake. This was the most expensive
single finding in the study.
**Consequences:** Testimonials, team, price band, phone and certifications stay
off the site until the facts exist. The components are built to appear the day
they do.

---

## 2026-09-28 — The 3D is a diagram, and it is never in the critical path
**Type:** decision
**Owner:** 3D Engineer
**Context:** The scene is the site's differentiator and also its biggest
performance and accessibility risk.
**Decision:** One `InstancedMesh`, fifteen states blended by scroll,
`frameloop="demand"`, DPR clamped, the chunk lazily imported after first paint,
canvas `aria-hidden`, and four verified fallbacks (no WebGL, reduced motion,
low-power, paused by choice).
**Because:** The study found the model earned attention only when it explained
something; when it needed instructions it cost trust. And a page that cannot be
read without WebGL is not a page.
**Consequences:** Every fact shown in 3D must also exist in the DOM as text.
Any new scene has to fit the draw-call and idle-render budget before it ships.

---

## 2026-09-28 — Phones get no scroll-gating
**Type:** decision
**Owner:** Designer + Research
**Context:** Scroll-revealed lists and hover-to-open panels were the top
abandonment cause on mobile across rounds 2 and 3 (around 26 of 60 users).
**Decision:** Below the `lg` breakpoint (1000px) every sequence is inert:
all items open, no sticky, no hover dependency.
**Because:** Roughly 45% of every cohort arrives on a phone with a 2–4 minute
attention budget. Cleverness costs more than it earns there.
**Consequences:** `SequenceSection` has two modes and both must be tested. The
mobile page got shorter as a result, which was the point.
