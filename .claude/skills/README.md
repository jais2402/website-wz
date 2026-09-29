# Skills

Vendored from [`affaan-m/ECC`](https://github.com/affaan-m/ECC) (MIT,
© 2026 Affaan Mustafa), cloned 2026-09-28. ECC ships 292 skills. **Six are
installed.** Vendored rather than installed as a plugin, so they are
version-controlled with the repo and do not drag in 292 skills and 68 agents that
would collide with `.claude/agents/`.

The filter: a skill earns its place only if it tells us something `.claude/` does
not already say. Our docs are unusually specific, so most of the catalogue is
either redundant here or aimed at a different kind of project.

## Installed

| Skill | What it adds that `.claude/` does not | Used by |
|---|---|---|
| `nextjs-turbopack` | Next.js 16 + Turbopack specifics — the exact stack. The webpack-config trap that fails our build, `middleware.ts` → `proxy.ts` | 3d-engineer, code-reviewer |
| `react-patterns` | React 19 hooks discipline and server/client boundaries in depth. `standards.md` §1 states the rules; this explains them | code-reviewer, designer |
| `react-performance` | 70+ rules from Vercel Engineering — waterfalls, bundle size, re-render. Our budgets are gated tighter than default, so the techniques matter | 3d-engineer, code-reviewer |
| `react-testing` | RTL + Vitest + axe, and the component-vs-e2e boundary. `standards.md` §5 defines the gate; this is how to satisfy it | test-engineer |
| `e2e-testing` | Playwright page objects, CI wiring, flaky-test strategy — directly supports the two Playwright-driven reviewer agents | test-engineer, design-reviewer, code-reviewer |
| `frontend-a11y` | Implementation patterns for the components where a11y actually breaks: `AreaAccordion`, `FaqItem`, `CaseTabs`, the mobile nav focus trap, the form. Our docs give the criteria, not the patterns | designer, code-reviewer |

## Removed as redundant

Installed first, then removed — each was already covered better by this project's
own documents:

| Skill | Why not |
|---|---|
| `accessibility` | `standards.md` §2 is already a WCAG 2.2 criteria table with the specific SCs this design touches, and `design-reviewer` carries the audit checklist |
| `design-system` | It *generates* a design system from a codebase. `design.md` already defines the full token set — the job it exists to do is done |
| `security-review` | Generic auth / API endpoint / payment guidance. This is a static site with no database, no auth and one form; `standards.md` §4 covers the four threats that are real here |
| `seo` | `seo-specialist` already carries SEO scoped to a referral-led business with three routes and a branded-search problem |

To restore any of them:

```bash
git clone --depth 1 https://github.com/affaan-m/ECC.git /tmp/ecc && cp -R /tmp/ecc/skills/<name> .claude/skills/
```

## `motion-framer` (installed 2026-09-29, owner request)

From `freshtechbro/claudedesignskills`, MIT. Scripts audited: they import only
argparse, sys and json. **This project may use only `motion/react-mini`
(`useAnimate`).** The skill's `motion.div`, variants, `AnimatePresence` and
layout examples use the full component, which measured 37.2 KB brotli and breaks
the 180 KB initial-route budget. Use the skill for easing, timing and choreography
guidance, and implement it through `useAnimate` (see `atoms/Reveal.tsx` and
`molecules/CaseTabs.tsx`). `architecture.md` §1 records the constraint.

## `impeccable` (installed 2026-09-29, owner request)

From `pbakaus/impeccable` v4.4.0, Apache-2.0 (LICENSE copied in). A design
direction, critique, audit and polish skill with sub-commands such as `audit`,
`critique`, `polish`, `animate` and `colorize`. **Supply chain:**
`scripts/impeccable` downloads a prebuilt engine binary from the repo's GitHub
releases on first run and checks it against a `.sha256` file published in the
same place. That check proves the download is intact, not who built it. The
launcher was not run at install time; if it is refused, the skill falls back to
reading the docs directly. **Precedence:** the skill says "the brief wins", and
here the brief is `.claude/`. Its "go bold" defaults never override design.md
(one signal per screen, tokens only, WCAG gate) or context.md copy rules.

## Emil Kowalski skills (installed 2026-09-29, owner request)

From `emilkowalski/skill` @ d16ebe6, MIT (LICENSE copied into each). Markdown
only, no scripts. Installed: `emil-design-eng` (plus `performance-cheatsheet.md`),
`animate`, `find-animation-opportunities`, `improve-animations`,
`review-animations`, `animation-vocabulary`, `apple-design`, `mobile-native`.
**Not installed:** `write-swift`, `animate-expo` and `ask-sonner` (not this stack),
`pick-ui-library` (adding a dependency needs an architecture.md decision), and
`prototype`. Any library these skills suggest must fit the budget: Motion is
`motion/react-mini` only (architecture.md §1).

## master5d/claude-design-skills (installed 2026-09-29, owner request)

@ 5cf7b69. **No licence file.** The repo compiles other authors' skills
(ibelick/ui-skills and others) for local use only. Installed:
`fixing-motion-performance`, `baseline-ui`, `fixing-accessibility`,
`fixing-metadata`. **Not installed:** its `emil-design-eng`, which duplicates the
upstream copy above, and `interface-design`, which says it is not for marketing
sites. Where `baseline-ui` or `fixing-metadata` disagree with design.md tokens or
the seo-specialist's metadata, `.claude/` wins.

## taste-skill (installed 2026-09-29, owner request)

From `leonxlnx/taste-skill` @ ce26fc2, MIT (LICENSE copied). Markdown only;
`skill.sh` is just a name→path lookup and was not copied. Installed:
`design-taste-frontend` (from `skills/taste-skill`) and
`redesign-existing-projects` (from `skills/redesign-skill`). **Not installed:**
- brutalist, minimalist and soft (aesthetics that conflict with design.md);
- gpt-taste (GSAP; the budget allows `motion/react-mini` only);
- imagegen-frontend-web and imagegen-frontend-mobile, brandkit, stitch and
  image-to-code (other tools);
- output-skill;
- taste-skill-v1 (legacy).
`.claude/` still wins on any conflict. These skills push bold defaults: fonts,
grids, perpetual motion. The brief's tokens, the one-accent rule, the
motion budget and the tuned copy are not overridden by them.

## Deliberately never installed

**`motion-foundations`, `motion-patterns`, `motion-advanced`** — built on the
full `motion/react` component API. Still not installed: see `motion-framer` below
for the one Motion surface the budget allows.

**`frontend-patterns`** — overlaps `react-patterns` with nothing added for this stack.

**The other ~280** — mobile, backend, other languages, agent-harness tooling.

## Gaps — nothing in the catalogue covers these

- **Three.js / R3F / WebGL.** The largest technical surface in this project has no
  ECC skill. `.claude/agents/3d-engineer.md` carries the rules instead.
- **GEO.** Not in the catalogue. `.claude/agents/geo-specialist.md` carries it,
  grounded on September 2026 practice and flagged as fast-moving.

## Precedence

A skill is general guidance. `.claude/` is this project's brief and **wins on any
conflict** — `standards.md` §3 gates performance tighter than `react-performance`
advises, and `design.md` forbids arbitrary Tailwind values that generic React
guidance permits. When they disagree, follow `.claude/` and say so.
