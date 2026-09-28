# Agents

Role definitions. Each carries a checklist a PR is measured against. Format follows
the ECC convention (`affaan-m/ECC`): YAML frontmatter, a shared prompt-defense
baseline, then role → non-negotiables → workflow → PR checklist → anti-patterns.

## The seven

| Agent | Owns | Model |
|---|---|---|
| `3d-engineer` | `src/components/three/`, scroll state, WebGL budgets, jank, the four fallbacks | sonnet |
| `designer` | Tokens, layout, atomic inventory, hierarchy, cognitive load | sonnet |
| `test-engineer` | Test design, coverage, the merge gates, the release checklist | sonnet |
| `security-engineer` | Headers, CSP, supply chain, the form, vendor questions | sonnet |
| `product-manager` | Scope, specs, sequencing, what waits | opus |
| `research-analyst` | The study, findings, sizing a change, competitive evidence | opus |
| `ceo` | Trade-offs, public commitments, the five missing facts, launch | opus |

## Additions beyond the seven

| Agent | Owns | Model |
|---|---|---|
| `content-steward` | `content/site.json`, the placeholder gate, tone rules, the two owned phrases | sonnet |
| `business-analyst` | Requirements traceability, metric definitions, the analytics event taxonomy | opus |
| `seo-specialist` | Metadata, canonicals, JSON-LD, sitemap, robots, anchor stability, branded search | sonnet |
| `geo-specialist` | AI-answer-engine citation: crawler access, extractability, entity consistency | sonnet |

**`content-steward`** — the placeholder rule is rule 1 of the project and the tone
rules are measured assets, but ownership of the *words* was split three ways: Test
owns the CI check, PM owns page assembly, CEO owns the facts. This agent owns the
editorial gate.

**`business-analyst`** — scoped deliberately narrow to traceability and
measurement. On a three-route site a wide BA remit duplicates the PM. It exists
because `context.md` §7 lists success metrics whose definitions do not yet exist,
and the analytics vendor is still an open decision (`architecture.md` §9 #3).

**`seo-specialist`** — organic search is a *support* channel here; work arrives
referral-led. The agent is written to reflect that, and its sharpest issue is not
rankings but the branded-search problem: half of users misspell the name as
"Wedesigns", which breaks the search that follows a referral conversation.

**`geo-specialist`** — separate from SEO because the overlap between top search
results and AI-cited sources has fallen below 20%. Its most important job is
defensive: rule 4 (every 3D fact also exists in the DOM as text) was written for
accessibility and happens to be this site's single most valuable GEO property.
Nobody may weaken it on the grounds that the canvas already shows the fact.

## Review minimums

From `standards.md` §8:

- **Test Engineer** — any behaviour change
- **Security Engineer** — any dependency, header or form change
- **Designer** — any visual change
- **3D Engineer** — anything under `src/components/three/`

Extended by the additions above:

- **Content Steward** — any change to `content/site.json`
- **CEO** — any new public claim, and the AI-crawler decision
- **SEO + GEO together** — any change to `robots.txt`, a URL, or an anchor id
- **Business Analyst** — any new metric or analytics event

## Overlap to watch

`seo-specialist` and `geo-specialist` share `robots.txt` and structured data. One
file, two concerns: SEO owns crawl/index correctness, GEO owns the AI-crawler
stance. They agree before either edits it.

## Considered and not added

- **a11y specialist** — accessibility is a hard gate already split between Designer
  (contrast, targets, focus) and Test Engineer (axe, keyboard pass). A third owner
  would let both defer.
- **performance specialist** — budgets in `architecture.md` §8 are owned by the 3D
  Engineer and enforced by the Test Engineer. Same reasoning.
