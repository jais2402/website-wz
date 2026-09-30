# design.md — tokens, Tailwind map, and the rules of the system

> Tailwind v4 is CSS-first. There is no `tailwind.config.js`. Tokens live in
> `src/styles/tokens.css` inside `@theme`, which both generates utilities and
> emits real CSS custom properties on `:root`.
> Source: https://tailwindcss.com/docs/theme

---

## 1. Design tokens

### 1.1 Colour — surfaces and ink

| Token | Light | Dark | Use |
|---|---|---|---|
| `--color-ground` | `#eceef4` | `#12141b` | Page background |
| `--color-ground-a` | `rgb(236 238 244 / .82)` | `rgb(18 20 27 / .82)` | Sticky header behind blur |
| `--color-chip` | `rgb(236 238 244 / .95)` | `rgb(18 20 27 / .95)` | 3D callout chips |
| `--color-panel` | `#f1f2f7` | `#191c25` | Footer, raised sections |
| `--color-raised` | `#f8f9fc` | `#20242e` | Inputs |
| `--color-ink` | `#1a1c20` | `#ebebe7` | Primary text |
| `--color-ink-2` | `#454952` | `#b8bbc1` | Body text |
| `--color-ink-3` | `#5d6169` | `#9a9ea6` | Meta, captions, inactive |
| `--color-line` | `rgb(26 28 32 / .12)` | `rgb(235 235 231 / .11)` | Hairlines |
| `--color-line-2` | `rgb(26 28 32 / .26)` | `rgb(235 235 231 / .24)` | Borders, leader lines |

### 1.2 Colour — the palette

Six hues. Each has a **surface** value (used in 3D and swatches) and a **text**
value (contrast-safe on `--color-ground`). Never use a surface value for text.

| Hue | Surface (light) | Text (light) | Surface (dark) | Text (dark) | Meaning |
|---|---|---|---|---|---|
| `blueprint` | `#3350f0` | `#2a44d6` | `#7d90ff` | `#8c9dff` | Primary accent, links, active |
| `pine` | `#10a37c` | `#0a7556` | `#3fd1a4` | `#3fd1a4` | Success, "still running" |
| `ochre` | `#f4a40b` | `#8f5a00` | `#ffc24d` | `#ffc24d` | Caution, in-progress |
| `plum` | `#8a55e8` | `#6536c9` | `#b590ff` | `#b590ff` | Category |
| `rose` | `#ec4d86` | `#b8245c` | `#ff7aa8` | `#ff7aa8` | Category |
| `signal` | `#ff5a1f` | `#e2470d` | `#ff7a45` | `#ff9466` | **Reserved.** The one thing that matters |

**Signal orange is a scarcity token.** One per screen, maximum. It marks the
missing piece, the exception, the thing being fixed. If two things are orange,
neither is.

### 1.3 Model materials (3D only)

The block is a **chamfered box, flat-shaded** — corners cut straight, never
rounded (`chamferBox(0.16)` in `three/geometry.ts`). Machined, not moulded.
Material: `roughness .4`, `metalness .18`, `flatShading: true`, so every facet
takes its own normal and catches the key light as a distinct plane. The key
light sits at (9, 12, 4) at 1.42×, with the fill and hemisphere pulled down —
a flatter, softer rig made the chamfers muddy rather than machined.
*(Owner, 2026-09-29, references: a faceted twisty puzzle, a Cybertruck, a
cut-metal model kit. Rejected with reasons in journal.md: a frame-and-panel
build, which would put two colours on every block and break §5.1's single tint;
and notched "kit" edges, which deform under the per-axis scaling every scene
relies on.)* The `IsoGlyph` line drawings miter their corners to match.

| Token | Light | Dark |
|---|---|---|
| `--color-model` | `#f7f8fb` | `#a7acba` |
| `--color-model-2` | `#d9dce7` | `#636a7c` |
| `--shadow-strength` | `.22` | `.55` |

### 1.4 Type

Two families only. `Outfit` 300/400/500/600 for everything, `JetBrains Mono`
400/500 for meta, labels, numbers-as-labels and 3D callouts.

| Token | Value | Use |
|---|---|---|
| `--font-display` | `Outfit, system-ui, sans-serif` | Everything |
| `--font-mono` | `'JetBrains Mono', ui-monospace, monospace` | Eyebrows, callouts, counts |
| `--text-d1` | `clamp(38px, 4.3vw, 72px)` / lh .98 / ls -.04em / w500 | Page headline |
| `--text-d2` | `clamp(28px, 2.7vw, 44px)` / lh 1.06 / ls -.032em / w500 | Section headline |
| `--text-statement` | `clamp(26px, 2.6vw, 42px)` / lh 1.12 | The centred hook |
| `--text-fig` | `clamp(54px, 5.4vw, 88px)` / ls -.05em | Big figures |
| `--text-lead` | `16.5px` / lh 1.6 | Section lead |
| `--text-body` | `16px` / lh 1.62 | Base |
| `--text-small` | `14px` | List items, captions |
| `--text-meta` | `10px` / ls .14em / uppercase / mono | Eyebrows |
| `--text-callout` | `10px` / ls .055em / mono | 3D labels |

