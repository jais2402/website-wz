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

## 2026-09-29 — A model on every sub-page, without a second renderer
**Type:** delivery (reverses the DocumentTemplate note "no split canvas, no scene")
**Owner:** Owner direction ("have some 3D element on all the sub pages")
**Context:** The document pages were built deliberately without a scene — the
comment on DocumentTemplate said so: "these exist to be read and shared". With
eleven of them the site had two visual languages.
**Decision — reuse the stage, add no three.js.** The stage already finds its
scenes by walking the DOM for `[data-scene]`. A page gets a model by carrying
one band and nothing else, so there is no second renderer and no second bundle.
With a single scene on the page there is no neighbour to blend toward, so the
model sits still in its slot: the journey belongs to the home page and repeating
it here would be noise.
- New `PageScene` organism: a `[data-scene][data-side="c"]` band with a
  `[data-stage-slot]` and the IsoGlyph inside it as the standing fallback.
  `data-side="c"` makes the model ride with the page, so it scrolls away with
  the band instead of hanging behind the text — the FAQ/contact overlap on the
  home page is exactly the failure this avoids, and a test asserts the band
  ends above the H1.
- `DocumentPage` takes an optional `scene`; with none, no canvas mounts and
  nothing is downloaded.
- Per page: a capability shows the whole field of nine with its own module
  lifted in full hue (so the page says where it sits, not just what it is); an
  area page lifts its row of the range; /how-we-build the four stages;
  /about the since-2012 bars; /contact the missing piece; /capabilities the
  field; /work the case carousel.
- `/capabilities` and `/work` were migrated onto `DocumentPage` too, so all
  eleven share one chrome.
- The glyph map moved to `src/lib/glyphs.ts`, shared by the home bento and the
  capability pages so a drawing cannot drift from its subject.
**Budgets untouched:** initial route 174.0 KB (was 174.1), 3D chunk 121.0 KB.
The 3D is still lazy, still after first paint, still absent below lg.
**Second stale-server fix.** `reuseExistingServer: false` collided with the
`next dev` kept running for the owner's preview, and the gate failed to start.
The gate now builds and serves on **:3100** with its own command, so it always
tests the built output and never touches :3000. Also note `pnpm start -- -l PORT`
does not pass the flag through pnpm; the config calls `npx serve` directly.
**Tests:** three added to `tests/perf/scene.spec.ts` — the drawing stands in
until a stage is live and stays at full opacity when none can be, no ready
canvas below lg while the page still reads, and the band never overlaps the
reading column. 18 unit, **129 e2e**, gate exit 0.

## 2026-09-29 — Session: the model on the sub-pages
**Type:** session
**Done:** `src/components/organisms/PageScene.tsx` and `src/lib/glyphs.ts` (new),
`src/components/templates/DocumentPage.tsx`, `src/components/organisms/index.ts`,
`src/components/organisms/SequenceSection.tsx` (uses the shared glyph map),
`src/app/{about,contact,how-we-build,work,capabilities}/page.tsx` and
`src/app/{capabilities,systems}/[slug]/page.tsx`, `playwright.config.ts`,
`package.json`, `tests/perf/scene.spec.ts`, `journal.md`.
**State:** 20 routes, eleven of them with a model. Gate exit 0 against a fresh
build on :3100: 18 unit, 129 e2e, initial 174.0 KB, 3D 121.0 KB. A `next dev`
serves the owner's preview on :3000.
**Next:** the 3D engineer and the design reviewer have seen none of this. The
band height (34vh) and the per-page scene choices are the two things a designer
should rule on. Then the owner's open decisions.
**Blocked:** unchanged — partners; /privacy and /careers; OG and favicon; form
transport; analytics vendor; AI-crawler policy; hero re-test; promise owners;
claim evidence; price band, named clients, team.

