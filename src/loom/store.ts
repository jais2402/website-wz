// Mutable bridge from scroll (GSAP) to the loom render loop. Read in useFrame, never React state.
export const loomStore = {
  /** 0..1 progress through the pinned hero; drives the camera fly-in. */
  progress: 0,
  /** 0..1 how much the tangle calms down as you scroll. */
  order: 0,
  /** Where the glowing loom mouth is on the hero canvas, as 0..1 fractions (written each frame). */
  mouth: { x: 0.56, y: 0.34 },
}
