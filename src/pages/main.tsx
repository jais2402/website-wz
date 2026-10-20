// First: probe the GPU and set perf-<tier> on <html> before anything renders.
import '@/lib/perfBoot'
import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import '@/index.css'
import '@/loom/loom.css'
import './pages.css'
import { LiteProvider } from '@/components/LiteProvider'
import { initAnalytics } from '@/lib/ga'

// Consent-gated GA: no script or cookie until the visitor accepts; nothing at all without an ID.
initAnalytics()
import { loadPage } from './PageRouter'

// One entry for the inner pages (about.html, ai.html, systems/*.html). Each HTML file names its page in
// <body data-page="…">. The page's chunk loads first; the HTML snapshot in #root stays until React replaces it.
loadPage(document.body.dataset.page ?? '').then(
  (page) => {
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <LiteProvider>
          {/* Safety net only: each page's lazy 3D pieces have their own boundaries. */}
          <Suspense fallback={null}>{page}</Suspense>
        </LiteProvider>
      </StrictMode>,
    )
  },
  (err: unknown) => {
    // The page could not load: show the snapshot (hidden for JS users by the `js` class) instead of a blank page.
    document.documentElement.classList.remove('js')
    throw err
  },
)