## 2026-09-29 — The supporting pages: the thirty systems, and the process
**Type:** delivery
**Owner:** Owner direction ("the rest of the pages support the details of the
offerings and others which need them")
**Delivered:**
1. **Five area pages, `/systems/<area>/`** — People & workforce, Revenue &
   customers, Operations & supply chain, Finance & governance, Industry systems.
   The range is thirty named systems; as one list it answers "do they build my
   kind of system?" only for someone already reading the page. As five pages it
   can answer the question someone types into a search box before they have
   heard of the company. Each carries the six system names **verbatim and in
   order** (they are existing public anchors), a line each on what that system
   does and what it replaces, and a Service entity in JSON-LD.
2. **`/how-we-build/`** — Understand, Shape, Build, Run, each expanded with its
   existing `output` verbatim, then the three rules. "No build starts before
   that number is agreed." sits in Shape.
3. **Linked, not orphaned:** the range areas and the offering rows on
   /capabilities now link to their pages, "How we build" in the nav points at
   the page, and a sitemap test fails if any listed URL 404s.
4. **`DocumentPage` template** — header, measure and footer in one place. The
   chrome had been copied into every route and was starting to drift. Templates
   may read the content file; the boundary is that nothing *below* templates
   does (CLAUDE.md rule 2), which eslint enforces.
**Edited before shipping:** the drafted process closing said "A small fix and a
full system both start with Understand and both end with Run." That is a claim
about how the company works at every size, it was not sourced from site.json, and
the CEO has not approved it. Cut; the first sentence stands.
**Serious finding — the gate was not testing what ships.** Playwright had
`reuseExistingServer: !process.env.CI`, and a `next dev` had been running on
:3000 for over a day. Every local run this session tested that server rather
than `pnpm build && pnpm start`. It surfaced when a new test found zero links
that were demonstrably present in `out/capabilities/index.html`. The stale server
was killed, the option is now `reuseExistingServer: false`, and the suite was
re-run green against a fresh build: 18 unit, **120 e2e**, initial 174.1 KB, 3D
121.0 KB. Earlier "passed" lines in today's entries were measured against that
dev server and should be treated as weaker evidence than this one.
**Not built, deliberately** (tasks.md § Open — pages not built, and why):
`/work/<slug>` (offered earlier, the owner did not choose it); `/pricing` (its
whole subject is the price band, still null — a page that dodges its own question
is worse than none); `/privacy` (a legal requirement once a form collects
personal data, and clients include the Netherlands, UK and Czech Republic, but it
states legal commitments and cannot be drafted without the owner); `/careers`
(no open roles recorded).

## 2026-09-29 — Session: supporting pages
**Type:** session
**Done:** `content/pages.json` (areaPages, howPage), `content/site.json` (nav and
footer links), `src/lib/pages.ts`, `src/types/content.ts`,
`src/lib/structured-data.ts` (serviceSchema takes a path segment),
`src/app/systems/[slug]/page.tsx` and `src/app/how-we-build/page.tsx` (new),
`src/app/sitemap.ts`, `src/components/templates/DocumentPage.tsx` and
`src/components/molecules/PageSectionBlock.tsx` (new),
`src/components/molecules/AreaAccordion.tsx` (optional href),
`src/app/{about,contact,capabilities/[slug]}/page.tsx` (moved onto DocumentPage),
`playwright.config.ts`, `tests/e2e/pages.spec.ts`, `tasks.md`.
**State:** 20 routes build. Gate exit 0 against a fresh build: 18 unit, 120 e2e.
A `next dev` was restarted afterwards so the owner's preview on :3000 is current.
**Next:** the design reviewer has still not seen any of the eleven new pages —
that is the gap. Then the owner's decisions: the partner URLs, /privacy, and
whether /work should split per case.
**Blocked:** partners; /privacy and /careers content; OG and favicon assets; form
transport; analytics vendor; AI-crawler policy; hero re-test; promise owners;
claim evidence; price band, named clients and team.

## 2026-09-29 — Ecommerce offering, nine capability pages, /about and /contact
**Type:** delivery
**Owner:** Owner direction (add the ecommerce offering; add partners; build the
sub-pages; "if you need content take it from here or ask the content writer")
**Context:** The owner pointed at the old site, https://www.wezigns.com, as a
possible content source.
**Decision — the old site is a source of facts, not of copy.** It is an
unmodified WordPress "Kallyas" theme with the demo content still in place:
"HOW TO SHOP", "SHOWROOM HOURS", `support@website.com`, "what makes Kallyas so
special", "9900+ coffee cups this year". Copying any of it would breach rule 1
outright. Its story — "The Design Crew", a digital innovation company selling
graphic design, logo design, SEO packages and illustration — is precisely the
web-agency positioning this site exists to escape (context.md §1). Only two
things were taken from it, both confirmed as current by the owner: the phone
number and the Chennai office.
**Delivered:**
1. **Ecommerce systems**, a ninth offering, drafted by the content steward as an
   operational system (catalogue, orders, stock, fulfilment, payment
   reconciliation) rather than "we make online stores", so it does not read as
   web-agency work. Hue rose. No proof point: there is no ecommerce case study
   yet and none was invented.
2. **The model follows the content.** `build` in three/states.ts built a fixed
   4×2 field of 8; it now derives rows and columns from `DISC.length`, so the
   nine tiles and nine blocks cannot disagree. The `disciplines` IsoGlyph
   fallback is 3×3 to match, and a new `ecommerce` glyph was added.
3. **The bento takes a ninth tile** in a full-width row under the eight ring
   places, at `slim` size. The 2×2 centre stays clear for the model.
4. **Nine capability pages** at `/capabilities/<slug>/`, generated from the
   content. Each carries one offering, its own title and description, a Service
   entity in JSON-LD pointing at the Organization node, and a "When it is not"
   section — capability-level candour, in the spirit of the FAQ line. **The CEO
   should read those four-to-nine lines before launch**: they are the first
   candour written outside the FAQ. Tiles now link to the page, not the anchor,
   because a page can be the answer an engine cites and an anchor cannot.
5. **`/about`** — deliberately no team, founders or headcount; those stay
   blocked. Every figure on it already appears on the home page.
6. **`/contact`** — reuses the home page's `contact` section rather than
   restating it, so the form and the reply promise cannot drift.
7. **Phone and office published** (owner confirmed current): +91 44 2364 3252
   and the Chennai address. Both now render in the footer and on /contact, and
   appear as `telephone` and `PostalAddress` in the Organization JSON-LD. Two
   of the five blocked business facts are now filled.
**Reversal of a shape, not a decision:** sub-page copy moved OUT of
content/site.json into **content/pages.json** (`src/lib/pages.ts`). site.json is
reachable from the client bundle — the 3D scene reads the offerings' hues and
order from it — so the nine capability pages, /about and /contact had pushed the
initial route to 177.1 KB against a 180 KB ceiling, and every future page would
have added more. Splitting them returned it to 174.1 KB and removed the growth.
The placeholder gate in scripts/validate-content.mjs now walks both files.
**Not done, deliberately: the partners.** Research could find no company called
"Solvable" in the payments band at all, and "Inscribe" resolves most plausibly
to inscribe.ai (document-fraud detection) — unconfirmed. Naming a third party as
a partner is a public claim about them, so nothing was added. Tracked in
tasks.md § Open — partners.
**Tests:** new `tests/e2e/pages.spec.ts` — every route resolves with exactly one
h1 and a real title, every route is in the sitemap, the contact page carries the
ways to reach a person, and the ninth offering has both a tile and a page. The
tile-link test now follows each tile to a 200. 105 e2e (was 75), 18 unit, gate
exit 0.

## 2026-09-29 — Session: sub-pages
**Type:** session
**Done:** `content/site.json` (ninth offering, phone, office, footer links),
`content/pages.json` (new), `src/lib/pages.ts` (new), `src/lib/content.ts`
(contactFacts), `src/lib/structured-data.ts` (telephone, PostalAddress,
serviceSchema), `src/app/capabilities/[slug]/page.tsx`, `src/app/about/page.tsx`,
`src/app/contact/page.tsx` (all new), `src/app/sitemap.ts`,
`src/components/three/{scene-data,states}.ts`, `src/components/atoms/IsoGlyph.tsx`,
`src/components/organisms/{SequenceSection,SiteFooter,ContactSection}.tsx`,
`src/types/content.ts`, `scripts/validate-content.mjs`, `tasks.md`,
`tests/e2e/{journey,pages}.spec.ts`.
**State:** 14 routes build. Gate exit 0: 18 unit, 105 e2e, initial 174.1 KB,
3D 121.0 KB. Two of the five business facts are now filled.
**Next:** the owner sends the URLs for Solvable and Inscribe and says what the
relationship is; then the partners section can be designed. Separately the CEO
reads the nine "When it is not" lines. The design reviewer has not yet seen any
of the new pages.
**Blocked:** partners (owner); OG/favicon assets; form transport; analytics
vendor; AI-crawler policy; hero re-test; promise owners; claim evidence; and the
three remaining business facts (price band, named clients, team).

## 2026-09-29 — Applied the review fixes that need no new facts
**Type:** delivery (two of them reverse earlier owner edits — see below)
**Owner:** Owner approval ("yes" to the list of fixes that need nothing from them)
**Context:** Of the five-role review above, these are the items that need no
business fact and no owner judgement. The rest are still open and listed in
tasks.md § Blocked.
**Applied:**
1. **`#pricing` regains its commitment line.** `lead: "No build starts before that
   number is agreed."` This **reverses the 2026-09-29 "Pricing block reduced"
   decision in part**: the owner asked to remove "all the other contents" and this
   puts one line back. It is a tuned line (context.md §4) whose removal three
   reviewers called out. The three points and the note stay removed; the price
   band stays null.
2. **`#moment` regains its proof.** −80% administrative work, 100,000+
   certifications a year, 300 → 4,500 active sellers, copied verbatim from
   `cases`. This **reverses the 2026-09-28 "Removed the proof statistics from the
   hook screen" decision**, which that entry had already flagged as against
   context.md §3 and made reversible by leaving `proof` optional on
   `StatementProofSection`. No component change was needed.
3. **The header CTA is present on phones.** Below 640px the button carries
   `nav.cta.short` ("Contact"); at 640px and up the full phrase. Previously the
   button was hidden below `sm` as prototype parity, which left ~45% of traffic
   with no persistent CTA (context.md §2, §5). The visible text is the accessible
   name, so SC 2.5.3 holds.
4. **The candour FAQ answer opens by default.** New optional `open` on the FAQ
   item; set on "Does Wezigns work with small businesses?" Every answer was
   already in the DOM, so this changes what is read, not what is extractable.
5. **No broken share image.** `src/lib/og.ts` checks `public/<og.image>` at build
   time; the OpenGraph/Twitter `images` and the Organization `logo` are emitted
   only when the file is there. `/og/wezigns-og.png` does not exist, so the tags
   are now absent instead of 404ing in every pasted link. Drop the asset in and
   the tags return on the next build, with no code change.
6. **`public/llms.txt`, generated.** `scripts/build-llms-txt.mjs` runs in `build`
   and writes it from `content/site.json` (description, the eight offerings, the
   FAQ, the routes, the contact line). Generated rather than written so it cannot
   drift from the page; it states no fact the DOM does not. Engine adoption is
   unconfirmed — this is cheap, not proven.
7. **`tasks.md` reconciled** against what is built: phases 1–3 and most of 4 are
   ticked, metadata and the form are `[~]` with the reason, and a new
   § Blocked — assets and decisions and § Open defects carry the owner items and
   the audit P1s (320px overflow, 38px targets, the FAQ boundary, case metadata).
**Tests:** four added to `tests/e2e/journey.spec.ts` — the header CTA at 390px and
1440px, the price line and hook figures, the candour answer visible without a
click, and an og:image tag that must resolve if it is emitted at all. 75 e2e
(was 63), 18 unit, gate exit 0, initial 173.8 KB, 3D 120.9 KB.
**Not applied, deliberately:** the hero H1 and `<title>`, the web-agency drift
(90+ / Websites tile / chip), cutting `#regions`/`#principles`/`#range`, the
promise owners, the claims needing evidence, the AI-crawler policy and analytics.
All need an owner decision or a fact. The model crossing the FAQ text is inherent
to the journey the owner approved today, so it is logged as an open defect rather
than changed.

## 2026-09-29 — Session: applying the review
**Type:** session
**Done:** `content/site.json` (pricing lead, moment proof, FAQ open flag),
`src/components/molecules/FaqItem.tsx`, `src/components/organisms/FaqSection.tsx`,
`src/components/organisms/SiteHeader.tsx`, `src/lib/og.ts` (new),
`src/app/layout.tsx`, `src/lib/structured-data.ts`,
`scripts/build-llms-txt.mjs` (new), `package.json` (build runs it),
`public/llms.txt` (generated), `tasks.md`, `tests/e2e/journey.spec.ts`.
**State:** gate green (18 unit, 75 e2e). The seven fixes above are live. The
owner-decision items from the review are untouched and tracked in tasks.md.
**Next:** the owner works through tasks.md § Blocked — assets and decisions,
starting with the hero five-second re-test, since three reviewers hold launch on
it. Then the web-agency items and the page-length question.
**Blocked:** unchanged, now written down: OG/favicon assets, form transport,
analytics vendor, AI-crawler policy, hero re-test, promise owners, claim
evidence, and the five business facts.

## 2026-09-29 — Review: CEO, PM, BA, SEO, GEO on the home page
**Type:** decision (findings recorded; nothing applied yet, awaiting owner)
**Owner:** CEO, Product Manager, Business Analyst, SEO Specialist, GEO Specialist (review-only; no files edited by them)
**Context:** The owner asked for a CEO/PM/BA review, then an SEO/GEO review, of the page as rendered (desktop 1440 and phone 390 captures, plus built `out/`).
**Findings, consensus first:**
1. Hero H1 "Systems that grow with you." drops the category and the trigger (§3.1). The five-second re-test has not been run (CEO, PM, BA, SEO). The SEO lens adds that the `<title>` has lost "custom software" too, and that shows in search results. Fallback: the old H1, with the new sub kept.
2. `#pricing` is a headline with no body. The measured line "No build starts before that number is agreed." is gone from the page (CEO, PM, BA).
3. The proof arrives late. `#moment` (statement-proof) has no figures. Proposed: −80% admin, 100,000+ certifications/yr, 300 → 4,500 sellers, all already in `cases` (PM, BA).
4. Web-agency drift: "90+ Websites" is stat-sized next to "20+"; the Websites bento tile; the "A website" chip (CEO). GEO proposes one "not a web design studio" comparison passage.
5. Page length on phone: 14 sections before the form, and "11 countries" appears 4 times. Proposed: cut `#regions`, and move `#principles` and `#range` (and maybe `#integration`) to /capabilities (PM).
6. No persistent CTA on phone: the header shows only the menu below lg (BA).
7. OG image `/og/wezigns-og.png` does not exist, so every share card and the JSON-LD logo 404 (SEO). Until the asset exists, drop `images` from the metadata.
8. Promises with no recorded owner or rota: the "one working day" reply (4 places), written security answers, and scope/price/timeline in writing (CEO).
9. Claims that need an evidence file: "Zero unplanned downtime" (no period), "Data stays in-country", "Still running", the hand-over promise, and 40,000 req/min in the present tense. The range's 30 systems invite "show me one" (CEO).
10. robots allows AI crawlers by default rather than by decision, and there is no llms.txt (GEO).
11. No analytics. Seven cookieless events proposed: page_view, section_reached, cta_click, form_start, form_submit, email_copy, web_vitals. Security sign-off is needed first (BA).
12. `tasks.md` is stale: phases unticked, blockers missing, audit P1s untracked (PM).
13. Smaller items: the cube overlaps the FAQ on desktop; open the candour FAQ item by default; case metadata ("Retail" shown as a region, "Dubai" vs UAE); the tech rewrite may cost cohort C its named stack.
**Holding correctly:** all five business facts are null and unstaged; no placeholders; the CTA wording is unchanged; FAQ schema is built from visible text; the entity is consistent; the description string is identical in meta, OG and JSON-LD; `/work` renders CreativeWork JSON-LD (verified).
**Consequences:** the CEO withholds launch sign-off until 1 is tested, 2 and 8 are recorded, and 4, 5 (range) and 9 are fixed.

## 2026-09-29 — Session: five-role page review
**Type:** session
**Done:** captures in the scratchpad (review/desk-*, phone-*); five review reports; this journal entry. No site files changed.
**State:** the site is unchanged since 9bb2896; gate green. The review findings above are open.
**Next:** the owner picks which findings to apply. Safe, fact-free fixes can start without new facts: 2, 3, 6, 7 (drop the OG image tag), 10, 12, and the FAQ overlap and open state. Items that need an owner decision: 1 (re-test or revert the H1 and title), 4, 5, 8, 9, and the analytics vendor.
**Blocked:** the owner decides 1, 4, 5, 8 and 9 and supplies evidence for 9; OG/favicon assets, form transport and the five business facts remain with the owner.

## 2026-09-29 — Bento drawings shaded in their hue
**Type:** delivery (partly reverses the "hue only on attention" line-drawing rule from the bento redesign)
**Owner:** Owner direction ("can we colour these icons so it is not flat"); Designer
**Context:** The line-only isometric drawings (ink-3 strokes on ground-filled faces) read as flat grey next to the full-colour 3D model in the bento centre.
**Options:** (a) colour the strokes only (still flat); (b) a flat hue fill (reads as clip-art); (c) shade each face like the 3D blocks.
**Decision:** (c). Each face mixes the tile's hue toward light or shade in OKLab: top 38% hue on light, left 78%, right 84% toward shade. The stroke is the hue toward shade.
- New tokens `--color-iso-lit` and `--color-iso-shade`, defined in all three theme blocks.
- `.iso` rules in globals.css.
- `IsoGlyph` takes `hue`. The "disciplines" fallback cycles the five brand hues, as the model does.
- On hover, focus or highlight the drawing lifts 4px instead of changing colour.
**Because:** the drawings now speak the same shaded-block language as the model and carry each offering's hue at rest. Tile surfaces stay unfilled with hairline rules, so it is not the tinted-card look rejected earlier as "AI slop".
**Consequences:** `BentoTile`'s INK class map was removed. Signal orange is unused here. Gate green (18 unit, 63 e2e).

## 2026-09-29 — Session: bento icon colour
**Type:** session
**Done:** `src/styles/tokens.css` (iso-lit/shade tokens), `src/styles/globals.css` (`.iso` face shading), `src/components/atoms/IsoGlyph.tsx` (hue prop, face classes, disciplines hue cycle), `src/components/molecules/BentoTile.tsx` (passes hue; lift on attention).
**State:** the bento shows shaded, hued drawings in light and dark. `pnpm verify:full` exit 0. Committed.
**Next:** the owner reviews the icon colour. If the light-theme blue reads too heavy next to the pastel model, raise the lit share of the top and left faces.
**Blocked:** unchanged (five business facts, favicon/OG, form transport; owner).

## 2026-09-29 — Bars → world map crossing: the blocks settle before they pass the heading
**Type:** delivery
**Owner:** Owner direction ("transform little bit here", screenshot of the evidence → regions crossing); 3D Engineer
**Context:** Crossing from the 20+ bars (evidence, model on the left) to the world map (regions, centred), the map arrived flat at full width while the bars were still full height. Mid-crossing, the tall bars travelled through the centred "Work delivered for clients in eleven countries" heading, and map tiles spread under the CTA beside them.
**Options:** (a) re-time every crossing (changes the journey everywhere); (b) re-time only the crossing into the map; (c) move the regions model, which would lose its place under the country list.
**Decision (`three/stage.ts`):** (b).
- Arriving at regions, the parts use a leading blend, `wp = smooth(w / 0.55)`. The bars settle into their country markers in the first half of the crossing, and the map follows `wp`.
- The map now unfolds instead of scaling its height: each tile grows in turn, outward from the centre (`unfoldMap`, radial stagger). Mid-crossing it is a small patch under the model, not a field across the text.
- Matrices are rewritten only while the map value is changing.
**Because:** what passes the heading is now the low map, not full-height bars, and the crossing still reads as the same blocks turning into the map.
**Consequences:** only the crossing into regions changed. All other crossings are untouched. Gate green: 18 unit, 63 e2e; initial route 173.7 KB, 3D chunk 120.9 KB.

## 2026-09-29 — Session: evidence → regions crossing
**Type:** session
**Done:** `src/components/three/stage.ts`: leading blend `wp` for the crossing into regions, and the radial `unfoldMap` for the world-map tiles.
**State:** the site runs at http://localhost:3000/ (long-running next-server). `pnpm verify:full` exit 0. Committed.
**Next:** get the owner's eye on the crossing. If the map still brushes the heading at mid-crossing, lower the leading factor (0.55 → 0.45) or apply the same leading blend to the regions → work crossing.
**Blocked:** unchanged: the five business facts, favicon and OG assets, form transport (owner).

## 2026-09-29 — The journey restored: the prototype's scroll-blended transformation
**Type:** reversal (of the glide 18009ed, the dissolve fc3f736, and a same-day
sticky per-section experiment that was never committed)
**Owner:** Owner direction; 3D Engineer
**Context:** The owner said: "this appearing and disappearing is not working";
"we are building a journey with the blocks"; "make them smooth transitions";
"it was very smooth on the artifact"; "the block 3D is like a journey"; and
"break all the rules that are blocking this transition". Each of today's
detours treated the transition as a problem to hide (glide, dissolve,
separate models). The brief is the opposite: one set of blocks that
transforms continuously through the page.
**Decision (`three/stage.ts` frame()):** the approved prototype's loop is
restored line for line from the artifact:
- two neighbouring scenes blend by scroll inside a ±0.22H band around each
  section top (`w` = smoothstep);
- every part (position, scale, rotation, colour, hub, pulses, lines, map and
  camera) eases toward the blend at 5.2/s;
- labels fade across the band.
Kept from later work: OKLab mixing (continuous, clean mid-tones) and
shortest-arc yaw. One deliberate difference: placement is exact (undamped),
because centred chapters and the bento slot ride with their section, and
damping made them trail and slide. Removed: the dissolve phase machine, canvas
opacity, snapNext and switch points.
**Rules:** none of CLAUDE.md's five rules had to be broken. The owner's
"break all the rules" is recorded as permission that was not needed. Rule 4 is
intact: 3D is lazy, after first paint, aria-hidden, and has fallbacks.
**Tests:** a new "the journey is continuous: the model never fades or jumps
while scrolling" test scrolls the whole page at 11px/frame, requires no fade,
and bounds the per-frame move to <40px. The dissolve, resize-mid-dissolve and
per-section band tests are removed. Playwright workers are capped at 2, because
WebGL renders in software here and the default worker count pushed the load
past 100 and timed tests out. The full suite passes 63/63 in 1.2 min.
**Consequences:** during a boundary the morphing blocks can pass beside or
behind a heading for a moment. That is the prototype's behaviour and the
owner's stated preference.

---

## 2026-09-29 — Design review fix: no empty bento centre without WebGL
**Type:** delivery
**Owner:** Design Reviewer (finding, HIGH), main session (fix)
**Context:** On desktop without WebGL, the bento's 2×2 centre was an empty
hole (CLAUDE.md rule 4, tested fallbacks).
**Decision:** the centre tile holds a line-drawn `IsoGlyph name="disciplines"`
(a 4×2 block field matching the model) with `data-stage-fallback`. It is
visible by default and fades out under `.has3d`, which `SceneCanvas` adds once
a stage is live. This covers no WebGL, no JS and the moment before the lazy 3D
loads. The no-WebGL perf test asserts that the stand-in is visible. The
idle-rest test has a 60s budget (it waits 9s+ by design).
**Note on flaky runs:** two gate runs failed on timeouts at load average 90–115,
caused by parallel Playwright workers against the long-running next-server on
:3000. The same suite passed 64/64 in 41s once the load settled. If the gate
fails only on timeouts, check `uptime` before debugging.
**Design review verdict:** fix first (this item). Everything else passed.
**State:** all three reviews' findings (design, code, 3D) are closed.

---

## 2026-09-29 — Review fixes: 3D Engineer + Code Reviewer on the dissolve/bento
**Type:** delivery
**Owner:** 3D Engineer, Code Reviewer (findings); main session (fixes)
**Findings → fixes:**
- P1 (both): resize mid-dissolve forced a snap, so a new offset/scale/yaw
  appeared at ~25% opacity. `resize()` now sets `first` only when
  `phase === 'idle'`. New test: "a resize during a dissolve does not pop the
  model into view".
- P1 (3D): `label()` allocated a Vector3 per label per frame. It is now pooled
  per SceneState (WeakMap).
- P2 (3D): the dead two-scene `drawCallouts` signature is collapsed to
  `(dom, anchor, fade)`.
- P3 (3D): pausing mid-dissolve could freeze the model half-faded.
  `setPaused` completes the dissolve.
- P3 (code): `PLACE[index] ?? ''` guards a ninth offering.
**Verified:** reduced motion on the production build. The readout updates on
scroll, opacity stays 1 and there is no dissolve. The reviewer's "unverified"
came from a dev server on :3000.
**Code review verdict:** approve with comments (now addressed). **3D verdict:**
no P0. Design review is pending.

---

## 2026-09-29 — Attached models no longer slide after scrolling stops
**Type:** fix
**Owner:** 3D Engineer
**Context:** Owner: "on scroll the 3D models should not jump". Measured: after a
360px flick inside an attached (centred/slot) chapter, the model kept sliding
~250–310px after the page stopped. The two-stage filter on placement made it
trail the scroll, then catch up.
**Decision:** placement is exact (`curOx = tox; curOy = toy`), with no filter.
Scene changes already reposition while invisible (dissolve), so there is no
travel left to smooth. After a flick, the visible model moves 0.0px in build,
moment, pricing and regions; the remaining motion only happens at opacity 0.
New test: "an attached model moves with the page and does not slide after
scroll stops" (<1px visible).
**Also:** within-section filter rate 5.5/s is intentional (it was 5.2 in the
prototype). Three InstancedMeshes (parts, pulses, map) are an accepted exception
to the "one InstancedMesh" wording and predate today.

---

## 2026-09-29 — Scene changes dissolve; full-width bento with the 3D in the centre
**Type:** reversal (of the glide from 18009ed) + decision
**Owner:** 3D Engineer + Designer
**Context:** Owner's screen recording (3.12.22 PM, 69s; frames extracted with an
AVFoundation Swift script because there is no ffmpeg on this machine) showed
the model squashing across the build headline (2.5s), crossing the bento text
(12s), leaving an empty frame at AI→moment (23s), and a half-built cage over
range text (32.5s). The owner: "the transition is being worst — if you want to
rebuild, kindly do it", and "feels lifeless — can we make this a whole-page
bento grid with the 3D animation in the centre with the company logo".
**Decision:**
- *Dissolve (`three/stage.ts` frame()):* `shownIx` (on screen) is separate from
  `domIx` (where the scroll is). On a change: OUT 280ms (opacity² fade, scale
  ×0.94), then the new scene is placed and shaped while invisible
  (`snapNext`), then IN 560ms (ease-out cubic, scale back to 1). Canvas opacity
  is driven inline. There is no flight across the page and no cross-scene morph;
  within-section `sub` motion stays live through the two-stage filter. Labels
  are hidden while OUT.
