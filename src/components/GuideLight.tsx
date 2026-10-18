import { useEffect, useRef, useState } from 'react'
import { gsap } from '@/hooks/motion'
import { guideSegment, type Span, travelScale } from '@/lib/guide'
import { damp } from '@/lib/math'
import { sceneStore } from '@/lib/sceneStore'
import { loomStore } from '@/loom/store'

type Point = { x: number; y: number }
type Anchor = { span: () => Span | null; pos: () => Point | null }

const rect = (sel: string) => document.querySelector(sel)?.getBoundingClientRect() ?? null

/** A pinned section: the light rests on it from the moment it pins until it unpins. */
const pinned = (sel: string): Anchor['span'] => () => {
  const r = rect(sel)
  return r ? { a: r.top + scrollY, b: r.bottom + scrollY - innerHeight } : null
}

/** A single point: the light rests on it when it crosses the middle of the screen. */
const point = (pos: () => Point | null): Anchor['span'] => () => {
  const p = pos()
  return p ? { a: p.y + scrollY - innerHeight / 2, b: p.y + scrollY - innerHeight / 2 } : null
}

const knot = () => {
  const r = rect('.weave-knot')
  return r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null
}

// The empty space to the right of the proof headline.
const proofSpot = () => {
  const t = rect('.proof-title')
  const w = document.querySelector('.proof-title')?.parentElement?.getBoundingClientRect()
  return t && w ? { x: w.left + w.width * 0.8, y: t.top + t.height * 0.5 } : null
}

// In scroll order: loom mouth (hero) → weave knot → story shape centre → beside the proof headline.
const ANCHORS: Anchor[] = [
  {
    span: pinned('.loom-hero'),
    pos: () => {
      const r = rect('.loom-sticky')
      return r ? { x: r.left + loomStore.mouth.x * r.width, y: r.top + loomStore.mouth.y * r.height } : null
    },
  },
  { span: point(knot), pos: knot },
  {
    span: pinned('.story'),
    pos: () => {
      const r = rect('.story-sticky')
      return r ? { x: sceneStore.core.x * innerWidth, y: r.top + sceneStore.core.y * innerHeight } : null
    },
  },
  { span: point(proofSpot), pos: proofSpot },
]

const TRAILS = [
  { lambda: 7, scale: 0.6 },
  { lambda: 4, scale: 0.4 },
]

/**
 * The guide light: the white glow from the loom mouth leaves the hero and leads the reader down the page,
 * resting on each key moment (the weave knot, the heart of each story shape, the proof headline).
 * Desktop only; not rendered in lite mode.
 */
export function GuideLight({ active }: { active: boolean }) {
  const root = useRef<HTMLDivElement>(null)
  const [wide, setWide] = useState(() => matchMedia('(min-width: 900px)').matches)

  useEffect(() => {
    const mq = matchMedia('(min-width: 900px)')
    const on = () => setWide(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])

  useEffect(() => {
    const el = root.current
    if (!wide || !el) return
    const parts = Array.from(el.children) as HTMLElement[]
    const [main, ...trails] = parts
    const cur = { x: -999, y: -999 }
    const trailPos = TRAILS.map(() => ({ x: -999, y: -999 }))
    let first = true

    const tick = (_t: number, deltaMs: number) => {
      const dt = Math.min(deltaMs / 1000, 0.05)
      const spans = ANCHORS.map((a) => a.span())
      if (spans.some((s) => !s)) return
      const seg = guideSegment(scrollY, spans as Span[])
      const from = ANCHORS[seg.from].pos()
      const to = ANCHORS[seg.to].pos()
      if (!from || !to) return
      const target = { x: from.x + (to.x - from.x) * seg.t, y: from.y + (to.y - from.y) * seg.t }

      if (first) {
        Object.assign(cur, target)
        trailPos.forEach((p) => Object.assign(p, target))
        first = false
      }
      cur.x = damp(cur.x, target.x, 16, dt)
      cur.y = damp(cur.y, target.y, 16, dt)
      const scale = travelScale(seg)
      main.style.transform = `translate3d(${cur.x}px, ${cur.y}px, 0) scale(${scale})`
      TRAILS.forEach((tr, i) => {
        trailPos[i].x = damp(trailPos[i].x, cur.x, tr.lambda, dt)
        trailPos[i].y = damp(trailPos[i].y, cur.y, tr.lambda, dt)
        trails[i].style.transform = `translate3d(${trailPos[i].x}px, ${trailPos[i].y}px, 0) scale(${tr.scale * scale})`
      })
    }
    gsap.ticker.add(tick)
    return () => gsap.ticker.remove(tick)
  }, [wide])

  if (!wide) return null
  return (
    <div ref={root} className={`guide${active ? ' is-on' : ''}`} aria-hidden="true">
      <span className="guide-light" />
      {TRAILS.map((_, i) => (
        <span key={i} className="guide-light is-trail" />
      ))}
    </div>
  )
}
