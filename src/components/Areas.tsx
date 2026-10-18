import { useGSAP } from '@gsap/react'
import { useRef, useState } from 'react'
import { areas } from '@/content/site'
import { gsap, ScrollTrigger, scrollToTarget } from '@/hooks/motion'
import { activeIndex, tabFill } from '@/lib/charts'
import { CountUp, ModuleCard } from './Charts'
import { SplitReveal } from './Reveal'

// One icon per entry in `areas`, in order.
const ICONS = ['◎', '◆', '▣', '◈', '▲', '✚']
// Bento: in a 4-column grid the first and last module span two columns.
const WIDE = new Set([0, 5])

/**
 * Systems explorer. On desktop the section pins and scrolling steps through each business system;
 * tabs fill up as you go. On mobile / reduced motion it is a plain tab switcher.
 */
export function Areas() {
  const root = useRef<HTMLElement>(null)
  const screen = useRef<HTMLDivElement>(null)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const trigger = useRef<ScrollTrigger | null>(null)
  const [active, setActive] = useState(0)
  const area = areas[active]

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(min-width: 900px) and (min-height: 640px) and (prefers-reduced-motion: no-preference)', () => {
        trigger.current = ScrollTrigger.create({
          trigger: root.current,
          start: 'top top',
          end: () => `+=${window.innerHeight * areas.length * 0.85}`,
          pin: true,
          onUpdate: (st) => {
            setActive(activeIndex(st.progress, areas.length))
            tabs.current.forEach((t, i) => t?.style.setProperty('--fill', String(tabFill(st.progress, areas.length, i))))
          },
        })
        root.current?.classList.add('is-pinned')
        return () => {
          trigger.current = null
          root.current?.classList.remove('is-pinned')
        }
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  // Switching systems: a light sweep crosses the screen while the new modules rise in.
  useGSAP(
    () => {
      gsap
        .timeline()
        .fromTo('.screen-sweep', { yPercent: -100, opacity: 1 }, { yPercent: 100, opacity: 0.2, duration: 0.9, ease: 'power2.inOut' }, 0)
        .fromTo(
          '.mod',
          { y: 28, opacity: 0, rotateX: -14, filter: 'blur(6px)' },
          { y: 0, opacity: 1, rotateX: 0, filter: 'blur(0px)', duration: 0.8, ease: 'expo.out', stagger: 0.06 },
          0.12,
        )
        .fromTo('.screen-kpi', { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'expo.out', stagger: 0.05 }, 0.05)
    },
    { scope: screen, dependencies: [active] },
  )

  // Clicking a tab: when pinned, scroll to that system's slice; otherwise just switch.
  const select = (i: number) => {
    const st = trigger.current
    if (!st) {
      setActive(i)
      return
    }
    scrollToTarget(st.start + ((i + 0.5) / areas.length) * (st.end - st.start))
  }

  return (
    <section ref={root} className="panel areas" aria-labelledby="areas-title">
      <div className="wrap">
        <div className="areas-head">
          <p className="mono label">The systems we build</p>
          <SplitReveal as="h2" className="display" text="Every corner of the business, connected." />
        </div>

        <div className="areas-ui">
          <div className="areas-tabs" role="tablist" aria-label="Business areas">
            {areas.map((a, i) => (
              <button
                key={a.title}
                ref={(el) => {
                  tabs.current[i] = el
                }}
                role="tab"
                aria-selected={i === active}
                className={`area-tab${i === active ? ' is-active' : ''}`}
                onClick={() => select(i)}
              >
                <span className="area-icon" aria-hidden="true">
                  {ICONS[i]}
                </span>
                <span>{a.title}</span>
                <span className="area-count mono">{a.modules.length} modules</span>
                <span className="area-progress" aria-hidden="true" />
              </button>
            ))}
          </div>

          <div className="areas-screen" role="tabpanel" aria-label={area.title} ref={screen}>
            <span className="screen-sweep" aria-hidden="true" />
            <div className="screen-bar">
              <span className="mono">wezigns / {area.title.toLowerCase()}</span>
              <span className="screen-status mono">
                <span className="screen-step">
                  0{active + 1} / 0{areas.length}
                </span>
                <i className="live" /> synced
              </span>
            </div>
            {/* key remounts the content so every number and chart replays its build-up */}
            <div key={active} className="screen-body">
              <div className="screen-kpis">
                {area.kpis.map((k, i) => (
                  <div className="screen-kpi" key={k.label}>
                    <span className="mono">{k.label}</span>
                    <b>
                      <CountUp value={k.value} prefix={k.prefix} suffix={k.suffix} decimals={k.decimals} delay={i * 80} />
                    </b>
                  </div>
                ))}
              </div>
              <div className="mods">
                {area.modules.map((m, i) => (
                  <ModuleCard key={m.name} m={m} wide={WIDE.has(i)} index={i} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
