import { storyStage, storyStep } from './story'

describe('storyStage', () => {
  it('starts in chaos and ends on the secure shape', () => {
    expect(storyStage(0)).toBe(0)
    expect(storyStage(1)).toBe(3)
  })

  it('holds a plateau on each principle', () => {
    expect(storyStage(0.2)).toBe(1)
    expect(storyStage(0.5)).toBe(2)
    expect(storyStage(0.9)).toBe(3)
  })

  it('is monotonic', () => {
    let prev = -1
    for (let p = 0; p <= 1; p += 0.01) {
      const s = storyStage(p)
      expect(s).toBeGreaterThanOrEqual(prev)
      prev = s
    }
  })
})

describe('storyStep', () => {
  it('maps to the three principles', () => {
    expect(storyStep(0)).toBe(0)
    expect(storyStep(0.2)).toBe(0)
    expect(storyStep(0.5)).toBe(1)
    expect(storyStep(0.9)).toBe(2)
  })
})
