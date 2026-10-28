import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { formatStudio } from '@/lib/studio'

// Video studio (dev only, /studio.html): tune the hero loom's threads, speed and sharpness against a live preview,
// then record the poster video with exactly those settings (scripts/vite-studio.ts runs the capture scripts).

type View = 'desktop' | 'mobile'
type Status = {
  running: boolean
  log: string[]
  error: string | null
  files: { name: string; kb: number; mtime: number }[]
}

const FRAME: Record<View, { width: number; height: number }> = {
  desktop: { width: 1920, height: 1080 },
  mobile: { width: 390, height: 844 },
}
// Everything but the canvas hidden, as in the recording.
const BARE = 'body *{visibility:hidden!important} canvas{visibility:visible!important}'

type Settings = {
  threads: number
  speed: number
  dpr: number
  glow: number
  cam: number
  seconds: number
  crf: number
  desktop: number
  mobile: number
  only: '' | View
  poster: boolean
}

const START: Settings = {
  threads: 0.5,
  speed: 0.6,
  dpr: 2,
  glow: 1,
  cam: 0,
  seconds: 10,
  crf: 30,
  desktop: 1920,
  mobile: 780,
  only: '',
  poster: true,
}

function Slider({
  label,
  hint,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string
  hint: string
  value: number
  min: number
  max: number
  step: number
  format: (v: number) => string
  onChange: (v: number) => void
}) {
  return (
    <label className="st-field">
      <span className="st-row">
        <span className="st-label">{label}</span>
        <output className="st-value">{format(value)}</output>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(+e.target.value)} />
      <span className="st-hint">{hint}</span>
    </label>
  )
}

function Preview({ view, studio }: { view: View; studio: string }) {
  const box = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.4)
  const frame = FRAME[view]
  // The settings land in the URL; wait for the slider to settle before reloading the scene.
  const [src, setSrc] = useState(`/?gfx=live&studio=${studio}`)
  useEffect(() => {
    const t = window.setTimeout(() => setSrc(`/?gfx=live&studio=${studio}`), 500)
    return () => window.clearTimeout(t)
  }, [studio])

  useEffect(() => {
    const el = box.current
    if (!el) return
    const fit = () => setScale(Math.min(el.clientWidth / frame.width, el.clientHeight / frame.height))
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [frame])

  return (
    <div ref={box} className="st-preview">
      <iframe
        key={`${view}${src}`}
        title="Hero loom preview"
        src={src}
        width={frame.width}
        height={frame.height}
        style={{ transform: `translate(-50%, -50%) scale(${scale})` }}
        onLoad={(e) => {
          const doc = e.currentTarget.contentDocument
          if (!doc) return
          const style = doc.createElement('style')
          style.textContent = BARE
          doc.head.append(style)
        }}
      />
    </div>
  )
}

