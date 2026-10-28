import { lazy, Suspense, useEffect, useState } from 'react'
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
import { homeGate } from '@/lib/loadGate'
import { Pricing } from '@/components/Pricing'
import { Process } from '@/components/Process'
import { Proof } from '@/components/Proof'
import { SectionBoundary } from '@/components/SectionBoundary'
import { Services } from '@/components/Services'
import { StickyCall } from '@/components/StickyCall'
import { Story } from '@/components/Story'
import { StoryStatic } from '@/components/StoryStatic'
import { TestBadge } from '@/components/TestBadge'
import { Work } from '@/components/Work'
import { useHashScroll, usePrefersReducedMotion, useSmoothScroll } from '@/hooks/motion'
import { useGfxLive } from '@/gfx/gfxMode'
import { webgl } from '@/lib/webgl'
import { useAfterPaint } from '@/hooks/useAfterPaint'
import { usePauseOffscreen } from '@/hooks/usePauseOffscreen'
import { LoomHero, Weave } from '@/loom/hero'
import { BeforeAfter, LoomContact } from '@/loom/sections'
import { preloaderCopy } from '@/content/site'

// The fixed canvas (story threads + countries globe) is the heaviest chunk; it loads right after the hero's first
// paint, while the preloader is up. The loom hero lazy-loads its own canvas. Each pauses itself while off screen.
const Scene = lazy(() => import('@/scene/Scene').then((m) => ({ default: m.Scene })))
// Without WebGL the story and globe are drawn on a 2D canvas instead (no three.js).
const Globe2D = lazy(() => import('@/gfx/Globe2D').then((m) => ({ default: m.Globe2D })))

/**
 * Final site: the time-loom hero and the "weave" / before-after sections from concept B, followed by the
 * concept A blocks (particle story, proof, services, systems explorer, AI demo, work, process, integrations,
 * countries globe, FAQ), closing with the loom-style contact block.
 */
export default function App() {
  const reducedMotion = usePrefersReducedMotion()
  const live = useGfxLive()
  const [ready, setReady] = useState(false)
  // Two passes under the preloader: the first render is the hero alone, so it paints sooner; the rest of the page
  // (and the fixed story/globe canvas, which looks up its sections on mount) follows right after that first paint,
  // still under the preloader, so the page it reveals is unchanged.
  const built = useAfterPaint({ idle: false })
  useSmoothScroll(!reducedMotion)
  // /#faq and the other home-section links from inner pages land on their section once the page is laid out.
  useHashScroll(ready)
  usePauseOffscreen(built)
  // Without WebGL there is no 3D to wait for: the preloader opens as soon as the page itself is ready.
  useEffect(() => {
    if (webgl) return
    homeGate?.done('loom')
    homeGate?.done('scene')
  }, [])

  return (
    <>
      <Preloader
        reducedMotion={reducedMotion}
        gate={homeGate}
        caption={preloaderCopy.home}
        onDone={() => setReady(true)}
      />
      {/* Without WebGL three.js is never downloaded. */}
      {webgl && built && (
        <Suspense fallback={<div className="canvas-root canvas-fallback" aria-hidden="true" />}>
          <Scene reducedMotion={reducedMotion} />
        </Suspense>
      )}
      {!webgl && built && (
        <Suspense fallback={<div className="canvas-root canvas-fallback" aria-hidden="true" />}>
          <Globe2D reducedMotion={reducedMotion} />
        </Suspense>
      )}
      <div className="grain" aria-hidden="true" />
      {/* Testing aid: how this device draws the 3D (dev and the testing preview only, or ?badge=1). */}
      <TestBadge />
      <Cursor />
      <Nav />
      {/* The glow rides on the live loom's mouth: with the hero poster alone it would float over nothing. */}
      {webgl && live && built && <GuideLight active={ready} />}
      {/* Before <main> in the DOM so keyboard and screen-reader users reach it early (it is fixed bottom-left).
          Held back until the preloader has finished. */}
      <CookieBanner ready={ready} />
      <main id="main" tabIndex={-1}>
        <SectionBoundary name="LoomHero">
          <LoomHero reducedMotion={reducedMotion} introReady={ready} />
        </SectionBoundary>
        {built && (
          <>
            <SectionBoundary name="Weave">
              <Weave />
            </SectionBoundary>
            <SectionBoundary name="Story">
              {webgl ? <Story /> : <StoryStatic />}
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
          </>
        )}
      </main>
      {built && (
        <>
          <Footer />
          <StickyCall />
        </>
      )}
    </>
  )
}
