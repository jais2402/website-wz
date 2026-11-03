// Mutable bridge between the AI hero's DOM handlers and its WebGL core (AiCore.tsx): the pointer and scroll write,
// the render loop reads. Never React state: these change every frame.

export const coreStore = {
  /** Pointer over the hero, -1..1 on each axis (0 when the pointer is coarse or away). */
  px: 0,
  py: 0,
  /** How far the hero has scrolled away, 0 (at rest) .. 1 (gone). */
  scroll: 0,
}
