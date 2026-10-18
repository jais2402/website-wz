import { useGSAP } from '@gsap/react'
import { useRef } from 'react'
import { stats, tools } from '@/content/site'
import { gsap } from '@/hooks/motion'
import { SplitReveal } from './Reveal'

export function Marquee({ items, reverse = false }: { items: readonly string[]; reverse?: boolean }) {
  // Duplicated once so the -50% translate loops seamlessly.
  const doubled = [...items, ...items]
  return (
    <div className={`marquee${reverse ? ' is-reverse' : ''}`}>
      <div className="marquee-track">
        {doubled.map((t, i) => (
          <span className="marquee-item" key={i} aria-hidden={i >= items.length}>
            <i className="marquee-star" aria-hidden="true">✦</i>
            {t}
          </span>
        ))}
      </div>
    </div>
  )
}

/** Tool marquee + animated counters. First opaque panel to slide over the 3D canvas. */
export function Proof() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      root.current?.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
        const end = Number(el.dataset.count)
        const start = el.dataset.plain ? end - 14 : 0
        const obj = { v: start }
        gsap.to(obj, {
          v: end,
          duration: 2,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%' },
          onUpdate: () => {
            el.textContent = String(Math.round(obj.v))
          },
        })
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} className="panel proof">
      <div className="proof-tools">
        <p className="mono label">Tools we build with</p>
        <Marquee items={tools} />
        <Marquee items={[...tools].reverse()} reverse />
      </div>

      <div className="wrap">
        <SplitReveal as="h2" className="display proof-title" text="Twelve years of building software for growing businesses." />
        <div className="stats">
          {stats.map((s) => (
            <div className="stat" key={s.label}>
              <span className="stat-value">
                <span data-count={s.value} data-plain={s.plain ? '1' : undefined}>
                  {s.value}
                </span>
                <em>{s.suffix}</em>
              </span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
