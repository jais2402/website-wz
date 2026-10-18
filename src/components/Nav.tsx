import { useEffect, useState } from 'react'
import { brand, nav } from '@/content/site'
import { scrollToTarget } from '@/hooks/motion'
import { Logo } from './Logo'

type NavItem = { label: string; href: string }

export function Nav({
  items = nav,
  cta = { label: 'Tell us what is not working', href: '/contact' },
  logoHref = '#top',
}: { items?: readonly NavItem[]; cta?: NavItem; logoHref?: string }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  // In-page anchors scroll smoothly; links to other pages (e.g. the loom) navigate normally.
  const go = (href: string) => (e: React.MouseEvent) => {
    setOpen(false)
    if (!href.startsWith('#')) return
    e.preventDefault()
    scrollToTarget(href)
  }

  return (
    <header className={`nav${scrolled ? ' is-scrolled' : ''}${open ? ' is-open' : ''}`}>
      <a href={logoHref} className="nav-logo" onClick={go(logoHref)} aria-label={`${brand.name} home`}>
        <Logo />
      </a>
      <nav className="nav-links" aria-label="Primary">
        {items.map((l) => (
          <a key={l.href} href={l.href} onClick={go(l.href)}>
            {l.label}
          </a>
        ))}
      </nav>
      <a href={cta.href} className="btn btn-lime nav-cta" onClick={go(cta.href)}>
        {cta.label}
      </a>
      <button className="nav-burger" aria-label="Menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <span />
        <span />
      </button>
      <div className="nav-sheet" hidden={!open}>
        {items.map((l) => (
          <a key={l.href} href={l.href} onClick={go(l.href)}>
            {l.label}
          </a>
        ))}
        <a href={cta.href} className="btn btn-lime" onClick={go(cta.href)}>
          {cta.label}
        </a>
      </div>
    </header>
  )
}
