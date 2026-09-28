/**
 * Which list item the reader is pointing at, shared with the 3D stage.
 *
 * design.md §5.1: neutral by default, colour on attention. The scene needs to
 * know which row is open so it can bring that part to full hue and dim the
 * rest. This is a tiny module-level channel rather than context or state,
 * because it changes at pointer rate and must never re-render the tree.
 */

type Listener = (scene: string | null, index: number) => void;

const listeners = new Set<Listener>();
let currentScene: string | null = null;
let currentIndex = -1;

export function setHighlight(scene: string | null, index: number) {
  if (currentScene === scene && currentIndex === index) return;
  currentScene = scene;
  currentIndex = index;
  for (const l of listeners) l(scene, index);
}

export function onHighlight(listener: Listener) {
  listeners.add(listener);
  listener(currentScene, currentIndex);
  return () => { listeners.delete(listener); };
}
