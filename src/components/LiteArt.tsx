// Lite tier (no GPU acceleration): stills of the real WebGL scenes instead of the live 3D. No three.js is loaded.
// The stills are captured from the full site by scripts/capture-lite-posters.mjs into public/lite/.

type Poster = 'loom-hero' | 'loom-contact' | 'loom-spindle' | 'loom-frayed' | 'globe'

function Still({ name, className = '', eager = false }: { name: string; className?: string; eager?: boolean }) {
  return (
    <img
      className={`lite-poster ${className}`.trim()}
      src={`/lite/${name}.webp`}
      alt=""
      aria-hidden="true"
      decoding="async"
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager ? 'high' : 'auto'}
      draggable={false}
    />
  )
}

/** The loom: the home hero by default, or the contact / About (spindle) / 404 (frayed) loom. */
export function LoomLiteArt({ poster = 'loom-hero' }: { poster?: Exclude<Poster, 'globe'> }) {
  return <Still name={poster} className="lite-loom" eager={poster === 'loom-hero'} />
}

const STORY = ['story-simplify', 'story-scale', 'story-secure']

/** Story: the woven panel, the cone and the sphere; the active principle fades in. */
export function StoryLiteArt({ step }: { step: number }) {
  return (
    <div className="lite-story" aria-hidden="true">
      {STORY.map((name, i) => (
        <Still key={name} name={name} className={i === step ? 'is-on' : ''} />
      ))}
    </div>
  )
}

/** Countries: the globe with its arcs from Chennai. */
export function GlobeLiteArt() {
  return <Still name="globe" className="lite-globe" />
}
