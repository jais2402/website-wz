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

## Deliberately never installed

**`motion-foundations`, `motion-patterns`, `motion-advanced`** — built on
`motion/react` (Framer Motion). This project has **no animation library**:
`architecture.md` §5 requires CSS `transform`/`opacity` only, and adding one needs
a recorded decision. These would push a dependency the project forbids.

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
