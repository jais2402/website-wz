// Pointer tilt maths for the CSS 3D cards and the AI page's hero stage (pages/ai). Pure: no DOM, no React.

/** Where a pointer sits over a box, from -1 (left/top edge) to 1 (right/bottom edge), clamped. */
export function pointerOffset(
  clientX: number,
  clientY: number,
  box: { left: number; top: number; width: number; height: number },
): { x: number; y: number } {
  const clamp = (v: number) => (Number.isFinite(v) ? Math.max(-1, Math.min(1, v)) : 0)
  return {
    x: clamp(((clientX - box.left) / Math.max(1, box.width)) * 2 - 1),
    y: clamp(((clientY - box.top) / Math.max(1, box.height)) * 2 - 1),
  }
}

/**
 * Rotation (degrees) that turns a card toward the pointer: pointer right → the right edge comes forward
 * (rotateY positive), pointer down → the bottom edge comes forward (rotateX negative).
 */
export function tiltAngles(offset: { x: number; y: number }, maxDeg: number): { rx: number; ry: number } {
  // `+ 0` turns -0 into 0, so a centred pointer reads as no tilt at all.
  return { rx: -offset.y * maxDeg + 0, ry: offset.x * maxDeg + 0 }
}

/** Frame-rate independent ease toward a target (`rate` per second; higher is snappier). */
export function damp(current: number, target: number, rate: number, dtSeconds: number): number {
  return target + (current - target) * Math.exp(-rate * Math.max(0, dtSeconds))
}
