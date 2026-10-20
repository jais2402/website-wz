// Render budget for the WebGL scenes: the same look on every machine, at a cost built-in laptop graphics can carry.
// A 3D canvas never renders more than PIXEL_BUDGET pixels; the browser scales it up to fill the screen. The threads
// are soft and glowing, so the difference is hard to see, while a 1920x1080 screen at 125% Windows scaling draws
// about half the pixels it used to.

export const PIXEL_BUDGET = 1_600_000

/** Pixel ratio to render a width x height (CSS px) canvas at: the screen's own, capped by the budget, at least 0.75. */
export function budgetDpr(width: number, height: number, deviceDpr: number, budget = PIXEL_BUDGET): number {
  const dpr = deviceDpr > 0 ? deviceDpr : 1
  const area = Math.max(1, width * height)
  const cap = Math.sqrt(budget / area)
  return Math.round(Math.max(0.75, Math.min(dpr, 2, cap)) * 100) / 100
}
