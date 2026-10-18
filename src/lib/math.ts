// Pure helpers for scroll- and time-driven animation. Keep these free of three/React imports so they stay unit-testable.

export function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value))
}

/** Linearly remaps `value` from [inMin, inMax] to [outMin, outMax], clamped to the output range. */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin = 0,
  outMax = 1,
): number {
  if (inMax === inMin) return outMin
  const t = clamp((value - inMin) / (inMax - inMin))
  return outMin + (outMax - outMin) * t
}

/** Frame-rate independent exponential damping toward `target` (use with useFrame's delta). */
export function damp(current: number, target: number, lambda: number, delta: number): number {
  return current + (target - current) * (1 - Math.exp(-lambda * delta))
}