- *Slot placement:* a section may contain `[data-stage-slot]`; measure()
  centres the model in that box (above its bottom 72px) and sizes it to fit,
  riding with the page as side 'c'.
- *Bento:* build is now side 'c', full width (`max-w-centre`). It is a 4-column
  grid: the 2×2 centre tile holds the slot and the company mark
  (`footer.wordmark` + `meta.since`, via page → SectionRenderer `brand` →
  SequenceSection), surrounded by the eight offerings. Hairlines are real
  borders so the centre stays transparent over the canvas. Hovering a tile
  lifts its block in the centre model. Below lg it is one column and the
  centre tile is omitted (no 3D on phones).
**Test:** `perf/scene.spec.ts` now asserts a dissolve happens (opacity < 0.1) and
that visible frames never move more than 40px.
**Consequences:** the prototype's cross-section "transformation" (morphing one
scene into the next) is retired by owner direction; morphs remain inside a
section. Initial route 173.6 / 180 KB.

---

## 2026-09-29 — Bento redesign after "AI slop" feedback
**Type:** reversal (of the tinted-card bento from earlier today)
**Owner:** Designer
**Context:** Owner: "AI Slop — get inspiration from leading websites". The first
bento used pastel-tinted cards with coloured top borders and an arrow on every
card. That is the template look; impeccable's craft floor lists coloured card
borders as a default to refuse.
**Research:** linear.app and vercel.com were viewed in the browser. Linear's
feature tiles lead with a large line-drawn isometric illustration and put a
small title and one sentence below; there are no fills or coloured borders.
Vercel separates content with hairline rules and type, not cards.
**Decision:**
- New atom `atoms/IsoGlyph.tsx`: eight line-drawn isometric scenes in the 3D
  model's block language (software = a block with its fitted piece lifted
  above; automation = descending steps; integration = two linked systems;
  data = rising columns; platforms = shared floor; hosting = stacked; ai = a
  part inside the system; websites = one flat page). Faces are filled with the
  ground colour and drawn back to front; strokes use currentColor.
- `BentoTile` rewritten: a ruled grid (`gap-px bg-line border border-line`);
  tiles are `bg-ground` and turn `bg-raised` on hover. There are no tints,
  bars or radius, and the arrow shows on hover only.
- The illustration is ink-3 at rest and the hue's contrast-safe *text* value
  on attention, while the 3D lifts the same part. Hierarchy is unchanged.
- The glyph map is keyed by anchor slug in `SequenceSection`.
**Verified:** light, dark, hover (integration → plum drawing and plum block) and
mobile. verify:full green.

---

## 2026-09-29 — Capabilities keeps long copy; takeover claim softened
**Type:** delivery
**Owner:** Content (owner: "go ahead")
**Decision:** build items gain an optional `detail` (the full description) that
/capabilities renders (`item.detail ?? item.body`); the home bento keeps the short
line. The FAQ "Can Wezigns take over software built by another company?" now reads:
"Often, yes. It starts with a review of the code and how it is hosted, so you know
what taking it over would involve before you commit to anything." This replaces
an unconditional "Yes. We take over…" that had no named example (CEO flag). The
hosting detail says the same. The AI tile stays small.

---

## 2026-09-29 — "What we build" becomes a bento grid
**Type:** decision + delivery
**Owner:** Designer (layout), BA (priority, requirements), Content (copy), CEO (claims); owner approved
**Context:** Owner: "can we make this in bento grid style — people would not notice
this… reduce the header but cover all of the offerings".
**Decision:**
- New molecule `molecules/BentoTile.tsx` and `layout: 'bento'` in
  `organisms/SequenceSection.tsx`; `SectionRenderer` `GRID_LISTS` →
  `BENTO_LISTS`. Size carries importance, in content order: feature (Custom
  business software, full width) → large pair (Process automation, System
  integration) → four regular (Data and reporting, Platforms, Hosting, AI) →
  slim last strip (Websites, no tint, no number).
- Each tile is a link to `/capabilities/#slug(title)`; hover and focus drive the
  3D highlight as before. The hue shows as a /5 tint and a 3px top bar; text is
  always ink.
- Below lg, one column, all open.
- Headline "What we build, / at a glance." Tile lines are the writer's, with the
  CEO's cuts: no "more than 90", no takeover clause on hosting, and the
  platforms line as an outcome.
**Owner call:** "Websites" stays in the grid as the smallest tile. The CEO
preferred removing it; the owner answered "yes" to keeping it small. Recorded
as the owner's decision.
**Open (CEO):** the FAQ still says "We take over systems other teams built";
it needs a real example or softening. The AI tile stays small until a shipped
example can be shown. Measurement events `section_view` / `build_tile_click` are
proposed by the BA and not implemented (analytics vendor open).
**Consequences:** the /capabilities page reads the same `build.items`, so its
bodies are now the shorter tile lines. New test: every tile anchor resolves on
/capabilities. verify:full green; initial route 172.5 / 180 KB.

---

