import { activeIndex, areaPath, formatNumber, heatCells, linePath, tabFill } from './charts'

describe('linePath', () => {
  it('spans the full width and maps the max to the top padding', () => {
    const d = linePath([0, 10], 100, 40, 4)
    expect(d).toBe('M0.00 36.00 L100.00 4.00')
  })

  it('handles flat and empty series', () => {
    expect(linePath([], 100, 40)).toBe('')
    expect(linePath([5, 5, 5], 100, 40)).toContain('M0.00')
  })
})

describe('areaPath', () => {
  it('closes the line down to the baseline', () => {
    expect(areaPath([1, 2], 100, 40)).toMatch(/L100 40 L0 40 Z$/)
  })
})

describe('formatNumber', () => {
  it('uses Indian grouping and fixed decimals', () => {
    expect(formatNumber(1284)).toBe('1,284')
    expect(formatNumber(100000)).toBe('1,00,000')
    expect(formatNumber(96.4, 1)).toBe('96.4')
    expect(formatNumber(3, 1)).toBe('3.0')
  })
})

describe('heatCells', () => {
  it('is deterministic and within 0.25..1', () => {
    const a = heatCells(28, 3)
    expect(a).toEqual(heatCells(28, 3))
    expect(a.every((v) => v >= 0.25 && v <= 1)).toBe(true)
  })
})

describe('activeIndex / tabFill', () => {
  it('splits progress into equal slices per system', () => {
    expect(activeIndex(0, 5)).toBe(0)
    expect(activeIndex(0.19, 5)).toBe(0)
    expect(activeIndex(0.2, 5)).toBe(1)
    expect(activeIndex(1, 5)).toBe(4)
  })

  it('fills earlier tabs completely and later tabs not at all', () => {
    expect(tabFill(0.5, 5, 0)).toBe(1)
    expect(tabFill(0.5, 5, 2)).toBeCloseTo(0.5)
    expect(tabFill(0.5, 5, 4)).toBe(0)
  })
})
