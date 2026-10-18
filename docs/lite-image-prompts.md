# Lite-mode images: generation prompts

Lite mode is for slow phones and slow networks, so these images replace the code-drawn SVG art **only in lite
mode**. The full 3D site is unchanged. (This is a change to the "no raster images" decision, limited to lite mode.)

## Delivery specs (all images)

- **Format:** WebP (or PNG, and I'll convert). Target **under 120 KB each** after compression; lite users are on slow
  connections, so heavy images would defeat the point.
- **Background:** solid near-black **#07070c** that fades to pure dark at every edge (no vignette ring, no frame), so the
  image blends into the page with no visible box.
- **No** text, letters, logos, UI, watermarks or people.
- **Palette:** threads in violet `#8b7bff`, magenta `#ff47c7`, cyan `#2fd0ff`, coral `#ff7a59`, blue `#4d9fff`,
  plus warm cream-gold `#e9d7b0` for ordered threads; one soft white-gold glow.
- **Style line (add to every prompt):** *cinematic 3D render, fine glowing fibre-optic threads, soft bloom, shallow
  depth of field, dark luxury tech aesthetic, ultra clean, high detail, no text.*
- File names below are what I'll wire up; attach them with these names if you can.

## 1. Hero loom — `lite-hero.webp` (16:9, 2400×1350) and `lite-hero-mobile.webp` (9:16, 1080×1920)

> A wide dark scene. From the left edge, hundreds of fine, tangled, multicoloured glowing threads (violet, magenta,
> cyan, coral, blue) flow in chaotic loops toward the centre-right, where they are drawn into the mouth of a sleek
> metallic loom: a horizontal cone of six dark gunmetal rings joined by thin lattice struts, narrowing to the right.
> A ring of small bright lamps circles the loom's mouth, and an intense white-gold light glows exactly at the mouth.
> On the far side, the threads leave the loom as one smooth, orderly cream-gold bundle that runs off the right edge.
> Chaos on the left, order on the right. Camera slightly above and in front, three-quarter view. Background near-black
> #07070c. Keep the lower-left third dark and quiet (headline copy sits there). [style line]

Mobile version: same scene, vertical framing, loom in the upper half, threads entering from the top-left, lower 45%
dark and empty.

## 2. Simplify — `lite-simplify.webp` (1:1, 1600×1600)

> A floating, perfectly flat rectangular panel woven from glowing threads, like fine fabric on a loom: warm
> cream-gold warp and weft threads crossing in a tidy grid, slightly wavy, edges frayed with a few loose violet and
> cyan strands drifting away. Faces the camera, tilted a few degrees. Soft white glow at the centre of the weave.
> Subject centred, filling about 65% of the frame, generous dark space around it. Background near-black #07070c.
> [style line]

## 3. Scale — `lite-scale.webp` (1:1, 1600×1600)

> A tall cone made of thousands of fine cream-gold glowing threads spiralling upward in a crossing helix lattice,
> narrow at the bottom and widening toward the top like a funnel opening to the sky. Small bright particles travel
> up along the threads. Soft white-gold glow at the narrow base. Subject centred, filling about 70% of the frame
> height. Background near-black #07070c. [style line]

## 4. Secure — `lite-secure.webp` (1:1, 1600×1600)

> A sphere woven from countless fine cream-gold glowing threads crossing in every direction, like a protective
> woven shell, slightly translucent so you can see inside. At its exact centre, a small intense white glowing core.
> A faint outer halo. Subject centred, filling about 65% of the frame. Background near-black #07070c. [style line]

## 5. Countries globe — `lite-globe.webp` (1:1, 1600×1600)

> A dark planet Earth made of tiny glowing dots outlining the continents (no textures, no clouds), with faint latitude
> rings, viewed so India is near the centre-left. From a bright point on India's south-east coast (Chennai), thin
> glowing gold arcs rise and curve out to points in the USA, UK, Netherlands, Czech Republic, UAE, Saudi Arabia,
> Singapore, Malaysia, Thailand and Australia, each ending in a small soft blue pin of light. Subject centred, globe filling about
> 75% of the frame. Background near-black #07070c. [style line]

## What I'll do when you attach them

- Put them in `public/lite/` and swap them in for the SVG art in lite mode only (`LiteArt.tsx`), with `loading="lazy"`,
  fixed width/height (no layout jump) and the SVG kept as the fallback if an image fails to load.
- Check file sizes, plus how they look at 1440 and 375, then commit.
