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