Measure: body copy never exceeds **58ch**; display headlines cap at **13–18ch**.

### 1.5 Space, radius, motion

- Spacing scale: Tailwind default 4px base. Section rhythm uses viewport units —
  `--gutter: max(24px, 5.4vw)`, section padding `clamp(100px, 12vh, 140px)`.
- Radius: `2px` on buttons and inputs, `999px` on chips, `3px` on 3D geometry.
  Nothing else is rounded.
- Motion: one easing — `--ease: cubic-bezier(.22,.61,.36,1)`. Durations: 300ms
  (state), 450ms (reveal), 550ms (accordion), 1100ms (canvas fade-in).
- 3D damping is frame-rate independent: `k = 1 - exp(-dt * 5.2)`.

---

## 2. Tailwind v4 theme map

`src/styles/tokens.css`:

```css
@import "tailwindcss";

@theme {
  --color-ground:   #eceef4;
  --color-ink:      #1a1c20;
  --color-ink-2:    #454952;
  --color-ink-3:    #5d6169;
  --color-blueprint:#3350f0;
  --color-signal:   #ff5a1f;
  /* …one entry per token above… */

  --font-display: "Outfit", system-ui, sans-serif;
  --font-mono:    "JetBrains Mono", ui-monospace, monospace;

  --text-d1: clamp(38px, 4.3vw, 72px);
  --text-d1--line-height: .98;
  --text-d1--letter-spacing: -.04em;
  --text-d1--font-weight: 500;

  --ease-brand: cubic-bezier(.22,.61,.36,1);
  --breakpoint-lg: 1000px;   /* the desktop/phone split this design turns on */
}

/* Dark mode overrides the same custom properties, so utilities follow. */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) { --color-ground: #12141b; /* … */ }
}
:root[data-theme="dark"] { --color-ground: #12141b; /* … */ }
```

**Rules.** Never hard-code a hex in a component. Never use an arbitrary value
(`text-[17px]`) for anything in the scale. If a value is needed twice, it is a
token. `--breakpoint-lg: 1000px` is deliberate: it is the line where the split
layout and all scroll-gating turn on.

---

## 3. Layout system

- **Split canvas.** Desktop sections are 50/50: reading column one side, 3D stage
  the other, alternating side every section (`data-side` `l` / `r`, plus `c` for
  the centred hook). The alternation is the rhythm — do not break it without
  re-checking the zig-zag across the whole page.
- **Annotation gutter.** Each 3D scene reserves a gutter on its outer edge, sized
  from the widest label in that scene, so callouts sit clear of the geometry.
- **Sequences.** `build`, `range` and `work` are sticky sequences: the heading and
  list hold still, one item opens as you reach it, hover opens any item. Below
  `lg` sequences are inert — everything renders open.
- **Reading column** ≤ 58ch. Grids inside it: 2 columns at `lg`, 1 below.

---

## 4. Atomic inventory

| Level | Components |
|---|---|
| **Atoms** | `Button`, `TextLink`, `Swatch`, `Chip`, `Eyebrow`, `Figure`, `Rule`, `Icon`, `VisuallyHidden`, `ThemeToggle`, `MotionToggle` |
| **Molecules** | `HeadlineSplit`, `FactRow`, `MetricPair`, `DisciplineRow`, `AreaAccordion`, `StepBlock`, `ProofStrip`, `TopicChips`, `Field`, `FaqItem`, `CaseTabs`, `Callout` |
| **Organisms** | `SiteHeader`, `SiteFooter`, `HeroSection`, `SequenceSection`, `StatementSection`, `StepsSection`, `FiguresSection`, `CasesSection`, `FaqSection`, `ContactSection`, `SceneCanvas` |
| **Templates** | `SplitScrollTemplate` (the home journey), `DocumentTemplate` (`/work`, `/capabilities`) |
| **Pages** | `app/page.tsx`, `app/work/page.tsx`, `app/capabilities/page.tsx` |

**The rule that keeps this honest:** an atom may not import a molecule; a
molecule may not import an organism; nothing below `templates` may import
`content/site.json`. Content enters at the page, flows down as props.

---

## 5. The 3D language

One model, fifteen states, blended by scroll. It is a diagram, not decoration.

1. **Faceted geometric solids, four of them.** *(Owner, 2026-09-30: "more faces
   and different shapes — no irregularity — more geometric and light shaders",
   after a long sequence of irregular/morphing experiments was rejected and
   reverted; see journal.md.)* `SHAPES` in `three/geometry.ts`: a chamfered
   square (26 faces), and pentagonal, hexagonal and octagonal prisms whose top
   and bottom edges are also bevelled (17, 20 and 26 faces). One InstancedMesh
   per shape, dealt round-robin so neighbouring blocks differ. Every face flat,
   every join a hard crease, nothing tilted, nothing irregular — the variety is
   in the shapes themselves, never in deformation.
   **Light shading:** `flatShading: true`, `roughness .62`, **`metalness 0`** —
   there is no environment map, so metalness only darkens. Each facet takes a
   clean step of tone; the geometry does the work, not the material.

