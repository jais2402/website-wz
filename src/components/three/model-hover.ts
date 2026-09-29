/**
 * 3D → DOM hover: which bento tile the reader is pointing at IN THE MODEL.
 *
 * This is the mirror of `highlight.ts` (DOM → 3D) and deliberately a separate
 * channel, not a second writer onto the same one. `highlight.ts` carries a
 * hover state THE MODEL REACTS TO (box lift + colour); this one carries a
 * hover state a DOM TILE REACTS TO (background + icon lift). Nothing here
 * feeds back into `setHighlight`, so a pointer resting on a 3D module cannot
 * cause the module to move under it and re-trigger its own raycast hit — the
 * classic hover-jitter loop. The box a reader points at in the model does not
 * lift or recolour from this channel; only its DOM tile does.
 *
 * Keyed by content scene name (e.g. "disciplines"), same vocabulary as
 * `highlight.ts`, so `SequenceSection` never has to know the stage's internal
 * scene keys.
 */

type Listener = (scene: string, index: number) => void;

const listeners = new Set<Listener>();
const current = new Map<string, number>();

export function setModelHover(scene: string, index: number) {
  if (current.get(scene) === index) return;
  current.set(scene, index);
  for (const l of listeners) l(scene, index);
}

/** Subscribes, and replays every scene's current hover to the new listener. */
export function onModelHover(listener: Listener) {
  listeners.add(listener);
  for (const [scene, index] of current) listener(scene, index);
  return () => { listeners.delete(listener); };
}
