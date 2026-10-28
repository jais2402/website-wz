import { useEffect, useState } from 'react'
import { gfx } from '@/gfx/gfxMode'
import { badgeChoice, heroView, shortRenderer } from '@/lib/testBadge'
import { webgl } from '@/lib/webgl'

const KEY = 'test-badge'

function shouldShow() {
  let stored: string | null = null
  try {
    stored = window.sessionStorage.getItem(KEY)
  } catch {
    // Storage blocked: the URL still works for this page.
  }
  const choice = badgeChoice(
    { dev: import.meta.env.DEV, vercelEnv: String(import.meta.env.VITE_VERCEL_ENV ?? '') },
    window.location.search,
    stored,
  )
  try {
    if (choice.store) window.sessionStorage.setItem(KEY, choice.store)
  } catch {
    // Not remembered; nothing else changes.
  }
  return choice.show
}

/** What the hero shows, read off the page (the badge is a test aid, so it watches rather than wires into the hero). */
function readHero() {
  const hero = document.querySelector('.loom-hero')
  const r = hero?.getBoundingClientRect()
  return heroView({
    onScreen: !!r && r.bottom > 0 && r.top < window.innerHeight,
    live3d: !!document.querySelector('.loom-canvas.is-ready canvas'),
    videoPlaying: !!document.querySelector('.loom-hero .scene-video.is-playing'),
  })
}

/**
 * Testing badge, bottom centre: whether this device draws the hero as live 3D, its video or the still, and the
 * story/globe as 3D (lighter in poster mode) or 2D (no WebGL), with the GPU tier behind the choice. Shown on dev and
 * the testing preview; ?badge=1 shows it anywhere, ?badge=0 hides it.
 */
export function TestBadge() {
  const [show] = useState(shouldShow)
  const [hero, setHero] = useState(readHero)
  // The hero's own last on-screen view, so scrolling away keeps the answer to "how did it render?".
  const [seen, setSeen] = useState<string | null>(null)

  useEffect(() => {
    if (!show) return
    const t = window.setInterval(() => {
      const v = readHero()
      setHero(v)
      if (v !== 'Off screen') setSeen(v)
    }, 500)
    return () => window.clearInterval(t)
  }, [show])

  if (!show) return null
  const story = !webgl ? '2D' : gfx.live ? '3D' : '3D lite'
  const heroText = hero === 'Off screen' && seen ? `${seen} (off screen)` : hero
  return (
    <div className="test-badge mono" role="status" aria-live="off">
      <span>
        Hero <b data-v={hero === 'Off screen' ? seen : hero}>{heroText}</b>
      </span>
      <span>
        Story/globe <b data-v={story}>{story}</b>
      </span>
      <span title={gfx.renderer}>
        GPU {document.documentElement.dataset.gfx ?? gfx.tier} · {shortRenderer(gfx.renderer)}
        {gfx.mode !== 'auto' ? ` · ?gfx=${gfx.mode}` : ''}
      </span>
    </div>
  )
}
