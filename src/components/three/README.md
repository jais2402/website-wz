# three/ — the scene contract

Owner: the `3d-engineer` agent. Rules live in `.claude/design.md` §5 and
`.claude/architecture.md` §4. Read both before adding a file here.

## Files

| File | Responsibility |
|---|---|
| `SceneCanvas.tsx` | The only `<Canvas>`. Lazy-mounted after first paint, fixed behind content, `aria-hidden`, unmounts when WebGL is unavailable |
| `useScrollState.ts` | One rAF loop. Produces `{ sectionIndex, progress, side, paused }`. Nothing else may own a rAF loop |
| `states/*.ts` | One pure function per section: `(time, sub, highlight) => SceneState`. No React, no side effects |
| `blend.ts` | Lerps state A to state B across the boundary band |
| `Instances.tsx` | One `InstancedMesh`, N=64 rounded boxes, shared geometry and material |
| `Callouts.tsx` | DOM overlay: dots at projected points, leader lines, aligned label column |
| `materials.ts` | Palette tokens converted to linear space once, pooled `THREE.Color` objects |

## Hard constraints

- One `InstancedMesh`. Draw calls under 100.
- `frameloop="demand"`; an idle page renders nothing.
- `dpr={[1, 1.75]}`, forced to `1` on low-power devices.
- No allocation and no `setState` inside `useFrame`.
- Damping is `k = 1 - exp(-dt * rate)` — identical motion at 30 and 120 fps.
- Four fallbacks, all tested: no WebGL, reduced motion, low-power, paused.
- The canvas is decorative. Every fact it shows also exists in the DOM as text.
