# CLAUDE.md

Guidance for Claude Code working in this repository.

## Project

**Wezigns** — marketing website. Custom software company operating since 2012,
clients in India, Singapore and the UAE, referral-led. The site sells *systems
that run an operation*, not websites — every decision protects that distinction,
because readers reach for "web agency" the moment they are given the chance.

Static Next.js 16 export with a scroll-driven WebGL scene, built to an atomic
design system, from a direction validated in a 200-user simulation study
(three rounds, four cohorts).

## Read before you touch anything

`.claude/` is the brief. It is evidence-backed, not preference.

| Before you... | Read |
|---|---|
| change copy, a CTA, or section order | `.claude/context.md` |
| change anything visual, a token, or the 3D language | `.claude/design.md` |
| add a dependency, change build/deploy/data flow | `.claude/architecture.md` |
| open a PR or call anything done | `.claude/standards.md` |

`tasks.md` — roadmap, owners, acceptance criteria.
`journal.md` — decisions and session handovers, dated, append-only. **Record
decisions here, not in `tasks.md`.** See **Always close the session in `journal.md`**
below — it is not optional.

## Current state

Documentation is complete. **Implementation has not started.** Present: `.claude/`
docs, `tasks.md`, `journal.md`, `README.md`. Absent and required by Phase 0:

- `.claude/agents/` — seven role definitions the README and `standards.md` §8 refer to
- `content/site.json` + `content/schema/site.schema.json`
- `package.json`, the `src/` atomic skeleton, `tests/`

Do not invent these. If a task needs one, say it is missing.

## The five rules that override convenience

1. **No placeholder ever ships.** Optional facts are `null` in `content/site.json`
   and render nothing. CI fails the build on bracketed text, `Lorem`, `TODO:` or
   `TBD` in rendered fields. Visible `[Client name]` was named by 56 of 80 users
   and poisoned belief in the real case-study numbers. **An absence costs less
   than a fake.** Never stage, mock, or "temporarily" fill a business fact.
2. **Content enters at the page.** Nothing below `templates/` imports
   `content/site.json`. ESLint enforces it.
3. **Imports travel upward only:** `atoms → molecules → organisms → templates → app`.
4. **The 3D is never in the critical path.** Lazy chunk after first paint,
   `frameloop="demand"`, canvas `aria-hidden`, four tested fallbacks. **Every fact
   the scene shows also exists in the DOM as text** — if a fact only exists in 3D,
   it does not exist.
5. **Phones get no scroll-gating.** Below `lg` (1000px) every sequence is inert:
   all items open, no sticky, no hover dependency. ~45% of every cohort is on a
   phone with a 2–4 minute attention budget.

## Two phrases are measured brand assets

Do not reword without a study-grade reason:

- **"Tell us what is not working."** — the primary CTA everywhere. Never soften
  it to "Get in touch".
- **"…the moment when the business outgrows the workaround."** — the hook.

Tone rules in `context.md` §8. Plain words; no "leverage", "solutions",
"seamless", "cutting-edge", "journey". Short declaratives. One idea per screen.

## Stack constraints that bite

- **Next.js 16.3 App Router, `output: 'export'`.** No middleware, no Server
  Actions, no ISR, no `cookies()`/`headers()`. `next/image` needs a custom loader
  or plain `<img>`. Route Handlers are GET-only and `force-static`.
- **Turbopack is the default bundler.** A webpack config fails the build.
- **React pinned to 19.3.x** — `@react-three/fiber` 9 declares `react >=19 <19.4`.
  Do not bump to 19.4.
- **Tailwind v4 is CSS-first.** There is no `tailwind.config.js`; tokens live in
  `src/styles/tokens.css` inside `@theme`.
- **Security headers are set at the host**, not in the app.
- Node ≥ 20.9. pnpm.
- `<html data-scroll-behavior="smooth">` is required — Next 16 no longer sets it.

## Design non-negotiables

- **No hard-coded hex, px font-size, or arbitrary value that duplicates a token.**
  If a value is needed twice, it is a token.
- **Signal orange is a scarcity token.** One per screen, maximum. If two things
  are orange, neither is.
- **Never use a palette surface value for text** — each hue has a separate,
  contrast-safe text value.
- WCAG 2.2 AA is a hard gate, not polish. 40px minimum targets, focus never
  obscured by the sticky header, 400% zoom at 320px, axe clean in both themes.
- `prefers-reduced-motion` and the persisted pause control are both first-class.

## The five missing business facts

`context.md` §6 and `tasks.md` § Blocked. Price band, named clients, team page,
phone number, security position — ordered by measured intent lift across 200
users. Each is a `null` slot in `content/site.json → meta.TODO_business_facts`.

**Do not invent them and do not stage them.** If asked to build something that
needs one, build the optional component and leave the slot `null`.

## Always close the session in `journal.md`

**Every session ends with a `journal.md` entry. No exceptions, including sessions
that only read, investigated, or changed nothing.**

`journal.md` is the handover. The next session starts by reading the top of it and
must be able to resume from cold without asking what happened. A session that ends
without an entry has thrown its context away — and on this project that context is
expensive, because the reasoning behind most rules is evidence from a 200-user
study that is not re-derivable from the code.

Write it **as part of finishing the work**, not as a tidy-up afterwards. If the
work is interrupted, the entry still gets written, describing where it stopped.

Two kinds of entry, both formats in `journal.md`'s own header:

1. **Decision / delivery / reversal** — one per thing decided or shipped. State the
   options and the reason, not just the outcome. The reason is the part that is
   lost otherwise.
2. **Session close-out** — one at the end, after the above:
   - **Done** — what actually changed, named by file
   - **State** — what exists now, what runs, what does not
   - **Next** — the obvious next action, specific enough to start from cold
   - **Blocked** — what is waiting, and on whom

`State` and `Next` are the two that carry the handover. A `Done` list alone tells
the next session what happened but not where it is standing.

Keep entries honest. Record reversals as reversals — a decision that was overturned
is more useful to the next session than a tidy history that hides it. If something
was left broken or skipped, say so plainly.

## Definition of Done

`standards.md` §7 — all of it, every time. Types, lint, unit + integration,
Playwright on chromium/webkit/mobile chrome, axe clean both themes, hand keyboard
pass, reduced-motion and no-WebGL verified, inside budget, no placeholder copy,
320→1512px, `tasks.md` ticked, and `journal.md` updated — see below.

## Review

`standards.md` §8. Minimum: Test Engineer on behaviour, Security on dependencies
or headers, Designer on visuals, 3D Engineer on anything under
`src/components/three/`.

## Commits

Conventional Commits, scope = atomic level or route:
`feat(organisms): sequence section`. Branch off `main`, PR in.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
