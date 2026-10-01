# Wezigns homepage design audit

**Version note:** The pre-Möbius design has been restored, with its original 3D hero, case artwork, and separate sections. The later enlargement and scroll journey for “Across your business” remains. See [restoration notes](scroll-journey.md). Lighthouse numbers below belong to the earlier measured refinement.

Date: 2026-10-01. Scope: homepage, shared header and footer, generated illustrations, responsive typography, process progression, and capabilities.

The review used design-taste-frontend and Impeccable. This was a refinement of the existing company website: retain the Wezigns identity, cobalt accent, company facts, route structure, public anchors, primary navigation labels, form fields, and legal copyright text. Design dials: DESIGN_VARIANCE 6, MOTION_INTENSITY 5, VISUAL_DENSITY 4. Native CSS and existing Tailwind/React are the foundation; no new component library.

## Implementation integrity

The original homepage repeated numbered eyebrows, decorative arrows, miniature technical captions, and generic two-line slogans. The capabilities block repeated the same content in a numbered list and an adjacent display. Hand-built dashboard previews could be mistaken for actual client software. These patterns were removed. The live 3D hero remains because it is the company's requested spatial design direction.

The mechanical Impeccable detector returned no findings on the changed homepage, header, footer, process, capabilities, and stylesheet targets. This is a code check, not proof of design quality. Screenshot inspection supplied the visual evidence.

## Audit health

| Dimension | Score | Evidence |
| --- | --- | --- |
| Accessibility | 4/4 | No axe violations in the tested light/dark desktop/mobile views. Lighthouse accessibility 100. Keyboard capability tabs, native disclosures, named controls, and labelled required fields retained. |
| Performance | 3/4 | Lighthouse mobile performance 92, blocking time 50 ms, layout shift 0. LCP 3.3 seconds remains above the 2.5-second target. |
| Responsive design | 3/4 | No horizontal overflow at 320, 390, 1045, and 1440 pixels. Single-column mobile layouts. Physical devices and assistive technology were not tested. |
| Theming | 4/4 | Whole-page light/dark semantic colors, system preference, manual theme control, and consistent accent hierarchy. |
| Implementation integrity | 3/4 | Content and URLs preserved, real generated abstracts replace fake screenshots. Homepage still ships a substantial client component; further server/client separation could reduce unused JavaScript. |
| Total | 17/20 | Good, with measured performance work remaining. |

These scores are review judgments, not standardized certification.

## Findings addressed

- **P1: accessible names differed from visible labels.** The short header contact label and pricing link had different ARIA labels. Removed redundant overrides so their accessible names match the visible controls.
- **P1: mobile loads the full WebGL scene before interaction.** Mobile now shows the abstract immediately and loads the live scene on explicit interaction. Desktop initializes the scene during idle time. Paused and offscreen scenes stop scheduling animation frames.
- **P1: homepage did not respect the dark system theme.** Added semantic dark tokens throughout the homepage and shared chrome. Verified both modes.
- **P2: capabilities were a nine-row inventory with duplicated descriptions.** Replaced it with three keyboard-accessible groups: Build a system, Connect and automate, and Keep it running. All nine capabilities remain available.
- **P2: delivery steps only changed on click.** Added IntersectionObserver chapter selection with a sticky desktop overview. Scrolling selects Understand, Shape, Build, and Run. Controls can still navigate directly; mobile keeps every chapter in normal flow.
- **P2: case content floated beneath separate preview panels.** Each case is now one complete linked card with illustration, sector, actual narrative, measured outcomes, and a clear case-study link.
- **P2: mock dashboards implied actual product imagery.** Replaced them with explicitly abstract material illustrations. No client screenshots or product interfaces are invented.
- **P3: excessive decorative scaffolding and typography.** Removed section and image numbering, repeated eyebrows, decorative card arrows, status dots, hero coordinates, scroll cues, random serif emphasis, and the giant footer wordmark. The logo and factual outcome numbers remain.

