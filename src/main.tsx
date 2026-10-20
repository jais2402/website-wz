// First: probe the GPU and set perf-<tier> on <html> before anything renders.
import '@/lib/perfBoot'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './loom/loom.css'
import App from './App.tsx'
import { LiteProvider } from './components/LiteProvider'
import { initAnalytics } from './lib/ga'

// Consent-gated GA: no script or cookie until the visitor accepts; nothing at all without an ID.
initAnalytics()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LiteProvider>
      <App />
    </LiteProvider>
  </StrictMode>,
)
