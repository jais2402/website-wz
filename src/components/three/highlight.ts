/**
 * Which list item the reader is pointing at, per scene, shared with the stage.
 *
 * design.md §5.1: neutral by default, colour on attention. The scene needs to
 * know which row is open so it can bring that part to full hue and dim the rest.
 *
 * Keyed BY SCENE. This used to be a single slot for the whole page, and every
 * sequence wrote to it on mount — build, then range, then integration — so the
 * last one to mount won. A sequence only re-asserts when its open row changes,
 * so range's first row never lit its part in the model: open in the list,
 * dark in the scene. Each section now owns its own scene's highlight.
 *
 * A module-level channel rather than React state: it changes at pointer rate
 * and must never re-render the tree.
 */

type Listener = (scene: string, index: number) => void;

const listeners = new Set<Listener>();
const current = new Map<string, number>();

export function setHighlight(scene: string, index: number) {
  if (current.get(scene) === index) return;
  current.set(scene, index);
  for (const l of listeners) l(scene, index);
}

/** Subscribes, and replays every scene's current highlight to the new listener. */
export function onHighlight(listener: Listener) {
  listeners.add(listener);
  for (const [scene, index] of current) listener(scene, index);
  return () => { listeners.delete(listener); };
}
