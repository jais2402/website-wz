/**
 * Pointer spotlight + tilt for sub-page cards (`data-spot`, handled in pages/shell.tsx): where the pointer sits
 * on the card as CSS custom properties. `--mx/--my` place the light, `--rx/--ry` tilt the card (tilt cards only).
 */
export type SpotRect = { left: number; top: number; width: number; height: number }

/** Max tilt in degrees around each axis. Kept small: the card should lean, not flip. */
export const TILT_X = 5
export const TILT_Y = 7

export function spotVars(clientX: number, clientY: number, r: SpotRect): Record<string, string> {
  const clamp = (v: number) => Math.min(1, Math.max(0, v))
  const x = r.width > 0 ? clamp((clientX - r.left) / r.width) : 0.5
  const y = r.height > 0 ? clamp((clientY - r.top) / r.height) : 0.5
  // + 0 turns -0 into 0, so a centred pointer reads "0deg".
  const round = (v: number) => Math.round(v * 100) / 100 + 0
  return {
    '--mx': `${round(x * 100)}%`,
    '--my': `${round(y * 100)}%`,
    '--rx': `${round((0.5 - y) * 2 * TILT_X)}deg`,
    '--ry': `${round((x - 0.5) * 2 * TILT_Y)}deg`,
  }
}
