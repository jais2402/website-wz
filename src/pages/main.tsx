import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import '@/index.css'
import './pages.css'
import { LiteProvider } from '@/components/LiteProvider'

// One entry for the inner pages (about.html, ai.html, systems/*.html). Each HTML file names its page in
// <body data-page="…">; only that page's code is loaded.
const AboutPage = lazy(() => import('./about/AboutPage').then((m) => ({ default: m.AboutPage })))
const AiPage = lazy(() => import('./ai/AiPage').then((m) => ({ default: m.AiPage })))
const SystemPage = lazy(() => import('./systems/SystemPage').then((m) => ({ default: m.SystemPage })))

const page = document.body.dataset.page ?? ''

function Page() {
  if (page === 'about') return <AboutPage />
  if (page === 'ai') return <AiPage />
  if (page.startsWith('system:')) return <SystemPage slug={page.slice('system:'.length)} />
  return null
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LiteProvider>
      <Suspense fallback={null}>
        <Page />
      </Suspense>
    </LiteProvider>
  </StrictMode>,
)
