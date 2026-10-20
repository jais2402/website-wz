import { createGate } from './loadGate'

describe('createGate', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('opens once every job is done, reporting progress on the way', async () => {
    const g = createGate(['a', 'b'])
    expect(g.progress()).toBe(0)
    g.done('a')
    expect(g.progress()).toBe(0.5)
    expect(g.isReady()).toBe(false)
    g.done('a') // repeated: ignored
    g.done('zzz') // unknown: ignored
    expect(g.progress()).toBe(0.5)
    g.done('b')
    await g.ready
    expect(g.isReady()).toBe(true)
    expect(g.progress()).toBe(1)
  })

  it('opens after the timeout even if a job never finishes', async () => {
    const g = createGate(['a', 'b'], 5000)
    g.done('a')
    vi.advanceTimersByTime(5000)
    await g.ready
    expect(g.isReady()).toBe(true)
    expect(g.progress()).toBe(1)
  })

  it('is open at once with no jobs', async () => {
    const g = createGate([])
    await g.ready
    expect(g.isReady()).toBe(true)
  })
})