## 2026-09-29 — Scene transitions rebuilt: scroll triggers, time animates
**Type:** reversal (of today's placement switches and snaps) + decision
**Owner:** 3D Engineer
**Context:** Owner: "Transitions between the blocks are worst, they are not smooth",
then "at any cost the site is premium, it has to be as smooth as possible".
Measured with a new `?debug3d` readout (`canvas.dataset.dbg` = ox,oy,scale,yaw):
the model jumped up to **984px in one frame** at centred chapters. That was the
>0.6H snap and the hard hand-over at w = 0.55 added earlier today to fix overlaps.
**Options:** keep scroll-scrubbed blending and tune; or switch to scroll-triggered,
time-animated transitions (the premium scroll-site pattern).
**Decision (`three/stage.ts` frame()):**
- Scroll now only picks the dominant scene. Each boundary has one switch point:
  the section top, or 0.3H earlier when a centred chapter is involved, with 4%
  hysteresis.
- Everything glides to the target through a two-stage follow (two first-order
  stages in series make an S-curve at rate 5.5/s; it settles in ~0.8s). This
  covers per-instance position, scale, rotation and colour (in OKLab; `toOk` /
  `fromOk`), hub, pulses, lines, map, camera and placement. There are no
  switches and no snaps.
- Within-section `sub` is still scroll-read, through the same filter.
- Centred models still ride with their section.
- A size ease of up to 35% while travelling, proportional to the remaining
  distance.
- Labels fade out on a switch and back in after ~0.45s.
**Result:** max per-frame move 984px → 27px, jerk ~2000 → ~7. New test:
`perf/scene.spec.ts` "scene hand-offs glide: no jump between frames" (<60px per
frame through moment and regions).
**Also:** the old jerk script used `scrollBy`, which the site's smooth scroll
turns into ~1px/frame, so it measured nothing. Scripted scroll must use
`scrollTo({behavior:'instant'})`.
**Consequences:** a reader who stops mid-boundary sees a finished scene, never a
half-morph. The scroll→blend `w` machinery (windows, wp/wl, dip) is gone.

---

## 2026-09-29 — Session: re-audit fixes + taste-skill
**Type:** session
**Done:** layout tokens `b4f56be`; will-change scoped `6030542`; taste-skill
installed (`design-taste-frontend`, `redesign-existing-projects`; see skills
README); final polish round (desktop and mobile, both themes, reduced motion;
no overflow on 9 route/width pairs), with no fixes needed.
**State:** all re-audit findings are closed and verify:full is green. The expected
re-audit is 20/20, minus what cannot be tested here: 400% zoom, real devices,
and the skill's detector binary.
**Next:** the owner's new request, the bento grid for "What we build", with
designer, BA, content and CEO review.
**Blocked:** hero re-test (research); favicon and OG (assets).

---

## 2026-09-29 — /impeccable optimize: will-change only while drawing (re-audit P3)
**Type:** delivery
**Owner:** 3D Engineer
**Decision:** `.co` / `.cd` no longer carry permanent `will-change`. The loop
toggles `#callouts.live` on state change, and the hint applies only under
`.live` (`globals.css`, `stage.ts`). The callout CSS also uses `--text-callout`,
its letter-spacing token and `--radius-hair`, replacing raw 10px / 2px.
**Verified:** live=true after a scroll, false after 7s idle; verify:full green.

---

## 2026-09-29 — /impeccable layout: layout tokens (re-audit P2)
**Type:** delivery
**Owner:** Designer
**Decision:** new `@theme` tokens in `tokens.css`: `--spacing-gutter`
max(24px,5.4vw), `--spacing-section` clamp(48px,7vh,80px), `--container-measure`
58ch, `--container-measure-tight` 52ch, `--container-centre` 1100px,
`--radius-hair` 2px. They replace the arbitrary classes in 25 files, along with
`ease-[var(--ease-brand)]` → `ease-brand` and `z-[2]` → `z-2`; the split-column
width now uses `var(--spacing-gutter)` inside its calc. The tokens are registered
in the `cn.ts` tailwind-merge theme.
**Verified:** each utility was confirmed in the built CSS with the same value;
verify:full green. No visual change is intended.

---

## 2026-09-29 — /impeccable polish (audit items 7, 8) and run close-out
**Type:** delivery
**Owner:** Designer
**Decision:** reduced motion no longer kills every transition (`globals.css`).
Keyframe animations end at once, and transitions keep only colour and opacity,
so feedback survives and movement is removed. `layout.tsx` themeColor stays
literal (the browser reads it before CSS), with a comment tying it to
`--color-ground`.
**Verified:** one batched round covering desktop and mobile, light and dark, and
reduced motion; overflow and target re-measured on 3 routes × 3 widths (clean);
verify:full green (58 e2e, 18 unit).

## 2026-09-29 — Session: /impeccable audit fixes, one at a time
**Type:** session
**Done:**
- adapt `9f6d558`: 320px overflow, 40px targets.
- optimize + colorize `d4e972c`: company-blue accent, idle rest, clean entry to
  centred chapters.
- typeset `ac6f472`: text scale tokens.
- clarify `0cfe4f9`: form placeholders.
- polish (this commit): reduced motion, themeColor note.
**State:** every audit finding is addressed. verify:full is green; budgets
171.9 / 180 KB initial and 120.3 / 320 KB 3D.
**Next:**
- Re-run `/impeccable audit` to score (expected ≥ 18/20).
- Research to re-test the new hero tag (context.md §7).
- Brand assets for the favicon and OG image.
**Blocked:** favicon and OG (assets), hero re-test (research).

---

## 2026-09-29 — /impeccable clarify: no fake person in the form (audit item 5)
**Type:** delivery
**Owner:** Content Steward
**Decision:** contact placeholders in `content/site.json`:
- name: no placeholder (the label says it);
- email: "name@company.com" (a format hint; was "sarah@agency.com");
- message: "What happens today, where it breaks, and who it slows down." (a
  prompt; was an invented scheduling story).
**Because:** CLAUDE.md rule 1: never stage a fake business fact. A named person
and a made-up case read as staged data, which is the exact failure the study
measured.

---

## 2026-09-29 — /impeccable typeset: one text scale (audit item 3)
**Type:** delivery
**Owner:** Designer
**Decision:** 16 ad-hoc px font sizes are replaced by tokens in
`src/styles/tokens.css`: micro 10, fine 11, caption 13.5, small 14.5, body 15,
title 16.5, large 17.5, subhead 19, logo 21, stat 24. The near pairs merged
upward (13→13.5, 14→14.5, 16→16.5, 17→17.5, 18→19) or downward (15.5→15). The
tokens are registered in `src/lib/cn.ts`'s font-size group. No `text-[Npx]`
remains in src.
**Caught:** the size name `wordmark` clashed with the existing `--color-wordmark`
and turned the header logo grey (axe failed at 3.19:1), so it was renamed to
`logo`. Rule: new text-size names must not match any `--color-*` name.
**Verified:** verify:full is green (axe both themes); visual check of build, faq,
contact and footer.

---

## 2026-09-29 — Accent orange → company blue; 3D rests when idle (/impeccable optimize + colorize)
**Type:** decision (the owner delegated both: "you decide")
**Owner:** Designer + 3D Engineer
**Context:** The audit found the loop drawing every frame, and two oranges on
integration. The owner then asked: "can you change the orange to blue that denotes
the company".
**Decision:**
- *Accent:* the 3D accent is now `--color-blueprint`. `palette.ts` maps
  `P.signal` to it, so pulses, pegs, the missing piece, running modules and the
  footprint lines are all blue. The active callout dot (`globals.css .cd.hot`) and
  the TextLink underline are blue too. Signal orange remains ONLY for warnings:
  Field errors (`text-signal-t`, `border-signal-t`).
- *Content hues:* no item carries `signal` any more. Build "Data and reporting" →
  rose, build "Websites" → pine, range "Industry systems" → rose, integration
  "Legacy" → rose (chosen so neighbours differ).
- *Idle:* the loop rests 6s after the last scroll, pointer, hover or resize (2s
  when paused) and wakes on input. A new `clock` advances only while drawing, and
  pause freezes it, so nothing jumps on wake. New test: `perf/scene.spec.ts` "rests
  when the reader is idle, and wakes on scroll".
- *Entering a centred chapter:* the outgoing model scrolls up with the page from
  window open (`an.oy + probe − winLo`) and hands over at w = 0.55 to the model
  riding under the incoming headline. Jumps over 0.6H are snapped rather than eased
  through text. This fixes evidence→regions, where the map sat on the headline.
**Because:**
- Idle: CLAUDE.md rule 4 (draw on demand) and laptop battery. The only cost is
  ambient drift freezing while nobody is interacting. Throttling instead would
  still cost battery and would look choppy.
- Legacy → rose: a strong warm hue without competing with the accent.
**Consequences:** design.md §5.2 "one signal piece" now reads as one *accent* piece,
in blueprint. Resting parts at 80% keep the 100% accent distinct. Update design.md
and tokens if orange is ever wanted back.

---

## 2026-09-29 — /impeccable adapt (audit items 1, 4)
**Type:** delivery
**Owner:** Designer
**Decision:**
- Hero facts use `pr-4` / `pl-4` below `sm` (`pr-7` / `pl-7` from `sm`), which
  removes the 32px horizontal overflow at 320px (WCAG 1.4.10);
  `organisms/HeroSection.tsx`.
- The small Button is `min-h-10` (40px), up from 38px; this covers the header CTA
  and "Send your security questions" (`atoms/Button.tsx`).
- The header wordmark link has `py-2`, so it is 42px tall, up from 34
  (`organisms/SiteHeader.tsx`).
**Left:** inline "Work" text links are 34px wide. They are exempt as inline links
under WCAG 2.5.8, and their height is 40.
**Verified:** re-measured at 320, 375 and 1440 on /, /work and /capabilities. No
overflow, and no interactive element under 40px except exempt or hidden ones.

---

## 2026-09-29 — Hero sub on two lines
**Type:** delivery
**Owner:** Designer
**Context:** Owner: "Built around how you work, ready for what comes next. — keep in
another line".
**Decision:** `hero.sub` may contain `\n`; `organisms/HeroSection.tsx` renders
each line as a block span inside the one `<p>`, so the copy decides the break and
the paragraph stays a single element for readers and search.
**Consequences:** other text fields do not honour `\n`. Extend the same pattern
only where it is asked for.

---

## 2026-09-29 — Hero tests follow the tag; a red commit fixed
**Type:** reversal (test assertions)
**Owner:** Test Engineer role (main session)
**Context:** Commit 64260a7 (hero tag) went in with verify:full red: my command
piped the output through grep, which hid the exit code. Two tests pinned the old
H1 wording: `tests/e2e/journey.spec.ts` (hero states the category) and
`tests/perf/scene.spec.ts` (no-WebGL completeness).
**Decision:** journey now asserts the study's actual rule: "custom software" is
visible above the fold, in the H1 or the sub. The no-WebGL test asserts that the H1
is visible and that the category text renders. Both are green.
**Consequences:** from now on the gate is checked by its exit code, not by
grepping the output.

---

## 2026-09-29 — Hero becomes a tag: "Systems that grow with you."
**Type:** decision (reversal of the measured hero H1)
**Owner:** Owner
**Context:** The owner wanted the hero to say, in a line people read and remember,
what we do and what the customer gets: "something like a tag". Options were
weighed on reading behaviour: first 2–3 words read, self-reference, many
second-language readers across 11 countries, short parallel phrases recalled.
**Decision:** `hero.headline` is now "Systems that / grow with you."; `meta.tagline`
matches, so `<title>` is "Wezigns — Systems that grow with you." (37 chars, down
from ~74 and truncated). The sub names the category for comprehension and search:
"Wezigns builds custom software that replaces the spreadsheets, message threads
and manual steps you have outgrown. Built around how you work, ready for what
comes next."
**Because:** the owner's call; it is short, plain and customer-facing.
**Consequences:** this REPLACES the study-measured H1 "Custom software, built
around how your business already works." (context.md §3, 26%→80% five-second
comprehension). The new H1 does not name the category; the sub does. context.md
§7 requires a five-second re-test of any hero change, so the research analyst
should run it. If comprehension drops, the fallback is to restore the old H1 and
keep the new sub.

## 2026-09-29 — /impeccable audit (launcher not run; manual checks)
**Type:** session
**Done:** the impeccable audit was run by hand (the skill's binary launcher was
not executed); findings were reported to the owner. Only the hero copy changed.
**State:** verify:full is green.
**Next (from the audit):**
- P1: the home page overflows 32px horizontally at 320px. The hero facts row is
  3 columns with `pr-7` / `pl-7` (`organisms/HeroSection.tsx`); WCAG 1.4.10.
- P1: the idle render loop.
- P2: 16 ad-hoc px font sizes; the header CTA and the small secondary button are
  38px tall (the project minimum is 40); the fake-person form placeholders
  ("Sarah Jenkins", "sarah@agency.com"); signal orange on integration.
- P3: the global 0.01ms reduced-motion kill; the themeColor hex duplicated in
  layout.tsx.
**Blocked:** hero re-test (research), loop decision (owner).

---

## 2026-09-29 — Session: hero options for search (nothing applied)
**Type:** session
**Done:** the SEO Specialist and Content Steward each drafted hero variations
(read-only). No files changed.
**State:** both recommend keeping the measured hero H1 (context.md §3,
26%→80% comprehension) and taking the search value from:
- `<title>`: "Custom Software Development Company Since 2012 | Wezigns", 58 chars. The
  current title is ~74 chars and gets truncated.
- `meta.description`: "Wezigns builds custom business software and system
  integrations that replace spreadsheets, since 2012, across eleven countries."
- The hero sub: "Wezigns builds custom business software that replaces the spreadsheets,
  message threads and manual steps a growing business has outgrown."
H1 candidates offered, low→high risk: "Custom business software, / built around…";
"A custom software development company / building around…, since 2012."; "Custom
software that replaces spreadsheets, / built around…"; "Custom software / that
replaces the spreadsheets your business has outgrown."; "Software built around
your business, / not the other way round."; "The system that connects / the
software your business already runs on."; "Custom software / for businesses in
India, Singapore, the UAE and eight more countries."
**Next:** apply the owner's choice. The title comes from `meta.name` +
`meta.tagline` in `src/app/layout.tsx`, so changing the title means either a new
`meta.title` field or a layout change. Any H1 beyond the low-risk pair needs a
5-second re-test (context.md §7).
**Blocked:** the owner's choice.

---

## 2026-09-29 — Pricing block reduced to one statement
**Type:** decision
**Owner:** Owner
**Context:** Owner: "remove all the other contents, I feel it is unnecessary".
**Decision:** pricing keeps only the eyebrow "How we price" and the headline "We
price the outcome, not the hours." The lead, the three points and the note are
removed from `content/site.json`. `BOOST.pricing` is 0.3 → 0.5, so the model
fills the space under the shorter block.
**Consequences:** "No build starts before that number is agreed." (a tuned line,
context.md §4) no longer appears on the home page. The written-agreement
promise now lives only in the FAQ cost answer and how/Shape. The research
analyst should know a measured supporting line was removed.

---

## 2026-09-29 — Pricing headline: "We price the outcome, not the hours."
**Type:** decision
**Owner:** Owner
**Context:** Chosen from the writer and SEO options.
**Decision:** `pricing.headline` is now lead "We price the outcome," and accent
"not the hours.". The owner's choice also confirms the claim that Wezigns prices
by outcome, not by time, so it may now be stated elsewhere. Change-request
pricing ("we price the change too") is still unconfirmed.
**Consequences:** any copy implying hourly or day-rate billing now contradicts the
site. The FAQ cost answer is consistent (it says pricing depends on scope, not
the technology).

