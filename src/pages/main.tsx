import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import '@/index.css'
import './pages.css'
import { LiteProvider } from '@/components/LiteProvider'
import { PageRouter } from './PageRouter'

// One entry for the inner pages (about.html, ai.html, systems/*.html). Each HTML file names its page in
// <body data-page="…">.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LiteProvider>
      <Suspense fallback={null}>
        <PageRouter page={document.body.dataset.page ?? ''} />
      </Suspense>
    </LiteProvider>
  </StrictMode>,
)