export function Studio() {
  const [s, setS] = useState<Settings>(START)
  const [view, setView] = useState<View>('desktop')
  const [status, setStatus] = useState<Status | null>(null)
  const [busy, setBusy] = useState(false)
  const set = <K extends keyof Settings>(key: K, value: Settings[K]) => setS((p) => ({ ...p, [key]: value }))
  const studio = useMemo(
    () => formatStudio({ threads: s.threads, speed: s.speed, dpr: s.dpr, glow: s.glow, cam: s.cam }),
    [s.threads, s.speed, s.dpr, s.glow, s.cam],
  )

  const poll = useCallback(async () => {
    try {
      const r = await fetch('/__studio/status')
      setStatus(await r.json())
    } catch {
      // Dev server restarting: try again on the next tick.
    }
  }, [])
  useEffect(() => {
    // First read straight away (off the effect's own turn), then every second while recording.
    const first = window.setTimeout(poll, 0)
    const t = window.setInterval(poll, busy || status?.running ? 1000 : 5000)
    return () => {
      window.clearTimeout(first)
      window.clearInterval(t)
    }
  }, [poll, busy, status?.running])

  const log = useRef<HTMLPreElement>(null)
  useEffect(() => {
    log.current?.scrollTo({ top: log.current.scrollHeight })
  }, [status?.log.length])

  const record = async () => {
    setBusy(true)
    const r = await fetch('/__studio/record', { method: 'POST', body: JSON.stringify(s) })
    if (!r.ok) setStatus((p) => p && { ...p, error: 'Could not start: is another recording running?' })
    await poll()
    setBusy(false)
  }
  const stop = () => fetch('/__studio/stop', { method: 'POST' }).then(poll)

  const running = !!status?.running
  const file = (name: string) => status?.files.find((f) => f.name === name)
  const progress = useMemo(() => {
    const lines = status?.log ?? []
    if (!running) return lines.at(-1) === 'Done.' ? 'Done' : ''
    for (let i = lines.length - 1; i >= 0; i--) {
      const m = lines[i].match(/frame (\d+)\/(\d+)/)
      if (m) return `${lines.findLast((l) => l.includes('capturing'))?.split(':')[0] ?? ''} ${m[1]}/${m[2]} frames`
    }
    return running ? 'Starting…' : ''
  }, [status?.log, running])

  return (
    <div className="st">
      <aside className="st-panel">
        <header>
          <h1>Video studio</h1>
          <p>
            The hero loom video for machines that show the still instead of the live scene. Tune it against the preview,
            then record.
          </p>
        </header>
        <div className="st-actions">
          {running ? (
            <button type="button" className="st-btn is-stop" onClick={stop}>
              Stop
            </button>
          ) : (
            <button type="button" className="st-btn" onClick={record} disabled={busy}>
              Record
            </button>
          )}
          <span className="st-progress">{progress}</span>
        </div>
        {status?.error && <p className="st-error">{status.error}</p>}

        <section>
          <h2>Scene</h2>
          <Slider
            label="Threads"
            hint="Share of the threads and riders drawn. Fewer reads cleaner and makes the video much smaller."
            value={s.threads}
            min={0.1}
            max={1}
            step={0.05}
            format={(v) => `${Math.round(v * 100)}%`}
            onChange={(v) => set('threads', v)}
          />
          <Slider
            label="Speed"
            hint="1× is the live site."
            value={s.speed}
            min={0.2}
            max={1.5}
            step={0.05}
            format={(v) => `${v.toFixed(2)}×`}
            onChange={(v) => set('speed', v)}
          />
          <Slider
            label="Sharpness"
            hint="Render pixel ratio. The live site renders at about 0.9 on a 1080p screen; 2 draws finer, crisper threads."
            value={s.dpr}
            min={1}
            max={3}
            step={0.25}
            format={(v) => `${v.toFixed(2)}×`}
            onChange={(v) => set('dpr', v)}
          />
          <Slider
            label="Glow"
            hint="Thread brightness and bloom. Sharper renders are already made up for automatically; raise this if fewer threads look dim."
            value={s.glow}
            min={0.5}
            max={3}
            step={0.1}
            format={(v) => `${v.toFixed(1)}×`}
            onChange={(v) => set('glow', v)}
          />
          <Slider
            label="Camera"
            hint="Where the camera is held: 0 is the top of the hero, 1 is fully flown in at the end of its scroll (threads straightened). Scrolling the preview does nothing."
            value={s.cam}
            min={0}
            max={1}
            step={0.01}
            format={(v) => v.toFixed(2)}
            onChange={(v) => set('cam', v)}
          />
        </section>

        <section>
          <h2>Video</h2>
          <Slider
            label="Loop length"
            hint="The end blends into the start over a third of a second."
            value={s.seconds}
            min={4}
            max={20}
            step={1}
            format={(v) => `${v} s`}
            onChange={(v) => set('seconds', v)}
          />
          <Slider
            label="Quality (CRF)"
            hint="Lower is sharper and bigger. Above about 36 the thread colours wash out to grey."
            value={s.crf}
            min={22}
            max={40}
            step={1}
            format={(v) => String(v)}
            onChange={(v) => set('crf', v)}
          />
          <div className="st-two">
            <label className="st-field">
              <span className="st-label">Desktop width</span>
              <select value={s.desktop} onChange={(e) => set('desktop', +e.target.value)}>
                {[1280, 1600, 1920, 2560].map((w) => (
                  <option key={w} value={w}>
                    {w} × {Math.round((w * 9) / 16)}
                  </option>
                ))}
              </select>
            </label>
            <label className="st-field">
              <span className="st-label">Phone width</span>
              <select value={s.mobile} onChange={(e) => set('mobile', +e.target.value)}>
                {[584, 780, 1170].map((w) => (
                  <option key={w} value={w}>
                    {w} × {Math.round((w * 844) / 390 / 2) * 2}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="st-field">
            <span className="st-label">Record</span>
            <select value={s.only} onChange={(e) => set('only', e.target.value as Settings['only'])}>
              <option value="">Desktop and phone</option>
              <option value="desktop">Desktop only</option>
              <option value="mobile">Phone only</option>
            </select>
          </label>
          <label className="st-check">
            <input type="checkbox" checked={s.poster} onChange={(e) => set('poster', e.target.checked)} />
            Take a still of the first frame too
          </label>
        </section>

        <pre ref={log} className="st-log">
          {status?.log.join('\n') ||
            'Recording runs the real scene frame by frame in a headless Chrome: about 1 minute per 100 frames.'}
        </pre>
      </aside>

      <main className="st-main">
        <div className="st-tabs" role="tablist">
          {(['desktop', 'mobile'] as const).map((v) => (
            <button key={v} type="button" role="tab" aria-selected={view === v} onClick={() => setView(v)}>
              {v === 'desktop' ? 'Desktop' : 'Phone'}
            </button>
          ))}
          <span className="st-url">?studio={studio}</span>
        </div>
        <Preview view={view} studio={studio} />

        <h2>Recorded</h2>
        <div className="st-results">
          {(['desktop', 'mobile'] as const).map((v) => {
            const mp4 = file(`hero-${v}.mp4`)
            const webm = file(`hero-${v}.webm`)
            return (
              <figure key={v} className={`st-result is-${v}`}>
                {mp4?.kb ? (
                  <video
                    key={mp4.mtime}
                    src={`/__studio/file/hero-${v}.mp4?v=${mp4.mtime}`}
                    muted
                    loop
                    autoPlay
                    playsInline
                    controls
                  />
                ) : (
                  <div className="st-empty">No video yet</div>
                )}
                <figcaption>
                  {v === 'desktop' ? 'Desktop' : 'Phone'}: MP4 {mp4?.kb ? `${(mp4.kb / 1024).toFixed(1)} MB` : '–'},
                  WebM {webm?.kb ? `${(webm.kb / 1024).toFixed(1)} MB` : '–'}
                  {mp4?.mtime ? ` · ${new Date(mp4.mtime).toLocaleTimeString()}` : ''}
                </figcaption>
              </figure>
            )
          })}
        </div>
        <p className="st-note">
          Recordings are saved to <code>captures/studio/</code> (videos, stills and the settings used). The site itself
          is not changed.
        </p>
      </main>
    </div>
  )
}