## Typography

One self-hosted Outfit family throughout the homepage. No monospace costume labels or mixed-family emphasis.

| Role | Size | Line height |
| --- | --- | --- |
| Hero | 46-96 px desktop, 42-64 px mobile | 1.05 |
| Section heading | 32-56 px desktop, 36 px mobile | 1.12 |
| Case title | 24-26 px | 1.25 |
| Service title | 20 px | 1.3 |
| Body | 16 px | 1.7 |
| Controls and supporting text | 14 px | Appropriate to control height |

At the supplied 1045-pixel viewport, measured hero type is 65.835 px, section type 41.8 px, and body type 16 px. At 390 pixels: 42 px, 36 px, and 16 px. Display letter spacing does not exceed -0.04em.

## Remaining measured findings

- **P2: mobile LCP 3.3 seconds.** The final compressed static-export lab run misses the 2.5-second target. Lighthouse identifies the abstract image as needing earlier discovery, with an estimated 150 ms preload saving. Additional savings require reducing initial client JavaScript and validating caching on the deployed host. Recommended command: `/impeccable optimize`, then `/impeccable polish` for a bounded final check.
- **P2: initial JavaScript remains substantial.** 167.4 KB Brotli against the project's 180 KB budget; the lazy 3D chunks total 151.6 KB against 320 KB. The budget passes, but Lighthouse estimates about 50 KiB of unused JavaScript. Further client/server separation is a worthwhile follow-up, not a visual defect.

## Verification and limitations

- Chromium headless viewport emulation: light desktop 1045x977, light mobile 390x844, dark desktop 1440x1000, dark mobile 320x844.
- Each process chapter selected its matching control on scroll in all four configurations. Capability click and keyboard navigation and enquiry-draft preparation worked.
- No browser errors or automated axe violations in the confirmation round. Automated checks do not establish full WCAG compliance.
- Lighthouse mobile lab audit on a static export with gzip and normal cache headers: performance 92, accessibility 100, LCP 3.3 s, first contentful paint 0.9 s, total blocking time 50 ms, CLS 0. This is local lab evidence, not field Core Web Vitals or a deployment benchmark.
- TypeScript, ESLint, production export with Webpack, and bundle budget pass. All 18 existing unit/integration tests pass. The legacy full multi-engine E2E suite was not run.
- Existing contact behavior remains transparent: the form prepares an email draft for review and sending. No delivery endpoint is configured.
- Physical touch, Safari, screen readers, and a deployed CDN remain untested in this refinement.

## Artwork provenance

Created with the built-in image generation tool. This is abstract brand imagery, not client software or photography of actual company assets.

Final project asset: `public/images/systems-artwork.webp`, 2172x724 pixels, approximately 104 KB. Source: `public/images/systems-artwork.png`. The three image zones supply the two case illustrations and the integration abstract, without captions or labels over the artwork.

Generation prompt:

> Create one wide editorial 3D abstract artwork for Wezigns, a custom business software company. Aspect ratio 3:1, composed of three equal square visual zones, with quiet pearl grey backgrounds (#f6f7fb), consistent soft studio lighting, precision-machined cobalt blue (#234be8) and brushed pale aluminum materials. No text, no letters, no symbols, no labels, no UI, no dashboards, no gradients or glows, no artificial status elements. Left third: finely stacked thin square plates organizing into one coherent structure, sculptural and grounded. Center third: distinct architectural modules linked by precision channels forming a shared system, a beautiful physical network. Right third: several curved polished metal conduits entering and connecting to a central cobalt architectural hub; represents integration. Every subject should occupy the middle 60 percent of its third, comfortably clear of crop edges. A coherent premium industrial still life triptych, tactile natural material detail, soft directional shadows, calm gallery photography, orthographic camera slightly above. This is an abstract brand illustration, not a depiction of actual client software. Generate at high resolution.

Optional documentation follow-up: `/impeccable init` can capture durable product context; its absence did not block these scoped refinements.
