// Mutable, non-React store bridging GSAP ScrollTriggers → the R3F render loop.
// Written on scroll, read inside useFrame. Never put this in React state (it would re-render every frame).

export const sceneStore = {
  /** Target morph stage, 0..4 (see lib/shapes.ts). Damped toward in the shader loop. */
  stage: 0,
  /** Whether any transparent "3D zone" is on screen. When false the canvas stops rendering. */
  visible: true,
  /** 0..1 extra camera push used for small scroll parallax. */
  dolly: 0,
  /** 0..1 how far the countries globe has faded in (story threads fade out by the same amount). */
  globe: 0,
  /** Index into `countries` of the hovered country (its thread lights up), or -1. */
  highlight: -1,
}
