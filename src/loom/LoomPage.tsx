import { useState } from 'react'
import { Cursor } from '@/components/Cursor'
import { Faq } from '@/components/Faq'
import { Footer } from '@/components/Footer'
import { Nav } from '@/components/Nav'
import { Preloader } from '@/components/Preloader'
import { Process } from '@/components/Process'
import { loom } from '@/content/site'
import { usePrefersReducedMotion, useSmoothScroll } from '@/hooks/motion'
import { BeforeAfter, LoomContact, LoomStats, Looms, ThreadRail, Timelines, Untangle } from './sections'
import { LoomHero, Weave } from './hero'

export function LoomPage() {
  const reducedMotion = usePrefersReducedMotion()
  useSmoothScroll(!reducedMotion)
  const [introReady, setIntroReady] = useState(false)

  return (
    <>
      <div className="grain" aria-hidden="true" />
      <Cursor />
      <Preloader reducedMotion={reducedMotion} caption="Untangling the threads" onDone={() => setIntroReady(true)} />
      <Nav items={loom.nav} cta={{ label: 'Hand us the tangle', href: '#contact' }} />
      <ThreadRail />
      <main>
        <LoomHero reducedMotion={reducedMotion} introReady={introReady} />
        <Untangle />
        <Weave />
        <LoomStats />
        <BeforeAfter />
        <Looms />
        <Timelines />
        <Process />
        <Faq />
        <LoomContact />
      </main>
      <Footer base="./" />
    </>
  )
}
