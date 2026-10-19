import type { ReactElement } from 'react'

// Only the requested page's code is loaded. main.tsx awaits it before the first render, so React never commits an
// empty tree over the crawlable snapshot in #root while the chunk is still downloading.

/**
 * Loads the inner page named in <body data-page="about | services | ai | technology | notfound | system:<slug>">
 * and resolves to its element, or null for an unknown page.
 */
export async function loadPage(page: string): Promise<ReactElement | null> {
  if (page === 'about') {
    const { AboutPage } = await import('./about/AboutPage')
    return <AboutPage />
  }
  if (page === 'ai') {
    const { AiPage } = await import('./ai/AiPage')
    return <AiPage />
  }
  if (page === 'technology') {
    const { TechnologyPage } = await import('./technology/TechnologyPage')
    return <TechnologyPage />
  }
  if (page === 'services') {
    const { ServicesPage } = await import('./services/ServicesPage')
    return <ServicesPage />
  }
  if (page === 'notfound') {
    const { NotFoundPage } = await import('./notfound/NotFoundPage')
    return <NotFoundPage />
  }
  if (page.startsWith('system:')) {
    const { SystemPage } = await import('./systems/SystemPage')
    return <SystemPage slug={page.slice('system:'.length)} />
  }
  return null
}
