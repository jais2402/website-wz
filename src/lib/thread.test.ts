import { threadPath } from './thread'

describe('threadPath', () => {
  it('is empty without knots', () => {
    expect(threadPath({ x: 0, y: 0 }, [])).toBe('')
  })

  it('starts at the loose end and finishes on the last knot', () => {
    const d = threadPath({ x: 10, y: 50 }, [
      { x: 300, y: 20 },
      { x: 600, y: 20 },
    ])
    expect(d.startsWith('M10 50')).toBe(true)
    expect(d.trim().endsWith('600 20')).toBe(true)
  })

  it('adds one curve per knot after the tangle', () => {
    const knots = [100, 200, 300].map((x) => ({ x, y: 0 }))
    const curves = threadPath({ x: 0, y: 0 }, knots).match(/C/g) ?? []
    expect(curves.length).toBe(2 + knots.length)
  })

  it('sags between knots', () => {
    const d = threadPath({ x: 0, y: 0 }, [{ x: 500, y: 0 }], 30)
    expect(d).toContain(' 30 ')
  })
})
