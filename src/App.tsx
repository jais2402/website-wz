import { lazy, Suspense, useState } from 'react'
import { AIDemo } from '@/components/AIDemo'
import { Areas } from '@/components/Areas'
import { Countries } from '@/components/Countries'
import { CookieBanner } from '@/components/CookieBanner'
import { Cursor } from '@/components/Cursor'
import { Faq } from '@/components/Faq'
import { Footer } from '@/components/Footer'
import { GuideLight } from '@/components/GuideLight'
import { Integrations } from '@/components/Integrations'
import { Nav } from '@/components/Nav'
import { Preloader } from '@/components/Preloader'
import { Pricing } from '@/components/Pricing'
import { Process } from '@/components/Process'
import { Proof } from '@/components/Proof'
import { SectionBoundary } from '@/components/SectionBoundary'
import { Services } from '@/components/Services'
import { StickyCall } from '@/components/StickyCall'
import { Story } from '@/components/Story'
import { Work } from '@/components/Work'
import { useHashScroll, usePrefersReducedMotion, useSmoothScroll } from '@/hooks/motion'
import { useLite } from '@/hooks/useLite'
import { usePauseOffscreen } from '@/hooks/usePauseOffscreen'
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
  const { lite } = useLite()
  const [ready, setReady] = useState(false)
  useSmoothScroll(!reducedMotion)
  // /#faq and the other home-section links from inner pages land on their section once the page is laid out.
  useHashScroll(ready)
  usePauseOffscreen()
  // Once the intro is done, check the 3D keeps up; if not, switch to the lite (no-WebGL) site.

  return (
    <>
      <Preloader reducedMotion={reducedMotion || lite} caption="Untangling the threads" onDone={() => setReady(true)} />
      {/* Lite mode never downloads three.js: the story and globe use static SVG art instead. */}
      {!lite && (
        <Suspense fallback={<div className="canvas-root canvas-fallback" aria-hidden="true" />}>
          <Scene reducedMotion={reducedMotion} />
        </Suspense>
      )}
      <div className="grain" aria-hidden="true" />
      <Cursor />
      <Nav />
      {!lite && <GuideLight active={ready} />}
      {/* Before <main> in the DOM so keyboard and screen-reader users reach it early (it is fixed bottom-left).
          Held back until the preloader has finished. */}
      <CookieBanner ready={ready} />
      <main id="main" tabIndex={-1}>
        <SectionBoundary name="LoomHero">
          <LoomHero reducedMotion={reducedMotion} introReady={ready} />
        </SectionBoundary>
        <SectionBoundary name="Weave">
          <Weave />
        </SectionBoundary>
        <SectionBoundary name="Story">
          <Story />
        </SectionBoundary>
        <SectionBoundary name="Proof">
          <Proof />
        </SectionBoundary>
        <SectionBoundary name="Services">
          <Services />
        </SectionBoundary>
        <SectionBoundary name="Areas">
          <Areas />
        </SectionBoundary>
        <SectionBoundary name="BeforeAfter">
          <BeforeAfter />
        </SectionBoundary>
        <SectionBoundary name="AIDemo">
          <AIDemo />
        </SectionBoundary>
        <SectionBoundary name="Work">
          <Work />
        </SectionBoundary>
        <SectionBoundary name="Process">
          <Process />
        </SectionBoundary>
        <SectionBoundary name="Pricing">
          <Pricing />
        </SectionBoundary>
        <SectionBoundary name="Integrations">
          <Integrations />
        </SectionBoundary>
        <SectionBoundary name="Countries">
          <Countries />
        </SectionBoundary>
        <SectionBoundary name="Faq">
          <Faq />
        </SectionBoundary>
        <SectionBoundary name="LoomContact">
          <LoomContact />
        </SectionBoundary>
      </main>
      <Footer />
      <StickyCall />
    </>
  )
}
