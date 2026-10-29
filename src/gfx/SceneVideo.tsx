import { useEffect, useRef, useState } from 'react'
import { drawsInSoftware } from './gfxMode'

export type PosterVideo = { webm: string; mp4: string; width: number; height: number }

/**
 * A looping video of the live scene (scripts/capture-hero-video.mjs), played over its poster on machines that show
 * the poster instead of the live scene. It loads only when asked to play (preload none), fades in once it is
 * actually playing, and pauses (fading back to the still) whenever `play` turns false. Never under reduced motion
 * or with the browser's data saver on. Without a graphics chip (drawsInSoftware) it plays the H.264 file only: the
 * processor decodes it, and AV1 is several times heavier to decode than H.264 at the same size.
 */
export function SceneVideo({
  video,
  play,
  onPlaying,
}: {
  video: PosterVideo
  play: boolean
  onPlaying?: (playing: boolean) => void
}) {
  const ref = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  // Read when the video mounts: a machine marked slow later switches to the poster, which mounts it afresh.
  const [light] = useState(drawsInSoftware)
  const report = useRef(onPlaying)
  useEffect(() => {
    report.current = onPlaying
  }, [onPlaying])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData
    if (!play || saveData || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.pause()
      return
    }
    // Autoplay needs the property, not only the attribute React renders.
    el.muted = true
    // play() returns a promise in browsers (rejects if autoplay is refused); older engines return nothing.
    el.play()?.catch(() => {})
  }, [play, video])

  const set = (on: boolean) => {
    setPlaying(on)
    report.current?.(on)
  }

  return (
    <video
      key={video.mp4}
      ref={ref}
      className={`scene-video${playing ? ' is-playing' : ''}${light ? ' is-light' : ''}`}
      width={video.width}
      height={video.height}
      muted
      loop
      playsInline
      preload="none"
      disablePictureInPicture
      aria-hidden="true"
      tabIndex={-1}
      onPlaying={() => set(true)}
      onPause={() => set(false)}
    >
      {light ? (
        <source src={video.mp4} type="video/mp4" />
      ) : (
        <>
          <source src={video.webm} type='video/webm; codecs="av01.0.08M.08"' />
          <source src={video.mp4} type="video/mp4" />
        </>
      )}
    </video>
  )
}
