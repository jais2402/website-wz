import { type CSSProperties, useEffect, useRef, useState } from 'react'
import { coverPoint, flyScale, type Pt, zoomInset } from '@/lib/gfx'
import { type PosterVideo, SceneVideo } from './SceneVideo'
import { ThreadFlow } from './ThreadFlow'

export type PosterImage = {
  avif: string
  webp: string
  width: number
  height: number
  placeholder: string
  /** Where the loom mouth is in the still (0..1); the thread flow converges on it. */
  mouth?: Pt
  /** A looping video of the live scene (scripts/capture-hero-video.mjs). */
  video?: PosterVideo
}
export type Poster = { desktop: PosterImage; mobile: PosterImage }

// The fly-in stops at this zoom (the live camera goes to about 1.85x): the still and video are drawn at about the
// screen's size, and past this they visibly soften.
const MAX_ZOOM = 1.4
// Chrome pauses a muted autoplaying video it considers mostly off screen; a video scaled up with a transform is
// (its box spills far past the viewport), so the video zooms inside its own box where the browser can.
const VIEW_BOX =
  typeof CSS !== 'undefined' && typeof CSS.supports === 'function' && CSS.supports('object-view-box', 'inset(1px)')

/**
 * A still of a 3D scene (captured from the real scene by scripts/capture-posters.mjs), shown before the live scene
 * and instead of it on machines that can't run it. Fills its box like the canvas: centred, cover. Portrait screens
 * get the phone still, which matches the scenes' own portrait framing (they switch on height > width).
 *
 * `drift`: the live camera's scroll fly-in (progress 0..1, read every frame from a store, never through React state),
 * as a zoom on the loom mouth, so the still (or its video) travels into the loom the way the live scene does. `flow`: light running along the threads
 * into the loom mouth (ThreadFlow), drawn while the still is showing. `video`: play the scene's looping video over
 * the still instead (SceneVideo); the flow stops while it plays. All off under reduced motion.
 */
export function ScenePoster({
  poster,
  priority = false,
  hidden = false,
  drift,
  flow = false,
  video = false,
  onLoad,
  onVideo,
}: {
  poster: Poster
  priority?: boolean
  hidden?: boolean
  drift?: { progress: () => number; active: boolean }
  flow?: boolean
  video?: boolean
  onLoad?: () => void
  /** The video started (true) or stopped (false) playing over the still. */
  onVideo?: (playing: boolean) => void
}) {
  const [videoOn, setVideoOn] = useState(false)
  const img = useRef<HTMLImageElement>(null)
  const layer = useRef<HTMLDivElement>(null)
  const root = useRef<HTMLDivElement>(null)
  // Which still the <picture> shows (same media query as its <source>s), for the flow's mouth position.
  const [portrait, setPortrait] = useState(() => window.matchMedia('(orientation: portrait)').matches)
  useEffect(() => {
    const mq = window.matchMedia('(orientation: portrait)')
    const on = () => setPortrait(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  const still = portrait ? poster.mobile : poster.desktop
  const { desktop: d, mobile: m } = poster
  const driftOn = !!drift?.active
  const progress = drift?.progress

  // The image may already be decoded (cache) before React attaches onLoad.
  const loaded = useRef(onLoad)
  useEffect(() => {
    loaded.current = onLoad
  }, [onLoad])
  useEffect(() => {
    const el = img.current
    if (el?.complete && el.naturalWidth) loaded.current?.()
  }, [])

  useEffect(() => {
    const el = layer.current
    if (!el || !driftOn || !progress) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    // Zoom in on the loom mouth as the live camera flies in (it keeps the mouth where it is on screen), damped
    // like the camera so a scroll flick eases in rather than jumping.
    const box = { width: 0, height: 0 }
    let o: Pt = { x: 0, y: 0 }
    let shown = 0
    const fit = () => {
      box.width = el.clientWidth
      box.height = el.clientHeight
      o = still.mouth ? coverPoint(still.mouth, still, box) : { x: box.width / 2, y: box.height / 2 }
      el.style.transformOrigin = `${o.x.toFixed(1)}px ${o.y.toFixed(1)}px`
      shown = 0
    }
    const vid = still.video
    fit()
    // The layer fills the viewport-sized hero stage, so it only changes size with the window.
    window.addEventListener('resize', fit)
    let raf = 0
    let last = 0
    const target = () => Math.min(MAX_ZOOM, flyScale(progress(), portrait))
    let scale = target()
    const tick = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0
      last = now
      scale += (target() - scale) * (1 - Math.exp(-2.2 * dt))
      if (Math.abs(scale - shown) > 0.0005) {
        shown = scale
        el.style.transform = `scale(${scale.toFixed(4)})`
        const v = root.current?.querySelector<HTMLVideoElement>('.scene-video')
        if (v && vid) {
          if (VIEW_BOX) {
            const i = zoomInset(o, scale, box, vid)
            v.style.setProperty(
              'object-view-box',
              `inset(${i.top.toFixed(1)}px ${i.right.toFixed(1)}px ${i.bottom.toFixed(1)}px ${i.left.toFixed(1)}px)`,
            )
          } else {
            v.style.transformOrigin = el.style.transformOrigin
            v.style.transform = el.style.transform
          }
        }
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', fit)
    }
  }, [driftOn, progress, portrait, still])

  return (
    <div
      ref={root}
      className={`scene-poster${hidden ? ' is-hidden' : ''}`}
      style={{ '--ph-d': `url("${d.placeholder}")`, '--ph-m': `url("${m.placeholder}")` } as CSSProperties}
      aria-hidden="true"
    >
      <div ref={layer} className="scene-poster-layer">
        <picture>
          <source media="(orientation: portrait)" type="image/avif" srcSet={`${m.avif} ${m.width}w`} sizes="100vw" />
          <source media="(orientation: portrait)" type="image/webp" srcSet={`${m.webp} ${m.width}w`} sizes="100vw" />
          <source type="image/avif" srcSet={`${d.avif} ${d.width}w`} sizes="100vw" />
          <img
            ref={img}
            src={d.webp}
            srcSet={`${d.webp} ${d.width}w`}
            sizes="100vw"
            width={d.width}
            height={d.height}
            alt=""
            decoding="async"
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'auto'}
            onLoad={() => onLoad?.()}
            onError={() => onLoad?.()}
          />
        </picture>
        {still.mouth && <ThreadFlow mouth={still.mouth} image={still} active={flow && !hidden && !videoOn} />}
      </div>
      {still.video && (
        <SceneVideo
          video={still.video}
          play={video && !hidden}
          onPlaying={(on) => {
            setVideoOn(on)
            onVideo?.(on)
          }}
        />
      )}
    </div>
  )
}
