# Local 3D and interaction refinements

Updated 2026-10-01. These changes build on the restored pre-Möbius layout.

- Case studies are full-width horizontal cards, alternating artwork left/right on desktop. Live layered and connected-module sculptures replace the static case illustrations. Cards stack on mobile and retain their original case links, descriptions, and measured outcomes.
- Simplify, Scale, and Secure now sit immediately below the hero. Each has its own 3D sculpture above the original copy: consolidated plates, growing columns, and a lock. The existing technology line moves with this section.
- Capability tabs change between a layered system, connected modules, and a protected system; the service panel transitions into place. Keyboard tab navigation remains available.
- The integration image is replaced by a live connected-module model. Its native disclosures now animate open and closed.
- FAQ answers use interruptible, native-semantic open/close animations. Keyboard activation, rapid reversal, and reduced motion are supported. Rows reveal on entry.
- Pricing is now a substantial 300px desktop / 320px mobile panel with a larger outcome heading, supporting agreement text, and a clear contact action.

`CaseSculpture.tsx` creates the geometry locally with Three.js. It loads near the viewport, responds to scroll, hover, and keyboard focus, and runs gentle ambient assembly motion only while visible, and stops scheduling frames when offscreen or the document is hidden. Low pixel ratios and small shadow maps limit GPU work. Pause and reduced-motion preferences produce static geometry. CSS sculptures remain available without WebGL. The original hero sculpture is unchanged.

Verification:

- TypeScript, ESLint, all 18 existing unit/integration tests, and the production webpack build pass.
- Initial route JavaScript: 170.4 KB Brotli / 180 KB budget. Lazy Three.js: 151.6 KB / 320 KB budget.
- Chromium checks at 1440, 1045, 390, and 320px confirm section order, live model loading, horizontal desktop / stacked mobile cards, capability model changes, FAQ keyboard and rapid-toggle behavior, enlarged pricing dimensions, no page errors, no horizontal overflow, and no automated WCAG A/AA axe violations in tested light/dark views.
- Separate checks confirm still geometry and immediate disclosures under reduced motion and pause; a forced no-WebGL check confirms visible fallback and usable content.
- The Impeccable implementation detector returned no findings on changed targets.

Lighthouse, physical devices, and assistive technology have not been retested for this revision. Earlier Lighthouse scores describe a previous version.

## Motion journey update

Capabilities use a native sticky scroll runway on roomy desktop viewports: scrolling selects Build, Connect, then Run, and scrolling backward reverses the sequence. Click and keyboard selection move to the matching position. Short and mobile viewports show all chapters in document flow with sticky navigation. No wheel interception is used.

Delivery stages now share a live four-module sculpture, coloring completed stages cobalt without replacing the canvas. All reusable models breathe and assemble gently while onscreen; pause/reduced-motion retains meaningful stage colors with static geometry. The original hero retains its own existing motion.

Current motion checks: desktop forward/backward tab progression stays pinned at 100px; mobile exposes chapters in flow. Both tested viewports have moving WebGL scenes, no browser errors, no horizontal overflow, and no WCAG A/AA axe findings. Pause and reduced-motion checks confirm static scenes, and forced WebGL failure keeps the fallback visible.

## Restrained playful interactions and colour trial

Accordion groups now allow one expanded item each, with smooth sibling closing and interruptible keyboard/mouse toggles. Integration selection lifts and highlights its matching 3D module and connecting cable. Pointer tilt is slightly more expressive; link underlines and control presses offer small feedback. Existing pause, reduced motion, and no-WebGL paths remain.

Trial materials: cobalt brand surfaces, teal Simplify, amber Scale, violet Secure, and coral among connected modules, all with warm pearl caps. Selected integration modules retain their accent while surrounding modules become pearl. Dark mode lightens the same palette. Desktop/mobile checks confirm exclusive disclosure state, rapid reversal, model selection, no page errors, and no horizontal overflow.

## Assembly choreography

Models now move their components rather than continuously rotating: layered systems slide apart and reassemble on a smooth nine-second cycle, growth columns rise in sequence, the lock seats gently, and the active delivery module lifts. Network scenes carry small coloured signal beads along the real connecting curves. The hero frames separate and regroup while smaller pieces drift; its Explore control still opens the assembly. Pointer tilt remains as feedback, while automatic yaw and continuous spinning are removed. Scene loops stop offscreen/hidden and reduced motion leaves static geometry and selection colours. Existing tests, lint/type checks, production build, and bundle budgets pass; browser checks cover desktop/light, mobile/dark, exclusive accordions, reduced motion, pause, and WebGL fallback.

## Distinct models and organised capability journey

Delivery now assembles a 3×3×3 cube from its foundation, through a visible framework, into a complete structure. Integration uses a central core with five curved signal paths and selectable satellite nodes. Capabilities now have four areas: Build, Connect, AI, and Run. Their artworks are layered construction, coupled automation gears, an AI core, and a monitored server tower. Case studies use a certification sculpture and a shared-event timeline instead of the repeated layered/network artwork; their no-WebGL fallbacks also differ.

The capability heading stays with the scroll journey. Services use a bento composition; capability sculptures are larger and have transparent backgrounds. Mobile shows all chapters, with sticky heading and navigation, while keyboard/click navigation follows the chosen chapter. Hero labels name People, Process, and Technology; the established-tools block is larger. Quantity metrics count once on entry; the year stays factual and uses a brief arrival transition. Simplify resolves scattered plates, Scale builds columns, and Secure closes its lock then holds a protective perimeter.

Scene instances release their WebGL resources when offscreen, and explicitly lose disposed contexts, keeping repeated scrolling and tab switching within browser context limits. Pause/reduced motion retains static geometry and meaningful selected colours. Tested at 1045/888 and 1440/1000 desktop, and 390/888 and 320/800 mobile, across light/dark themes: all four scroll stages and delivery stages, no horizontal overflow, no browser errors, and no WCAG A/AA axe findings. Keyboard, exclusive accordions, moving signal scenes, pause, reduced-number rendering, and forced no-WebGL fallback were checked separately. All 18 existing tests, content validation, TypeScript, ESLint, webpack production export, and bundle budgets pass. Initial JS is 174 KB Brotli against 180 KB; lazy Three.js is 151.6 KB against 320 KB.

## Simplified sculptures and business areas

- Training now uses four joined pieces; tourism uses one calendar with a single event marker. Their non-WebGL fallbacks follow the same silhouettes.
- Automation gears face the visitor directly. AI is a larger, single inset core with one small companion shape.
- Integration uses five parallel input channels converging on a shared manifold, with packets following the active accordion.
- Each business area has a dedicated abstract sculpture: people, growth, operations, balance, and industry. Contact uses two open brackets meeting around a shared point.
- All additions reuse the existing visibility-based scene lifecycle, Pause control, and reduced-motion behaviour.
- Validation: TypeScript, ESLint, 18 tests, static production build and bundle budgets; desktop/mobile browser checks reported no runtime errors, overflow, or WCAG A/AA violations.
