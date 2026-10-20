import { budgetDpr, PIXEL_BUDGET } from './render'

const pixels = (w: number, h: number, dpr: number) => w * dpr * h * dpr

describe('budgetDpr', () => {
  it('keeps the screen pixel ratio when the canvas is within budget', () => {
    expect(budgetDpr(640, 480, 2)).toBe(2)
    expect(budgetDpr(375, 812, 3)).toBe(2) // never above 2
  })

  it('caps full-HD and larger canvases at the pixel budget', () => {
    for (const [w, h, d] of [
      [1920, 1080, 1],
      [1536, 864, 1.25], // 1920x1080 at 125% Windows scaling
      [1440, 900, 2], // retina laptop
    ])
      expect(pixels(w, h, budgetDpr(w, h, d))).toBeLessThanOrEqual(PIXEL_BUDGET * 1.01)
  })

  it('never drops below 0.75, so big monitors stay sharp enough, and handles bad input', () => {
    expect(budgetDpr(2560, 1440, 1)).toBe(0.75)
    expect(budgetDpr(3840, 2160, 1)).toBe(0.75)
    expect(budgetDpr(1000, 600, 0)).toBe(1)
  })
})