---

## 2026-09-29 — Pricing block made crisp; headline options pending owner
**Type:** delivery
**Owner:** Content Steward + SEO Specialist, fact-checked by the main session
**Context:** Owner: "rewrite this block — remove the obvious things and make it
crisp"; "content writer and SEO analyst give me few options for the headline".
**Decision:** "scope, price and timeline in writing" was said three times; it is
now said once. The new text:
- Lead: "You know the price before anything is built."
- Points: "Understand the system first" / "…what the first version must do.";
  "Price what it must do" / "The price follows the outcome the system has to
  deliver."; "Agree it in writing" / "Scope, price and timeline in one document."
- Note: unchanged (tuned line, context.md §4).
- Headline: unchanged, pending the owner's choice.
**Rejected from the writer's draft:** "Changes get a new number / we price the
change too" (a change-request policy) and "Price the outcome, not the hours" (a
no-time-billing claim; the old copy said the price covers the work it takes).
Both are public commitments the brief does not make, so they need the owner or
the CEO agent.
**Headline options offered:** SEO: "Price agreed in writing, / before any build
starts." · "How custom software / actually gets priced." (best for answer
engines) · "Scope first, / price second, in writing." · "No price until / we
understand the system." · "We price the system, / not a rate card." (needs owner
confirmation). Writer: "You see the number, / before we touch any code." ·
"Priced once we understand / how your business actually runs." · "No number
until we know / what we are pricing." · "Priced on what it does, / not what it
took to build." and "We price the work, / not the hours in it." (both need
confirmation: billing claim).

## 2026-09-29 — Session: pricing copy
**Type:** session
**Done:** `content/site.json` (pricing).
**State:** verify:full is green.
**Next:** apply the owner's headline choice to `pricing.headline`.
**Blocked:** headline choice and the billing-model claims (owner).

---

## 2026-09-29 — Principles block stands lower; lead-placement limited to centred hand-offs
**Type:** delivery + partial reversal
**Owner:** 3D Engineer
**Context:** Owner: "they need to have based below" (principles).
**Decision:** principles `look` is now `2.2 + grow·1.35` (was `1.2 + grow·1.45`), so
the base sits at ~0.8H at every step. Also found while capturing: the early
placement weight `wp`, added earlier today, applied to side↔side hand-offs too.
Going principles→range, it put the model on the outgoing principles text. `wp`
now applies only when a centred chapter is on either side; side↔side follows
`w` again, as in the prototype (`three/stage.ts`).
**Consequences:** side↔side crossings are back to the prototype's behaviour.
Centred hand-offs keep today's rules.

## 2026-09-29 — Session: principles base
**Type:** session
**Done:** `three/states.ts`, `three/stage.ts`.
**State:** verify:full is green.
**Next / Blocked:** unchanged.

---

## 2026-09-29 — Tech labels point at their plates; hero lead 50ch
**Type:** delivery
**Owner:** 3D Engineer + Designer
**Context:** Owner: "See where they are pointing" (tech stack leaders), and set the
hero lead to `max-width: 50ch` in devtools: "change this size of the width".
**Decision:** tech labels are now anchored at the middle of each plate's right
face `(sl + 1.2, y, 0)`, replacing the rounded front corner `(…, 1.2)`, whose
anchor floated in the air and read as the plate below
(`three/states.ts`). The hero sub is `max-w-[50ch]`, up from 34ch
(`organisms/HeroSection.tsx`).
**Consequences:** the hero lead now wraps to two lines at 1440.

## 2026-09-29 — Session: tech labels, hero width
**Type:** session
**Done:** `three/states.ts`, `organisms/HeroSection.tsx`.
**State:** verify:full is green.
**Next / Blocked:** unchanged.

---

## 2026-09-29 — Copy rewrite: technology-agnostic spine; SEO-verified
**Type:** delivery
**Owner:** Content Steward (writer) → SEO Specialist (verify) → main session (fact check)
**Context:** Owner: "Rewrite the whole blocks — content writer — verify by the SEO
agent. I want to write a technology agnostic, and few others."
**Decision:** `content/site.json` was rewritten around a technology-agnostic spine:
build items 0/2; range, how (Shape) and pricing point 0; the work heading; the tech
headline, now "The technology fits the problem, not the other way round.", with
AWS, Google Cloud, Stripe and Razorpay kept in `tech.lead`; tech pillar 0 "Chosen
for the problem, not the vendor"; FAQ 1/3/4/5; case titles and prose (all
figures unchanged). Supporting themes were drawn only from the brief: understand
before technology, no lock-in and handover. The hero, the hook, all "Tell us
what is not working" instances, principles, AI, evidence, the regions list,
tech.layers and integration titles were deliberately left unchanged.
**Fact check (main session) removed:** "five spreadsheets" (invented count),
"integrations to the systems sellers already used" (invented detail), "chosen for
the load, not by default" (invented rationale), and "on any stack" on
integration and in the takeover FAQ (an unmade promise).
**SEO:** a blocker was fixed. `meta.description` still said "India, Singapore
and the UAE" and fed the meta description, OG and Organization JSON-LD. It now
reads "Wezigns builds custom systems that replace spreadsheets and manual work
for growing businesses, since 2012, in eleven countries."
**Open (SEO):** the homepage `<title>` is ~74 chars (tagline), which is
over ~60; that needs a brand call. Optionally put "products" back in the work H2.
**Consequences:** the CEO agent should sign off on the new case titles, which
are claims in public.

## 2026-09-29 — Session: copy rewrite
**Type:** session
**Done:** `content/site.json`.
**State:** verify:full is green.
**Next:** owner review of the copy; decisions on the title length and the idle loop.
**Blocked:** unchanged.

---

## 2026-09-29 — Scene transitions: no overlap, no muddy colours; how base lower
**Type:** delivery
**Owner:** 3D Engineer
**Context:** Owner: "check this transformation on this blocks". The moment cube
sat on the incoming "Every system we build…" heading and went muddy mid-blend.
Then: "the base has to start a little bit below" (how).
**Found:** by stepping frames through every centred boundary (moment,
pricing, regions):
(a) placement followed the shape blend `w`, so a centred model was still
mid-page when the next heading arrived;
(b) RGB lerping of hues (pink→green = olive);
(c) entering a centred chapter pulled the model onto its full-width headline;
(d) pricing's text is taller than the screen, so its model centred on its
last line.
**Decision (`three/stage.ts`):**
- Blend windows: when a centred chapter is involved, the window opens early
  (−0.45H → +0.12H around the boundary). Side↔side keeps ±0.22H.
- `wp` (placement and size) leads the shape blend and reaches the new half by
  w = 0.45.
- Centred models are attached to their section's scroll (`oyOf`) and ride with
  their text like an image.
- Entering a centred chapter: the model stays in the side half until w = 0.55,
  then hands over.
- Leaving one: it never goes above the attached line (the lower of the two).
- The centred model is always at least 0.25H below its text.
- Colours are no longer mixed by scroll. They switch to the dominant scene at
  w = 0.5 and ease in time (Kc, ~0.3s), so a paused scroll never shows an
  off-palette colour.
- `curOy` tracks faster (14/s) so attached models follow the page.
- How: the camera aims at 1.85 while only the footprint is down, easing to 1.25
  as the block builds (`three/states.ts`).
**Consequences:** between a side scene and a centred one, the model briefly
leaves the frame and rises with the new section. That is intentional: it is
the only position that never meets a full-width headline.

## 2026-09-29 — Session: transitions and how base
**Type:** session
**Done:** `three/stage.ts`, `three/states.ts`.
**State:** verify:full is green. Frame captures of moment→principles,
how→pricing→evidence→regions→work and the how stages were checked at 1440×820.
**Next:** the same frame check at 1000px and 1920px; the owner's call on the idle
render loop.
**Blocked:** unchanged.

---

## 2026-09-29 — Resting colour at 80%
**Type:** decision
**Owner:** Designer
**Context:** Owner: "reduce the color little bit down so that it is 80%".
**Decision:** `restShare` is now `min(0.8, 0.5 + 1.2·s)` (new `REST_CAP = 0.8` in
`three/states.ts`). Regions markers and the principles pine base, which used the
full hue directly, now also rest at 80%. The part pointed at still goes to 100%.
design.md §5.1 is updated.
**Because:** 100% read as too loud. At 80% the colours are still the brand hues
rather than pastels, and they leave 20% of headroom for the attention state.
**Consequences:** the attention contrast is 100% against 80%, plus lift and label.

## 2026-09-29 — Session: resting colour to 80%
**Type:** session
**Done:** `three/states.ts`, `.claude/design.md`.
**State:** verify:full is green; checked in screenshots at 1440.
**Next / Blocked:** unchanged from the previous close-out.

---

## 2026-09-29 — Design colours on all blocks; white and pastel removed
**Type:** reversal (of the pastel curve and the white checker fills)
**Owner:** Designer
**Context:** Owner: "use orginal design colors on the 3d blocks, reduce the pastal
and white colors".
**Decision:** in `three/states.ts`, the hue curve is now `min(1, 0.62 + 1.2·s)`.
The white `P.model` fills are replaced with brand hues in the monolith (hero,
moment, contact), the FAQ cube and evidence. Principles has a pine base with
blueprint growth. The work plates show their own hue (inactive ones are 28%
toward white). Dimmed regions markers are 30% toward white, down from 70%.
design.md §5.1 is rewritten.
**Because:** the owner wants the brand palette to carry the model. Attention still
reads through the lift and the label.
**Consequences:** contrast on attention is now weaker by colour alone. If a
review finds the pointed-at part does not stand out, raise the lift rather than
bring white back. Signal-coloured content hues (a discipline on build, Legacy on
integration) are now very visible, and they remain an open rule-2 question.

---

## 2026-09-29 — Session: design colours on 3D
**Type:** session
**Done:** `three/states.ts`, `.claude/design.md` §5.1.
**State:** verify:full is green. A contact sheet of all 15 scenes was checked
at 1440.
**Next:** the owner's call on the signal-hued content items and the idle render loop.
**Blocked:** unchanged.

---

## 2026-09-29 — Skill review; world map for regions; colours pop
**Type:** delivery
**Owner:** Designer + 3D Engineer
**Context:** The owner asked for a review of the site with the new skills, then
"make this in world map with the blocks representing the countries" (regions) and
"make the colours to popout more".
**Review (baseline-ui, fixing-accessibility, fixing-motion-performance,
review-animations, mobile-native, fixing-metadata):**
- *Fixed:* form inputs are 16px below lg, because iOS Safari zooms the page on
  focusing a smaller input (`molecules/Field.tsx`); tap highlight is off, with
  focus-visible kept (`globals.css`); body paragraphs use `text-wrap: pretty`;
  hover feedback is now 200ms, down from 300–350ms (Button colour and arrow, nav
  underline); the Reveal rise is 12px, down from 18px; ESLint ignores `.claude/**`
  because vendored skill JS was failing lint.
- *Open, owner or 3D-engineer call:*
  (1) The WebGL loop draws every frame unless paused (`stage.ts` loop). That
  breaks CLAUDE.md rule 4 (`frameloop="demand"`) and costs battery on an idle
  page. Fix option: stop drawing after ~6s without scroll or pointer input, which
  freezes the ambient pulses and sway.
  (2) There is no favicon or app icon, and it needs a brand asset.
  (3) There is still no OG image.
  (4) The DisciplineRow accordion animates grid rows over 550ms. That is a layout
  animation on a small surface; it is acceptable, but it is the slowest
  interaction on the site.
  (5) Signal orange appears more than once on integration (Legacy and the pulses).
**World map:** new `three/world.ts` holds a hand-drawn 5° land mask (80°N–55°S) and
a lat/lon point for each country. `stage.ts` adds one InstancedMesh of low tiles
(`o.map` scales them up out of the ground). `states.ts` regions places one block
per country at its point. The blocks share a height, because different heights on
a map would read as a quantity and there is none to show. The country list in the
centred prose now uses `LayerList`, so pointing at a name lifts its block.
**Colour:** tone mapping changed from ACES to `NeutralToneMapping`, exposure 0.92.
design.md §5.1 notes it.
**Consequences:** 3D chunk 120.1 KB (+0.6). Countries not in `COUNTRY_POINTS` get
no marker, so adding a country to `regions.layers` needs a point in `world.ts`.

---

