import { lazy, Suspense, useState } from 'react'
import { AIDemo } from '@/components/AIDemo'
import { Areas } from '@/components/Areas'
import { Countries } from '@/components/Countries'
import { Cursor } from '@/components/Cursor'
import { Faq } from '@/components/Faq'
import { Footer } from '@/components/Footer'
import { Integrations } from '@/components/Integrations'
import { Nav } from '@/components/Nav'
import { Preloader } from '@/components/Preloader'
import { Pricing } from '@/components/Pricing'
import { Process } from '@/components/Process'
import { Proof } from '@/components/Proof'
import { Services } from '@/components/Services'
import { Story } from '@/components/Story'
import { Work } from '@/components/Work'
import { usePrefersReducedMotion, useSmoothScroll } from '@/hooks/motion'
import { LoomHero, Weave } from '@/loom/hero'
import { BeforeAfter, LoomContact } from '@/loom/sections'

// The fixed canvas (story threads + countries globe) is the heaviest chunk; load it in parallel with the preloader.
// The loom hero lazy-loads its own canvas. Each pauses itself while off screen.
const Scene = lazy(() => import('@/scene/Scene').then((m) => ({ default: m.Scene })))

/**
 * Final site: the time-loom hero and the "weave" / before-after sections from concept B, followed by the
 * concept A blocks (particle story, proof, services, systems explorer, AI demo, work, process, integrations,
 * countries globe, FAQ), closing with the loom-style contact block.
 */
export default function App() {
  const reducedMotion = usePrefersReducedMotion()
  const [ready, setReady] = useState(false)
  useSmoothScroll(!reducedMotion)

  return (
    <>
      <Preloader reducedMotion={reducedMotion} caption="Untangling the threads" onDone={() => setReady(true)} />
      <Suspense fallback={<div className="canvas-root canvas-fallback" aria-hidden="true" />}>
        <Scene reducedMotion={reducedMotion} />
      </Suspense>
      <div className="grain" aria-hidden="true" />
      <Cursor />
      <Nav />
      <main>
        <LoomHero reducedMotion={reducedMotion} introReady={ready} />
        <Weave />
        <Story />
        <Proof />
        <Services />
        <Areas />
        <BeforeAfter />
        <AIDemo />
        <Work />
        <Process />
        <Pricing />
        <Integrations />
        <Countries />
        <Faq />
        <LoomContact />
      </main>
      <Footer />
    </>
  )
}
