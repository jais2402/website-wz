import { useEffect, useRef, useState } from 'react'
import { brand, nav, navSystems } from '@/content/site'
import { scrollToTarget } from '@/hooks/motion'
import { Logo } from './Logo'
import './nav.css'

type NavItem = { label: string; href: string }

// The "Systems" item (its href is the first system page) opens the systems menu.
const isSystems = (l: NavItem) => l.href.startsWith('/systems/')

export function Nav({
  items = nav,
  cta = { label: 'Tell us what is not working', href: '/contact' },
  logoHref = '#top',
}: { items?: readonly NavItem[]; cta?: NavItem; logoHref?: string }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [sysOpen, setSysOpen] = useState(false)
  const drop = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLAnchorElement>(null)
  const closeTimer = useRef(0)
  // Opened by hover: the first click keeps it open instead of toggling it shut.
  const byHover = useRef(false)

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  // Systems menu: Escape closes it (focus back on the trigger), a click outside closes it.
  useEffect(() => {
    if (!sysOpen) {
      byHover.current = false
      return
    }
    const key = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setSysOpen(false)
      trigger.current?.focus()
    }
    const down = (e: PointerEvent) => {
      if (!drop.current?.contains(e.target as Node)) setSysOpen(false)
    }
    document.addEventListener('keydown', key)
    document.addEventListener('pointerdown', down)
    return () => {
      document.removeEventListener('keydown', key)
      document.removeEventListener('pointerdown', down)
    }
  }, [sysOpen])

  useEffect(() => () => window.clearTimeout(closeTimer.current), [])

  // In-page anchors scroll smoothly; links to other pages (e.g. the loom) navigate normally.
  const go = (href: string) => (e: React.MouseEvent) => {
    setOpen(false)
    setSysOpen(false)
    if (!href.startsWith('#')) return
    e.preventDefault()
    scrollToTarget(href)
  }

  // Hover opens on mouse only; a short delay lets the pointer cross the gap into the panel.
  const hover = (on: boolean) => (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return
    window.clearTimeout(closeTimer.current)
    if (on) {
      if (!sysOpen) byHover.current = true
      setSysOpen(true)
    } else closeTimer.current = window.setTimeout(() => setSysOpen(false), 160)
  }

  const systemsMenu = (l: NavItem) => (
    <div
      key={l.href}
      ref={drop}
      className={`nav-drop${sysOpen ? ' is-open' : ''}`}
      onPointerEnter={hover(true)}
      onPointerLeave={hover(false)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setSysOpen(false)
      }}
    >
      {/* Without JS this is a plain link to the first system page. */}
      <a
        ref={trigger}
        href={l.href}
        className="nav-drop-trigger"
        aria-haspopup="true"
        aria-expanded={sysOpen}
        aria-controls="nav-systems"
        onClick={(e) => {
          e.preventDefault()
          if (byHover.current) byHover.current = false
          else setSysOpen((o) => !o)
        }}
      >
        {l.label}
        <span className="nav-caret" aria-hidden="true" />
      </a>
      <div className="nav-menu" id="nav-systems">
        <ul className="nav-menu-panel">
          {navSystems.map((s) => (
            <li key={s.href}>
              <a href={s.href} onClick={() => setSysOpen(false)} tabIndex={sysOpen ? undefined : -1}>
                <span>{s.label}</span>
                <span className="mono">{s.short}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )

  return (
    <header className={`nav${scrolled ? ' is-scrolled' : ''}${open ? ' is-open' : ''}`}>
      <a href={logoHref} className="nav-logo" onClick={go(logoHref)} aria-label={`${brand.name} home`}>
        <Logo />
      </a>
      <nav className="nav-links" aria-label="Primary">
        {items.map((l) =>
          isSystems(l) ? (
            systemsMenu(l)
          ) : (
            <a key={l.href} href={l.href} onClick={go(l.href)}>
              {l.label}
            </a>
          ),
        )}
      </nav>
      <a href={cta.href} className="btn btn-lime nav-cta" onClick={go(cta.href)}>
        {cta.label}
      </a>
      <button className="nav-burger" aria-label="Menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <span />
        <span />
      </button>
      <div className="nav-sheet" hidden={!open} data-lenis-prevent>
        {items.map((l) =>
          isSystems(l) ? (
            <div key={l.href} className="nav-sheet-group">
              <span className="mono nav-sheet-label">{l.label}</span>
              <ul className="nav-sheet-systems">
                {navSystems.map((s) => (
                  <li key={s.href}>
                    <a href={s.href} onClick={go(s.href)}>
                      <span>{s.label}</span>
                      <span className="mono">{s.short}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <a key={l.href} href={l.href} onClick={go(l.href)}>
              {l.label}
            </a>
          ),
        )}
        <a href={cta.href} className="btn btn-lime" onClick={go(cta.href)}>
          {cta.label}
        </a>
      </div>
    </header>
  )
}