2. **The approved artifact's colour scheme, literally.** *(Owner,
   2026-09-29, after six rounds — "bright" → "design colours, less pastel and
   white" → "80%" → "plain, use bright" → "more white like the artifact" → "too
   colourful, come down" — settled by the owner linking the artifact itself:
   "apply the colour schema for the 3D blocks like this".)*
   - **There is no brightness curve.** The share at each call site is used as
     written. An earlier curve amplified every share (`min(cap, floor+gain·s)`),
     so a call asking for 30% rendered near 80%. That, not the palette, is what
     made the model read loud. `tint(i, k)`: k is the hue share, 0 white → 1
     full. `dimmed(c, k)`: k is distance toward white.
   - **The model rests near white.** Whole blocks are the white model material
     (the monolith and the cube alternate white with 30% hue; the evidence bars
     split white and 30%); everything else sits at a low share over white.
   - **The part pointed at goes to its full hue.** The offering modules rest at
     18% and jump to 100%. That jump is the highlight: the pointed-at block
     becomes the only coloured thing on screen, which is also why "dim the
     others on hover" needs no separate mechanism.
   - Shares, from the artifact: monolith and cube 0.3 · hero sheets and plates
     0.55, loose block 0.8, scatter 0.88 · AI lane 0.35 · evidence 0.3 ·
     case plates 0.35 active / 0.62 inactive · integration 0.42 at rest,
     0.72 when another is pointed at · tech stack 0.46 / 0.26 · offering
     modules 0.82 toward white at rest, 0.9 when another is pointed at.
   - Structural pieces (connectors, map tiles) stay neutral grey; the hub stays
     ink. **`signal` is kept out of the rotation** — the artifact's MIX includes
     it, but it is the scarcity token, one per screen (rule 2), and cycling it
     would spread orange through every scene.
   *Tone mapping is PBR Neutral, not ACES (2026-09-29). ACES bleached the brand
   hues toward white; Neutral keeps them saturated.*
3. **One accent piece — in the company blue.** *(2026-09-29, owner: the 3D accent changed from signal orange to blueprint; signal orange is reserved for warnings.)* Orange marks the exception, the missing piece, the thing
   being fixed. Never two.
4. **Labels only where you point.** *(2026-09-28: build no longer carries a callout column — its two-column list is the legend.)* Callouts exist in the four sections that
   invite pointing (`build`, `range`, `integration`, and where a list maps to
   geometry). Everywhere else the model carries no text. Labels are 10px mono in
   an aligned column outside the model, joined to a 4px dot by a 1px leader.
5. **The model never overlaps the reading column.** Scale derives from the stage
   width minus the annotation gutter. On the document sub-pages the model sits in
   its own band above the heading (`PageScene`) and scrolls away with it, rather
   than sitting behind the text.
7. **Pointing at a block lights its panel, and pales the rest.** The link runs
   both ways: a panel lights its block, and a block lights its panel. A 3D hover
   changes colour only — it never moves geometry, because a block that lifts
   under the pointer moves out from under it and the highlight oscillates.
6. **Motion is ambient, never attention-seeking.** Slow yaw, sub-degree drift.
   Anything faster competes with reading.
7. **`prefers-reduced-motion` renders states without transitions**, driven by
   scroll only. The pause control in the header is a first-class affordance and
   its state persists in `localStorage`.

---

## 6. Accessibility rules that are design decisions

- Body text ≥ 4.5:1, large text and UI components ≥ 3:1 (WCAG 2.2 AA 1.4.3 / 1.4.11).
- Interactive targets ≥ 24×24 CSS px (2.2 AA 2.5.8); we use 40px minimum.
- Focus ring: `2px` solid `--color-blueprint`, `3px` offset. Never removed, never
  obscured by the sticky header (2.4.11).
- Colour never carries meaning alone: every hue-coded item also has a label.
- The reading column carries the same hue markers as the model. Stats strips,
  the evidence table and figure suffixes rotate through the five hues in the
  model's own order (`rotateHue` in `src/lib/hue.ts`). Decorative and
  `aria-hidden`; the text colour never changes, so contrast is untouched.
  *(Designer, 2026-09-29: the page read plain because the reading column had no
  colour at all, not because the model was too quiet.)*
- The page background is a 1px dot on a 24px pitch in `--color-line`. Keep the
  pitch at or above 20px: tighter or stronger and it reads as graph paper
  rather than texture.
- The canvas is `aria-hidden` and purely decorative; every fact it shows exists
  in the DOM as text.
- No horizontal scroll at any width from 320px up.

---

## 7. Things the study forbids

- No placeholder copy in a shipped build — ever.
- No instruction text for the animation ("point at a card to find it in the model").
- No progress HUD or step counter.
- No hover-only content path.
- No arithmetic traps: never place a count next to a founding year.
