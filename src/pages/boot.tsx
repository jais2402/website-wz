import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { initAnalytics } from '@/lib/ga'
import { loadPage } from './PageRouter'

// The inner pages' app, imported by main.tsx once the prerendered first screen has painted.

// Consent-gated GA: no script or cookie until the visitor accepts; nothing at all without an ID.
initAnalytics()

// Each HTML file names its page in <body data-page="…">. The page's chunk loads first; the prerendered markup and the
// HTML snapshot in #root stay until React replaces them.
loadPage(document.body.dataset.page ?? '').then(
  (page) => {
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        {/* Safety net only: each page's lazy 3D pieces have their own boundaries. */}
        <Suspense fallback={null}>{page}</Suspense>
      </StrictMode>,
    )
  },
  (err: unknown) => {
    // The page could not load: show the snapshot (hidden for JS users by the `js` class) instead of a blank page.
    document.documentElement.classList.remove('js')
    throw err
  },
)
