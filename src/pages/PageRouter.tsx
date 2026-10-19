import { lazy } from 'react'

// Only the requested page's code is loaded.
const AboutPage = lazy(() => import('./about/AboutPage').then((m) => ({ default: m.AboutPage })))
const AiPage = lazy(() => import('./ai/AiPage').then((m) => ({ default: m.AiPage })))
const TechnologyPage = lazy(() => import('./technology/TechnologyPage').then((m) => ({ default: m.TechnologyPage })))
const ServicesPage = lazy(() => import('./services/ServicesPage').then((m) => ({ default: m.ServicesPage })))
const NotFoundPage = lazy(() => import('./notfound/NotFoundPage').then((m) => ({ default: m.NotFoundPage })))
const SystemPage = lazy(() => import('./systems/SystemPage').then((m) => ({ default: m.SystemPage })))

/** Picks the inner page from <body data-page="about | services | ai | technology | notfound | system:<slug>">. */
export function PageRouter({ page }: { page: string }) {
  if (page === 'about') return <AboutPage />
  if (page === 'ai') return <AiPage />
  if (page === 'technology') return <TechnologyPage />
  if (page === 'services') return <ServicesPage />
  if (page === 'notfound') return <NotFoundPage />
  if (page.startsWith('system:')) return <SystemPage slug={page.slice('system:'.length)} />
  return null
}