## 2026-09-29 — Session: skill review, world map, colour
**Type:** session
**Done:** `molecules/Field.tsx`, `atoms/Button.tsx`, `atoms/Reveal.tsx`,
`organisms/SiteHeader.tsx`, `styles/globals.css`, `eslint.config.mjs`, new
`three/world.ts`, `three/stage.ts`, `three/states.ts`, `three/scene-data.ts`
(regions boost 0.44), `organisms/LayerList.tsx`, `organisms/ProseSection.tsx`,
`.claude/design.md`.
**State:** verify:full is green: 18 unit tests and 56 Playwright tests. Budgets:
171.9 / 180 KB initial, 120.1 / 320 KB for 3D. Map verified in both themes at 1440.
**Next:** the owner's decision on the idle render loop (review item 1). Then the
favicon and OG image once brand assets exist. Check the map at 1000px and 2000px.
**Blocked:** favicon/OG (brand asset), Legacy hue, loop behaviour — all owner.

---

## 2026-09-29 — Session: more skills installed (Emil Kowalski, master5d)
**Type:** session
**Done:** 8 skills from `emilkowalski/skill` and 4 from
`master5d/claude-design-skills` are in `.claude/skills/`, with audit notes, the
list of what was skipped and why, and licence status in `.claude/skills/README.md`.
Both repos were cloned and read rather than installed with `npx skills add`, so
no npm CLI was executed.
**State:** 21 entries in `.claude/skills/`. No code changed; verify:full was
last green at commit 1ac7f01.
**Next:** the owner's call on Legacy's signal-orange hue; optionally run
`review-animations` on `atoms/Reveal.tsx` and `molecules/CaseTabs.tsx`.
**Blocked:** unchanged.

---

## 2026-09-29 — Bright resting colours; tech block cut down; impeccable skill
**Type:** delivery
**Owner:** Designer + Content Steward
**Context:** The owner asked for "Use the bright colours" on the model, and for
the tech block to be "more concise" and its content "optimised". Then: install
`pbakaus/impeccable`.
**Decision:**
- *Colour:* the resting hue curve is now `min(1, 0.2 + 2.2·s)` (`three/states.ts`),
  so resting parts show 86–100% of their brand hue. The build rest share went
  from 0.82 to 0.55 dim, integration's dim-on-highlight from 0.72 to 0.85, and
  tech's from 0.3 to 0.12, so pointing at a part still stands out.
  design.md §5.1 is rewritten; this reverses the pastel entry from 2026-09-28.
- *Tech copy (`content/site.json`):* a one-line lead; pillars cut from 4 to 2 (the
  two cut repeated the lead); trust items cut from 4 to 3 (monitoring and review
  merged); the duplicate "Talk to us about your stack" link removed, so the block
  has one CTA; the nine layers are kept because they map to the 3D plates.
- *Skill:* `.claude/skills/impeccable/` installed; audit notes are in the skills README.
**Consequences:** the Legacy group on integration carries `hue: "signal"` in
content, so at full brightness it now reads as solid orange next to the orange
pulses. Rule 2 (one signal) needs an owner call: move Legacy to rose, or keep it
as the deliberate exception.

---

## 2026-09-29 — Session: bright colours, concise tech block, impeccable
**Type:** session
**Done:** `three/states.ts`, `.claude/design.md` §5.1, `content/site.json` (tech),
`.claude/skills/impeccable/`, `.claude/skills/README.md`.
**State:** verify:full is green: 18 unit tests and 56 Playwright tests. Budgets:
171.9 / 180 KB initial, 119.5 / 320 KB for 3D. The impeccable launcher has not been
run.
**Next:** the owner's call on Legacy's orange. Optionally run `/impeccable audit`
on the home page as a second design-review pass.
**Blocked:** as before (owner decisions), plus Legacy's hue.

---

## 2026-09-29 — Integration labels sit beside their parts; tech stack is labelled
**Type:** delivery
**Owner:** 3D Engineer + Designer
**Context:** Owner reported an overlap on the integration block: the right-hand
module ran under the reading column, and the column-style callouts drew every
leader line across the model. The owner also asked to "make this block better" for
the tech block, which was an oversized, unlabelled pastel stack.
**Options:** keep the label column and shrink the model; or give radial scenes
their own label layout.
**Decision:** a new `beside` label mode (`SceneState.beside`, handled in
`stage.ts` `drawCallouts`). Each label sits just outside its own group, pushed away
from the hub. If there is no room it becomes a caption under the group, and it
never enters the reading column. There are no leader lines. The ring is 3.1 → 2.7
and `BOOST.integration` is 0.92 → 0.64. For tech: nine thin plates with air between
them, one per named layer (`TECH` from `tech.layers`), labelled in the right-hand
column. The new client `organisms/LayerList.tsx` lights a plate when its name is
pointed at. `BOOST.tech` is 0.92 → 0.74.
**Because:** a radial model has no single side for a label column. Every leader
crossed the model, so the labels read as noise rather than a diagram. The tech
plates now show the same nine names as the text, so the model explains something
instead of decorating the page (study finding, design.md §5).
**Consequences:** the model's pixel size scales with viewport height and the text
column with width. Wide model shapes need a lower boost, so check them at 1280×760,
not only at large sizes. Verified at 2000×1000 and 1280×760.

---

## 2026-09-29 — Session: integration overlap, tech block redesign
**Type:** session
**Done:** `three/states.ts` (beside flag, integration ring and label anchors, tech
rebuilt as a labelled exploded stack, `LABELLED.tech`); `three/stage.ts` (beside
layout and fallback, no gutter for beside scenes); `three/scene-data.ts` (`TECH`,
boosts); new `organisms/LayerList.tsx`; `organisms/ProseSection.tsx` uses it.
**State:** verify:full is green: 18 unit tests and 56 Playwright tests. Budgets:
172.0 / 180 KB initial, 119.6 / 320 KB for 3D.
**Next:** a design-reviewer pass on both blocks in dark theme and at 1000px, where
a caption may hide if it would touch the text. The signal-orange connector pulses
on integration are still the open §5.2 question.
**Blocked:** unchanged from the previous close-out (owner decisions).

---

## 2026-09-29 — Motion: react-mini only, for reveals and the case indicator
**Type:** decision
**Owner:** Designer + 3D Engineer (budget)
**Context:** Owner asked to install the `motion-framer` skill and use it for smooth animation.
The initial route already stood at 169.0 / 180 KB brotli.
**Options:** full `motion` component (37.2 KB), `LazyMotion` + `domAnimation` (25.8 KB),
`motion/react-mini` `useAnimate` (2.9 KB), or stay CSS-only.
**Decision:** `motion@12.23.12`, imported only as `motion/react-mini`. Two uses:
`atoms/Reveal.tsx` (each section body's children fade up 18px in a 70ms stagger, 0.6s,
brand ease) wired in `organisms/Section.tsx`, and a gliding indicator in
`molecules/CaseTabs.tsx` (translate + scaleX on a 1px bar, tinted to the case hue,
replacing the per-tab border).
**Because:** only the mini build fits the budget. Transform/opacity only stays on the
compositor. Reveal hides nothing that is already on screen, nothing with JS off, and
nothing under reduced motion or pause, so it can only cost an animation, never content.
**Consequences:** initial route 171.9 / 180 KB, leaving 8.1 KB of headroom. Importing
`motion/react` or `framer-motion` is now a budget failure. Recorded in `architecture.md`
§1 and `.claude/skills/README.md`. Also corrected the stale R3F row in `architecture.md` §1.

---

## 2026-09-29 — Session: motion-framer skill, reveals, case-tab indicator
**Type:** session
**Done:** `.claude/skills/motion-framer/` installed (MIT, scripts audited);
`motion` added; new `src/components/atoms/Reveal.tsx` (exported from atoms);
`organisms/Section.tsx` wraps body in `<Reveal>`; `molecules/CaseTabs.tsx` rewritten
with a gliding indicator; new `tests/e2e/motion.spec.ts` (reveal ends visible,
reduced motion never hides, indicator lands under the active tab);
`architecture.md` §1 and the skills README updated.
**State:** `pnpm verify:full` is green, with 49 Playwright tests plus the 7 new motion
tests passing across three projects. Budgets: 171.9 / 180 KB initial, 119.3 / 320 KB for 3D.
Headless screenshots confirm the stagger and the pine indicator under "Singapore · Tourism".
**Next:** design-reviewer pass on the reveal timing in both themes. If the owner wants
more motion, the 8.1 KB of headroom must come from `useAnimate` only.
**Blocked:** on the owner. Signal-orange pulses and pegs vs design.md §5.2; the
AI-crawler stance; the form transport (the form currently delivers nothing); the
five business facts; the first proof sitting around screen 12; no next step after
pricing; case numbering on /work; the "sarah@agency.com" placeholder; the OG image;
Lighthouse CI.

---

## 2026-09-28 — Countries, pricing, build grid, colour, and the BA's bug findings
**Type:** delivery
**Owner:** Designer + Content Steward + 3D Engineer

**New fact from the owner — countries served (11):** India, USA, UK, Singapore,
Thailand, Australia, Netherlands, UAE, Malaysia, Saudi Arabia, Czech Republic.
- A new centred chapter `#regions` after `#evidence`: "Work delivered for
  clients in eleven countries." with the list beneath, and its own scene —
  eleven markers on a shared plate. Marker heights encode nothing.
- `hero.facts` and `evidence.rows` now read "11 countries" (one full list, not
  three copies). `meta.markets` and the footer markets carry all eleven, so the
  Organization JSON-LD `areaServed` lists eleven. `context.md` §1 and CLAUDE.md
  updated. The study cohorts in §2 are unchanged — that is who was studied.

**Pricing as a centred chapter** at the owner's request, like the hook: large
centred headline, the three steps in one row, then the note. The lead was cut to
its first sentence; removed: "The number comes out of the Shape stage, once we
understand your process — so it is priced on the system you actually need rather
than on a rate card." Kept verbatim, asserted: "No build starts before that
number is agreed." (a measured supporting line).

**Centred-chapter model placement is now computed**, from where that section's
text ends, instead of a fixed offset. Three hand-tuned values (-0.34, -0.24,
-0.13) had each suited one section on one screen height. **Also found:** the
scale formula caps a centred stage at 1.1 for any boost above ~0.5, so two
earlier "shrink the model" edits changed nothing at all. Noted in scene-data.

**What we build → a two-column grid.** The eight-step sticky sequence (~2.7
screens of scroll) became a static grid of all eight disciplines, mirroring the
model's own 4×2 layout. Its callout column was removed — eight labels with
crossing leader lines — since each item now carries its swatch. design.md §5.3
updated.

**Brand colours at rest.** design.md §5.1 revised from "neutral by default" to
"brand pastel by default, full colour on attention": resting hue shares are
lifted halfway toward 62%; the pointed-at part stays at 100%. Signal removed
from the resting rotation so the lift cannot multiply orange.

**3D growth from the bottom:** principles' new layers rise out of the base, and
the how-we-build modules rise out of the footprint, rather than dropping in from
above.

**Business Analyst review (9dcd712) — four bugs confirmed in source and fixed:**
1. `/capabilities` passed `item.body` for range rows, which carry `systems`, so
   the "thirty systems" page showed five bare titles.
2. Footer links to `/capabilities#custom-business-software`, `#system-integration`
   and `#websites` pointed at anchors that did not exist. Blocks now carry
   slugged ids.
3. CTA `topic` codes were never read, so "preselects the subject" did not
   happen. Buttons emit `data-topic`; the form maps it through
   `contact.topicCodes` (in content, asserted against the chip labels).
4. The header CTA was sourced from `hero.actions[0]`; reordering the hero would
   have changed it site-wide. Now `nav.cta`.

