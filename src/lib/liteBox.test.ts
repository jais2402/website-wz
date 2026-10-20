import { liteBox } from './liteBox'

describe('liteBox', () => {
  it('desktop: from just under the panel to the right and bottom screen edges', () => {
    for (const [vw, vh, panelRight] of [
      [1227, 705, 649],
      [1440, 900, 716],
      [2560, 1440, 1070],
    ]) {
      const b = liteBox(vw, vh, 83, panelRight, 120)
      expect(b.left).toBe(panelRight - 48)
      expect(b.left + b.width).toBe(vw)
      expect(b).toMatchObject({ top: 0, height: vh })
    }
  })

  it('phones: the strip between the header and the panel', () => {
    expect(liteBox(390, 844, 82, 374, 174)).toEqual({ left: 0, top: 86, width: 390, height: 80 })
  })

  it('never returns a negative size', () => {
    expect(liteBox(390, 600, 82, 374, 60).height).toBe(0)
    expect(liteBox(1000, 700, 83, 1100, 100).width).toBe(0)
  })
})
