import { mapRange } from './math'

/**
 * Maps the pinned story's scroll progress (0..1) to a scene stage with plateaus, so each principle
 * holds its shape long enough to read: chaos → [morph] → simplify (hold) → scale (hold) → secure (hold).
 */
export function storyStage(progress: number): number {
  const p = Math.min(1, Math.max(0, progress))
  if (p < 0.12) return mapRange(p, 0, 0.12, 0, 1)
  if (p < 0.32) return 1
  if (p < 0.44) return mapRange(p, 0.32, 0.44, 1, 2)
  if (p < 0.64) return 2
  if (p < 0.76) return mapRange(p, 0.64, 0.76, 2, 3)
  return 3
}

/** Which principle (0..2) the copy should show for a given progress. */
export function storyStep(progress: number): number {
  const s = storyStage(progress)
  return Math.min(2, Math.max(0, Math.round(s) - 1))
}
