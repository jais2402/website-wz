import { useEffect, useRef, useState } from 'react'
import { brand, ctas, nav, navA11y, navSystems, navSystemsAll } from '@/content/site'
import { lockScroll, scrollToTarget } from '@/hooks/motion'
import { track } from '@/lib/analytics'
import { inSection, isCurrentPage } from '@/lib/navCurrent'
import { Logo } from './Logo'
import './nav.css'

type NavItem = { label: string; href: string }

// The "Systems" item (it links to the systems overview) opens the systems menu.
const isSystems = (l: NavItem) => l.href === navSystemsAll.href

// The page being viewed, for aria-current. Read once: every page is a full load.
const here = typeof window === 'undefined' ? '/' : window.location.pathname
const current = (href: string) => (isCurrentPage(here, href) ? ('page' as const) : undefined)

export function Nav({
  items = nav,
  cta = ctas.contact,
  logoHref = '#top',
}: {
  items?: readonly NavItem[]
  cta?: NavItem
  logoHref?: string
}) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [sysOpen, setSysOpen] = useState(false)
  const drop = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLAnchorElement>(null)
  const closeTimer = useRef(0)
  const header = useRef<HTMLElement>(null)
  const burger = useRef<HTMLButtonElement>(null)
  const sheet = useRef<HTMLDivElement>(null)
  // Set when focus returns to the trigger after Escape, so focusing it doesn't reopen the menu.
  const skipFocusOpen = useRef(false)

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  // Systems menu: Escape closes it (focus back on the trigger), a click outside closes it.
  useEffect(() => {
    if (!sysOpen) return
    const key = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setSysOpen(false)
      // Focus goes back to the trigger without reopening the menu.
      skipFocusOpen.current = true
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

  // Burger sheet: the page behind stops scrolling, focus moves into the sheet and stays in the header,
  // Escape closes it (focus back on the burger) and so does a tap outside the header.
  useEffect(() => {
    if (!open) return
    lockScroll(true)
    const focusables = () => [
      ...(burger.current ? [burger.current] : []),
      ...(sheet.current?.querySelectorAll<HTMLElement>('a[href], button') ?? []),
    ]
    // The sheet is already shown (hidden removed) when this effect runs.
    sheet.current?.querySelector<HTMLElement>('a[href]')?.focus()
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        burger.current?.focus()
        return
      }
      if (e.key !== 'Tab') return
      const list = focusables()
      if (!list.length) return
      const first = list[0]
      const last = list[list.length - 1]
      const inside = header.current?.contains(document.activeElement)
      if (e.shiftKey && (document.activeElement === first || !inside)) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && (document.activeElement === last || !inside)) {
        e.preventDefault()
        first.focus()
      }
    }
    const down = (e: PointerEvent) => {
      if (!header.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('keydown', key)
    document.addEventListener('pointerdown', down)
    return () => {
      document.removeEventListener('keydown', key)
      document.removeEventListener('pointerdown', down)
      lockScroll(false)
    }
  }, [open])

  // Skip link: focus <main id="main"> and bring it into view.
  const skip = (e: React.MouseEvent) => {
    const main = document.getElementById('main')
    if (!main) return
    e.preventDefault()
    main.focus({ preventScroll: true })
    scrollToTarget(main)
  }

  // In-page anchors scroll smoothly; links to other pages (e.g. the loom) navigate normally.
  const go = (href: string) => (e: React.MouseEvent) => {
    // Unlock first: a stopped Lenis ignores scrollTo, and the sheet's cleanup only runs after this click.
    if (open) lockScroll(false)
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
      {/* The trigger is a plain link to the systems overview (/our-services). */}
      <a
        ref={trigger}
        href={l.href}
        className={`nav-drop-trigger${inSection(here, '/systems/') || isCurrentPage(here, navSystemsAll.href) ? ' is-current' : ''}`}
        aria-haspopup="true"
        aria-expanded={sysOpen}
        aria-controls="nav-systems"
        // A click goes to the systems overview; hover, focus or ArrowDown opens the list of systems.
        onClick={() => setSysOpen(false)}
        onFocus={() => {
          if (skipFocusOpen.current) skipFocusOpen.current = false
          else setSysOpen(true)
        }}
        onKeyDown={(e) => {
          if (e.key !== 'ArrowDown') return
          e.preventDefault()
          setSysOpen(true)
          requestAnimationFrame(() => drop.current?.querySelector<HTMLAnchorElement>('.nav-menu-panel a')?.focus())
        }}
      >
        {l.label}
        <span className="nav-caret" aria-hidden="true" />
      </a>
      <div className="nav-menu" id="nav-systems">
        <ul className="nav-menu-panel">
          {navSystems.map((s) => (
            <li key={s.href}>
              <a
                href={s.href}
                onClick={() => setSysOpen(false)}
                tabIndex={sysOpen ? undefined : -1}
                aria-current={current(s.href)}
              >
                <span>{s.label}</span>
                <span className="mono">{s.short}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )

  const ctaClick = (e: React.MouseEvent) => {
    track('cta_click', { label: cta.label, location: 'nav' })
    go(cta.href)(e)
  }

  return (
    <>
      <a href="#main" className="skip-link" onClick={skip}>
        {navA11y.skip}
      </a>
      <header ref={header} className={`nav${scrolled ? ' is-scrolled' : ''}${open ? ' is-open' : ''}`}>
        <a href={logoHref} className="nav-logo" onClick={go(logoHref)} aria-label={`${brand.name} home`}>
          <Logo />
        </a>
        <nav className="nav-links" aria-label="Primary">
          {items.map((l) =>
            isSystems(l) ? (
              systemsMenu(l)
            ) : (
              <a key={l.href} href={l.href} onClick={go(l.href)} aria-current={current(l.href)}>
                {l.label}
              </a>
            ),
          )}
        </nav>
        <a href={cta.href} className="btn btn-lime nav-cta" onClick={ctaClick}>
          {cta.label}
        </a>
        <button
          ref={burger}
          className="nav-burger"
          aria-label={open ? navA11y.closeMenu : navA11y.menu}
          aria-expanded={open}
          aria-controls="nav-sheet"
          onClick={() => setOpen((o) => !o)}
        >
          <span />
          <span />
        </button>
        <div ref={sheet} id="nav-sheet" className="nav-sheet" hidden={!open} data-lenis-prevent>
          {items.map((l) =>
            isSystems(l) ? (
              <div key={l.href} className="nav-sheet-group">
                <a
                  className="mono nav-sheet-label"
                  href={navSystemsAll.href}
                  onClick={go(navSystemsAll.href)}
                  aria-current={current(navSystemsAll.href)}
                >
                  {l.label}
                </a>
                <ul className="nav-sheet-systems">
                  {navSystems.map((s) => (
                    <li key={s.href}>
                      <a href={s.href} onClick={go(s.href)} aria-current={current(s.href)}>
                        <span>{s.label}</span>
                        <span className="mono">{s.short}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <a key={l.href} href={l.href} onClick={go(l.href)} aria-current={current(l.href)}>
                {l.label}
              </a>
            ),
          )}
          <a href={cta.href} className="btn btn-lime" onClick={ctaClick}>
            {cta.label}
          </a>
        </div>
      </header>
    </>
  )
}