**BA findings NOT acted on — they need the owner:** the form delivers nowhere
while three places promise a one-working-day reply; none of the five
business-fact components exist (context.md §3/§6 claim they appear when a slot
is filled — they do not); first outcome proof is now ~screen 12 after the hook
removal; pricing has no next step; several checkable claims ("zero unplanned
downtime", "data stored in-country", "still running for the clients who
commissioned them"); case numbering 02/01/03/04 visible on /work; the placeholder
"sarah@agency.com" uses the word agency; the OG image does not exist. Also: the
header CTA is hidden below 640px — **this matches the prototype**, which hides it
below 620px, so it is a parity choice rather than a regression.

---

## 2026-09-28 — Owner review round: composition, CTAs, FAQ, form, highlight
**Type:** delivery
**Owner:** Designer + 3D Engineer + Content Steward

**Removed at the owner's request** (values kept here so they can be restored):
- Hook CTA — `{label: "Read what changed in each one", href: "/work"}`
- Range CTA — `{label: "See all thirty systems", href: "/capabilities#range"}`
- **FAQ 13 → 6.** Kept by evidence, not taste: *What does Wezigns do* (the
  category answer the five-second test hinges on), *security* (cohorts B/C,
  blocker #5), *take over software built elsewhere* (the gatekeeper's legacy
  question), *small businesses* (carries "Sometimes it is not, and we will say
  so", the highest trust-per-word line — asserted in the edit so it could not
  be dropped), *cost* (blocker #1, ~45 of 200), *how long* (cohort B delivery
  risk). Removed: internal systems, automation, integrations, scalability,
  hosting, websites, where we operate — each answered elsewhere on the page.
  Full text is in git history. **Cost:** the FAQPage JSON-LD shrinks with it, so
  fewer answers are extractable by AI engines (see geo-specialist).

**Composition:**
- The AI statement takes a full screen and centres vertically — measured: text
  midpoint at exactly the viewport midpoint.
- The hook had been composed around proof figures and a CTA, both now gone, so
  the prototype's `-0.34` vertical offset dropped the model to ~84% of the
  viewport and the fold cut it off. Offset now `-0.24`, model scale 0.72 → 0.6,
  headline anchored at 18vh.
- Sticky sections (build, range, work) had `lg:py-0`, stripping their top
  padding too, so each heading butted against the section above (~45px).
  Now `lg:pb-0`: 153–189px, as the prototype's `.ch` padding gives.

**Two real 3D bugs the owner found by looking:**
1. *"People is not pointing there."* The range label was anchored at a fixed
   `y = 0.3` while the selected row lifts 0.34, so the dot stayed behind and
   pointed at the row underneath. The prototype has the same bug. Label now
   follows the lift.
2. Deeper: People never lit at all. The highlight was **one slot for the whole
   page**; every sequence wrote to it on mount, integration last, and range only
   re-asserted when its row changed — so its first row never reached the model.
   The channel is now keyed by scene.

**Form, grouped as the prototype groups it:** name and email share a row,
full-width submit, the reply promise in one ruled block with its swatch, and the
requirement stated once (`contact.requiredNote`) instead of "(required)" on
three labels — still WCAG 2.2 SC 3.3.2. Focus is a blueprint border plus ring.

**CTA transitions:** link buttons carry the prototype's arrow, which slides 4px
on hover over 350ms; a press settles to 98%. **Caught by measuring rather than
looking:** the press first transitioned `transform`, but Tailwind v4's scale
utilities set the standalone CSS `scale` property, so it snapped. Now
transitions `scale`. Same lesson as the arrow check: read the property that
actually changes.

**State:** verify:full green — 18 unit, 49 Playwright, axe clean, 168.8 KB /
119.1 KB. Business Analyst review requested next.

---

## 2026-09-28 — Parity pass against the prototype: nine findings, all fixed
**Type:** delivery
**Owner:** Design Reviewer (review) · Designer + 3D Engineer (fixes)
**Context:** The owner asked for every component to work the same as the
approved prototype. The design reviewer compared both builds section by section
— with cache-busting and instant scrolling this time, the two traps that
corrupted the previous review — and returned nine findings. Each was checked
against the prototype's source before acting on it, then verified in the live
page by DOM measurement.

1. **Integration was scroll-gated; the prototype's is a static list.** Added a
   `static` mode to `SequenceSection`: every row open, no scroll track, hover
   still lights the matching part of the model. Section height 1980px → 826px
   (prototype 785px), which also cured the bleed into the tech section below.
2. **No scroll-spy.** The nav now underlines the link whose target section is
   in view — the prototype's rule, exactly: current section = last one whose top
   has passed mid-viewport, and a link is current only if that is its target.
3. **Header transparent at the top**, background from 20px of scroll, as the
   prototype's `.top.stuck`.
4. **Wordmark** lowercase `wezigns` with `SINCE 2012`, from content
   (`footer.wordmark`, `meta.since`). The accessible name stays "Wezigns" — the
   entity name for search and AI citation.
5. **Controls** reordered to pause, then theme; both circular. The pause toggle
   had been restyled last round **but that edit failed silently** — the third
   unasserted edit in this project to do so. Rewritten as a whole file.
6. **No numeric prefixes** on the discipline rows; the prototype has none.
7. **Stages** carry `01 / 04` and a labelled output line, and the step in view
   gets a 2px rule in its hue instead of a colour chip.
8. **Range counts** read `6 systems`.
9. **Case tags** in sentence case.
**Content additions:** `range.countUnit: "systems"` and
`how.outputLabel: "Output"`. The prototype hard-codes both; the project rule is
no visitor-readable string in a component.

**Rule adopted:** a scripted edit is either asserted or the whole file is
rewritten. Three silent failures — the range systems list, the pause toggle, and
an earlier toggle pass — all came from string replacements that matched nothing
and reported success.

**Reviewer's own caveats, still open:** it did not cover the dark theme, reduced
motion, no-WebGL, the topic chips, a keyboard pass, or a side-by-side mobile
comparison. The automated suite covers several of these (axe in both themes,
the reduced-motion and no-WebGL perf tests, mobile layout), but not a visual
side-by-side. A second pass on those axes is the next review.

**Noted, not changed:** the integration scene shows ten signal-orange pulses at
once, and the build scene four orange pegs. Both are in the approved prototype
and both contradict design.md §5.2's one-signal-per-screen rule. Still waiting
on a decision.

---

## 2026-09-28 — Removed the proof statistics from the hook screen
**Type:** decision
**Owner:** CEO (owner's request) · Content Steward
**Context:** The owner asked for the three figures under the hook to be removed —
−80% administrative work, 40,000 requests a minute, 300 → 4,500 sellers.
**Flagged before doing it:** context.md §3 records "proof arrives early" as one
of the four changes that moved five-second comprehension from 26% to 80%. The
hook screen carrying the three hardest numbers is what put the first proof beat
at screen 5 instead of screen 12. This removes that beat from the hook screen.
**Decision:** removed, as requested. The figures still appear in the case
studies on `/work` and in each case panel, so the proof is not gone — it arrives
later.
**Made reversible on purpose:** `proof` is now optional on
`StatementProofSection` and renders nothing when absent. Restoring it is a
one-line content edit in `content/site.json`, with no code change. The removed
values are recorded here so they can be put back exactly:
`−80%` Administrative work, national safety-training operation ·
`40,000` Requests a minute at peak, national tourism platform ·
`300 → 4,500` Sellers, with no extra support headcount.
**Recommend:** re-run the five-second comprehension test against this change
before launch (research-analyst). It is the measure this edit is most likely to
move.

---

## 2026-09-28 — Four scroll and layout faults, and two measurement traps
**Type:** delivery
**Owner:** 3D Engineer + Designer

**1. The work section never switched case on scroll.** It had no
`[data-step]`, so the stage's progress was always 0 and the carousel always
showed case 1. Rebuilt with a scroll track — one 54vh segment per case, each
carrying `[data-step]` — which does two jobs: an IntersectionObserver switches
the panel, and the stage turns the carousel. Panel and model now show the same
case. Tabs jump by scrolling to their segment, not just swapping the panel, or
the model would disagree with it. Verified: a continuous scroll reaches India →
Singapore → Dubai → Retail in order.

**2. Range rows were empty when open.** They carry `count` and a `systems` list,
not a `body`, so `DisciplineRow` revealed nothing — the open row looked broken
and out of step with the lit row in the model. The row now renders either shape.
**The first attempt at this fix failed silently:** the edit that passed
`systems`/`count` down targeted indentation from before `SequenceSection` was
rebuilt, matched nothing, and was not asserted. The type declared the props; the
call site never passed them. Every scripted edit is now asserted.

**3. The model spun.** Three scenes used an *accumulating* yaw —
`moment`/`faq` `t * 0.045`, `evidence` `0.4 + t * 0.025`, `integration`
`t * 0.03`. After a minute on the page the block had turned ~160°, and blending
into the next scene whipped it round. Replaced with bounded sways, in line with
design.md §5.5 ("slow yaw, sub-degree drift"). Yaw is also now blended along the
shortest arc, because the work carousel deliberately turns through −1.5π and a
plain lerp out of it swung the model almost a full turn the long way.
**This deviates from the approved prototype**, which spins. The owner reported
it as a fault, and it contradicts the design system, so the design system wins.

**4. A resting pointer froze the sequence.** Rows pinned on `mouseenter`, but
the list is sticky — it does not move under a stationary cursor — so whichever
row the pointer rested on stayed open for the whole section and scroll could
never advance it. Now: rows pin only on real pointer *movement* (coordinates
compared, because Chromium can dispatch a synthetic mousemove after a scroll),
and a scroll step always reclaims control. Regression test in
`tests/e2e/sequence.spec.ts`.

**Also:** sticky blocks are now anchored at `top: 116px` like the prototype's
`.seq-in`, instead of an `h-screen` block centred vertically — centring pushed
the lower rows below the fold whenever an open row made the block tall. Track
height per step now follows the prototype's `--sh`: build 34vh, range 42vh,
work 54vh.

**Measurement trap 1 — smooth scrolling.** The site sets `scroll-behavior:
smooth`, so every `window.scrollTo(0, y)` used in testing *animated*. Anything
measured in the following second was measured mid-flight: a row reported
`y = 3466`, a screenshot showed the fixed header halfway down the viewport, and
several earlier screenshots came back blank. Tests and reviews must use
`scrollTo({ top, behavior: 'instant' })`.

**Measurement trap 2 — Playwright's `hover()`.** Its actionability check
scrolls the element into view first, and that scroll fires the
IntersectionObserver after the hover lands — which correctly reclaims the
sequence and clears the pin the hover just set. Use `page.mouse.move` when the
test is about hover-versus-scroll.

**State:** `pnpm verify:full` green — 18 unit, 49 Playwright, axe clean,
167.8 KB initial / 119.1 KB 3D. Committed as 2aa7a1f. A parity review against
the prototype is running; its findings are the next piece of work.

---

## 2026-09-28 — The assembly never played: steps in a grid broke scroll progress
**Type:** delivery
**Owner:** 3D Engineer
**Context:** Reported as "very nice transition will happen — which is not
happening now". The `how` scene showed the footprint and the lattice frame, then
stalled: the twenty-seven modules never dropped in.
**Cause, measured:** the stage derives sub-step progress from the `top` of each
`[data-step]`. `StepsSection` laid the four stages out as `lg:grid-cols-2`, so
steps 0/1 shared a row top and 2/3 shared another — `[9973, 9973, 10234, 10234]`.
Progress therefore jumped **1.89 → 3.31**, skipping the 2.0–2.9 window where
`f = (sub - 2) * 30` places the modules. The scene was never asked to draw them.
**Fix:** stacked the steps with a 6vh gap, as the prototype does. Progress now
sweeps 0 → 3.6 through four distinct tops and the assembly plays.
**Lesson:** the layout change that broke it looked purely cosmetic. Anything the
scene measures — `[data-step]`, `[data-body]`, `data-side`, `data-scene` — is an
interface, and a component that carries one cannot be re-laid-out freely. That is
now called out in the component itself.

---

## 2026-09-28 — Design review of a screen recording, and what it got right and wrong
**Type:** decision
**Owner:** Design Reviewer + Designer
**Context:** The owner supplied a 66-second scroll recording. No ffmpeg on the
machine, so frames were extracted with a small Swift `AVAssetImageGenerator`
utility — worth remembering, it needs no install.
**The review's CRITICAL finding was against a stale page.** `serve` caches hard;
the reviewer loaded a build from before the step-stacking fix and reported the
assembly as permanently broken, with a wrong diagnosis (progress keyed to total
scroll height). The fault was real, the cause was not. Verified independently by
replicating `subOf` in the live page and reading the step tops — which is what
established the actual cause above. **A reviewer's diagnosis is a lead, not a
finding.**
**Two findings that were correct and are now fixed:**
1. **The primary CTA was the wrong colour.** It used `ink`; the approved
   prototype's final pass sets `.btn-p { background: var(--blueprint) }`. Ported
   — but the prototype pairs it with `#fff`, which measures 5.92:1 in light and
   **2.87:1 in dark**, under the 4.5:1 floor. Kept the background as designed and
   flipped the foreground per theme via a new `--color-on-brand` token: 5.92:1
   and 6.40:1. The old hover went to `signal`, which put the scarcity token on a
   control present on every screen; it now goes to `--color-act-d`.
2. **Header toggles** were square boxes with the literal text "DK" and "II".
   The design has circular icon buttons; rebuilt with CSS-drawn glyphs (a
   half-filled circle, pause bars, a play triangle) so there is no icon payload.
**Also fixed, reported separately:** the range rows had no swatches.
`content/site.json` writes that section's hues as single-letter codes (`o`, `p`,
`u`, `s`), which were mapped for the 3D scene but not for the DOM, so `Swatch`
received an unknown key and rendered nothing. Added `lib/hue.ts` to resolve both
spellings at the content boundary.
**Raised and deliberately NOT changed:** the `how` scene shows four signal-orange
corner pegs at once, against design.md §5.2 ("one per screen, maximum"). The
approved prototype does the same, so this is a conflict between the design system
and the approved artifact, not a porting error. It is the Designer's and CEO's
call, not something to silently correct. Flagged for a decision.

---

## 2026-09-28 — Section rhythm and the case tab strip, both missed in the port
**Type:** delivery
**Owner:** Designer
**Context:** Two spacing faults reported after the scene port. Both were parts of
the prototype's CSS that the component rebuild never carried across — the scene
was ported carefully and the layout around it was not.

**1. Sections had no floor height.** The prototype sets `.ch { min-height: 74vh }`
and `[data-side="c"] { min-height: 100vh }`, with asymmetric padding — more above
than below. Without them the centred chapter collapsed to its content, so the
hook, the three proof figures and the CTA were crammed together and the model,
offset downward by design, landed on top of them. Ported, along with the centred
body width (1100px, not 62ch), the larger hook type on desktop (capped at 19ch so
it breaks into three lines) and the 900px cap on the proof row.

**2. The case tabs were boxed and wrapped badly.** Built as bordered buttons
carrying the full case headline and its number. The prototype is an underline
strip on a hairline, the selected tab marked by a 2px rule in that case's hue,
and — the part that matters — labelled `region · sector` ("Singapore · Tourism"),
not the headline. Four headlines cannot sit in a half-width reading column; four
short labels can. Also ported: tags as pills, metrics as a divided pair, and the
prototype's type sizes for the panel.

**Noted, not changed:** the case numbering reads 02, 01, 03, 04 in the strip.
That is in the approved content — India is `n: '02'` and first in the array in
both `site.json` and the prototype. Renumbering is a content decision, so it is
flagged here rather than quietly corrected.

**Lesson:** the scene was compared against the prototype side by side, which
caught the colour and lighting faults. The surrounding layout was not, and that
is exactly where these slipped through. Compare the page, not just the canvas.

---

## 2026-09-28 — The 3D scene was invented, not ported. Rebuilt from the prototype.
**Type:** reversal
**Owner:** 3D Engineer
**Context:** The owner's verdict on the first scene: "The 3D is worst — have seen
the artifact." Correct. The `wezigns-web.zip` handed over contained only
`three/README.md`, so the scene was built by inventing geometry from the scene
*names* in site.json. That is guessing at a design that already existed and had
been through a 200-user study.
**Found:** the approved prototype, artifact `MDeoPeFivbdbmWepXpZKH3` ("Wezigns
Build"), 1803 lines, plain three.js r128.
**What the real design is:** an architectural diagram that assembles itself. A
footprint is drawn with draughtsman's overshoot at the corners; a 3×3×3 lattice
frame rises; twenty-seven modules drop into it one at a time as you scroll the
four stages; corner pegs retract; pulses then run through the finished block. A
cage closes around it for "secure". The contact scene is the same block with one
corner **missing**, the piece hovering beside it and the empty slot outlined.
Bevelled rounded boxes via ExtrudeGeometry, soft shadows on a ShadowMaterial
ground, ACES tone mapping, and callout labels in a column joined to the parts by
leader lines.
**Decision:** ported it faithfully — all fifteen states, the camera, the blend,
the callouts.
**Consequences:** **Dropped `@react-three/fiber` and `@react-three/drei`.** The
prototype is imperative three.js; the scene is one object mutated every frame,
and expressing that declaratively would fight both the design and the
no-allocation rule. This deviates from architecture.md §1, which lists R3F — the
deviation is deliberate and is recorded here. It also cut the 3D chunk from
195.5 KB to 119.1 KB brotli.

---

## 2026-09-28 — Three r128 → r186: two porting bugs that changed how it looks
**Type:** decision
**Owner:** 3D Engineer
**Context:** The first port ran but looked wrong beside the prototype — dark and
over-saturated where the original is pale and soft. Both causes are version
migration, not design.
**1. Double sRGB conversion.** The prototype calls `convertSRGBToLinear()` on
every colour, correct for r128 where colour management was off. From r152
`THREE.ColorManagement` is enabled by default and `Color.set()` already converts
a CSS string into working space. Converting again darkened and over-saturated
every colour. Removed.
**2. Light intensities.** r128 had `useLegacyLights` true, where ambient,
hemisphere and directional irradiance was not divided by PI. That default
flipped in r155 and the option was later removed, so the prototype's numbers
render roughly a third as bright. Multiplied by PI, with the reason at the
constant.
**Because:** both are invisible in code review — the port was line-for-line
correct and still wrong. Only rendering the prototype side by side at the same
scroll position showed it.

---

## 2026-09-28 — Reversed: a live scene does not idle
**Type:** reversal
**Owner:** 3D Engineer
**Context:** An earlier entry today resolved architecture.md §4 ("an idle page
renders nothing") against design.md §5.5 ("motion is ambient") by making the
drift fade out and the loop stop after 2.5s.
**Decision:** Reversed. The approved prototype runs continuously while the scene
is live and idles only when **paused** — and pausing is what the header control
and `prefers-reduced-motion` both do.
**Because:** the earlier resolution was my invention. The design has genuine
continuous motion — a slow yaw, pulses travelling connectors, work flowing
through the model in the AI scene. Stopping it is not a refinement of the design,
it removes part of it. "An idle page renders nothing" is honoured by the pause
state, which is one click away and automatic under reduced motion.
**Consequences:** `tests/perf/scene.spec.ts` rewritten: it now asserts zero draw
calls **when paused** and **under reduced motion**, rather than after a live page
settles. The old assertion is gone, and the reason is in the file.

---

## 2026-09-28 — Resolving "ambient motion" against "an idle page renders nothing"
**Type:** decision
**Owner:** 3D Engineer
**Context:** Two project rules were in direct tension once the scene existed.
`architecture.md` §4: *frameloop="demand"; an idle page renders nothing.*
`design.md` §5.5: *motion is ambient — slow yaw, sub-degree drift.* A continuous
drift means the demand loop never sleeps. Measured: ~1 draw call per frame,
forever.
**Options:** (a) drop the ambient drift, (b) accept a permanently running loop,
(c) let the drift settle.
**Decision:** (c). The drift runs while the reader is moving and for 2.5s after
the scroll state last changed, easing out over that window; then the loop stops
and issues no further frames until the next scroll, pointer move or theme change.
**Because:** design.md describes the *character* of motion when it happens, not a
requirement that it never stop. architecture.md's rule is about battery and
thermals and is unambiguous. Easing the drift out rather than cutting it keeps
the ambient quality without holding the GPU awake on a page nobody is reading.
**Verified:** `tests/perf/scene.spec.ts` counts draw calls at the WebGL level and
asserts exactly zero after settling. It passes.

---

## 2026-09-28 — Bundle budget: content-based, not glob-based
**Type:** reversal
**Owner:** Test Engineer
**Context:** The 3D budget was wired to `out/_next/static/chunks/3d_*.js`. It
matched once and then silently stopped, because Turbopack names chunks with
opaque content hashes — the `3d_` prefix was coincidence, not semantics. The
initial-route budget then swallowed the 3D chunk and reported 366 kB against a
180 kB limit.
**Decision:** Replaced `size-limit` with `scripts/check-size.mjs`, which
identifies the 3D chunk by markers in its contents (`InstancedMesh`,
`WebGLRenderer`, `BufferGeometry`) and brotli-compresses each file itself.
`size-limit` and `@size-limit/preset-app` removed.
**Because:** a budget that silently measures the wrong thing is worse than no
budget. Nothing about the chunk's *name* is stable; what is in it is.
**Consequences:** `pnpm size` reports both budgets and names the file it
identified, so a future mis-identification is visible rather than silent.
Current: initial 162.5 KB / 180, 3D 195.5 KB / 320.

---

## 2026-09-28 — Footer wordmark failed the contrast gate
**Type:** delivery
**Owner:** Designer
**Context:** axe flagged the oversized footer wordmark at 2.03:1 against
`--color-panel`, under the 3:1 floor for large text (WCAG 2.2 AA 1.4.3). It used
`--color-line-2`, a hairline token never intended to carry text.
**Decision:** Added `--color-wordmark` — `#7f8592` light (3.31:1), `#636876` dark
(3.06:1), both computed rather than eyeballed.
**Because:** the element is decorative and `aria-hidden`, which is an argument
for exempting it — but it is still rendered text, axe treats it as such, and
standards.md makes zero serious violations a hard gate rather than a judgement
call. A new token is also the correct answer under design.md: a value needed for
a purpose the existing tokens do not serve is a token, not an override.

---

## 2026-09-28 — WebKit excludes links from the Tab order
**Type:** decision
**Owner:** Test Engineer
**Context:** The skip-link test failed on webkit only: Tab did not reach it.
**Finding:** This is a Safari/WebKit platform default — links are not in the Tab
sequence unless the user enables full keyboard access. The markup is correct and
the skip link is first in the DOM.
**Decision:** The Tab-order assertion is skipped on webkit with the reason
written at the skip; a second test, running on every engine, asserts the skip
link is the first focusable element in document order, targets `#main`, and works
when activated.
**Because:** skipping a test because it fails is how a suite rots. Skipping it
because the behaviour under test belongs to the platform, while asserting the
thing that is actually ours, is not the same move — but only if the replacement
assertion is real.

---

## 2026-09-28 — Session: the site is complete and committed
**Type:** session
**Owner:** PM

**Done**
- **Fonts** self-hosted: Outfit and JetBrains Mono, latin variable woff2, one
  file each (31 KB), preloaded, `font-display: swap`. Licences recorded in
  `public/fonts/LICENSES.md` (both OFL). No Google Fonts request.
- **Phase 4:** `not-found.tsx`, `sitemap.ts`, `robots.ts`,
  `lib/structured-data.ts` and a `JsonLd` atom. Organization + WebSite + FAQPage
  on `/`, CreativeWork per case on `/work`.
- **Phase 3 — the 3D scene**, the whole subsystem: `materials.ts` (pooled
  linear-space colours, one geometry, one material), `states.ts` (14 scene
  layouts, auto-fitted to the stage), `useScrollState.ts` (the single rAF loop),
  `Instances.tsx` (one InstancedMesh, N=64), `Scene.tsx`, `SceneCanvas.tsx`.
- **Playwright installed** (chromium + webkit) and the matrix run for the first
  time: 45 passed, 6 skipped. axe clean on all three routes, both themes.
- `scripts/check-size.mjs` replacing size-limit; `verify:full` script.
- **`git init` and the first commit** — 119 files.

**Bugs found and fixed while building the scene**
1. Model overlapped the reading column. Fixed by measuring every layout and
   scaling it to fit the stage — `fitToStage` — so design.md §5.4 is a property
   of the system rather than of the author's care. The first attempt still
   overlapped because it measured box *centres*: a rotating cube's corner
   reaches `s·0.87`, and boxes at positive z are magnified by perspective.
2. Ambient yaw accumulated without bound instead of drifting. design.md §5.5
   asks for sub-degree drift; it now oscillates within ±2.9°.
3. Every instance was coloured, against design.md §5.1's *neutral by default,
   colour on attention*. Hues are now mixed 22% into the model material; only
   the single signal piece takes its hue at full strength.
4. `signal` appeared in the rotating hue list, so several scenes had four or six
   orange pieces — directly against the scarcity rule. Hue rotations are now
   modulo 5 and signal is reserved.
5. React 19's compiler lint rejected mutating a `useMemo` result. Correct, and
   the fix is a ref: R3F requires mutation, and a ref is the honest primitive.

**State**
- **`pnpm verify:full` passes**: typecheck, lint, content validation, 18 unit and
  integration tests, static build, both bundle budgets, 45 Playwright tests
  across chromium, webkit and mobile chrome.
- Budgets: initial route **162.5 KB**, 3D chunk **195.5 KB** brotli (180 / 320).
- Six static routes: `/`, `/work`, `/capabilities`, `/404`, `/robots.txt`,
  `/sitemap.xml`.
- Git: `main`, one commit, no remote.
- The scene runs only above `lg`, with WebGL, without reduced motion, unpaused —
  all four fallbacks are tested, and in every one the page is complete.

**Not done, and why**
- **Lighthouse CI** (`pnpm lhci`) has never run. `@lhci/cli` is installed but
  unconfigured — there is no `lighthouserc`. The bundle budgets are enforced;
  LCP/INP/CLS at p75 are not.
- **Callouts** (`Callouts.tsx` in the three/ contract) are not built — the dot,
  leader line and aligned label column for the four sections that invite
  pointing. The scene works without them and every fact it shows is already in
  the DOM as text, so this is an enhancement, not a gap in correctness.
- **OG images** are referenced in metadata but the files do not exist in
  `public/`.
- The form still does not submit anywhere — the transport decision is open.

**Next**
1. Configure and run Lighthouse CI against the budgets in architecture.md §8.
2. Create the OG image.
3. Decide the form transport (architecture.md §6, option A or B) and wire it.
4. `Callouts.tsx`, if the annotation layer is still wanted.
5. Host, analytics vendor, security headers — Phase 5, all needing decisions.

**Blocked**
- The five business facts — CEO. Every dependent component exists and stays
  unmounted while its slot is `null`.
- Form transport, host, analytics vendor — architecture.md §9.
- The AI-crawler stance: `robots.ts` currently allows everything by virtue of the
  blanket `*` rule, which is a **default, not a decision**. The file says so in a
  comment. Allowing GPTBot and peers means citation in AI answers and also
  training use — the CEO's call, and it needs a journal entry either way.

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
