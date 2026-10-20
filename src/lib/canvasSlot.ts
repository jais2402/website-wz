// Only one WebGL scene may be mounted at a time. The home hero publishes whether its loom is on screen; the fixed
// story/globe canvas waits until the hero is gone before it mounts (and unmounts as soon as it is back).

type Listener = (heroVisible: boolean) => void
const listeners = new Set<Listener>()
let heroVisible = false

export const canvasSlot = {
  get heroVisible() {
    return heroVisible
  },
  setHeroVisible(v: boolean) {
    if (v === heroVisible) return
    heroVisible = v
    listeners.forEach((l) => l(v))
  },
  subscribe(l: Listener) {
    listeners.add(l)
    return () => {
      listeners.delete(l)
    }
  },
}
