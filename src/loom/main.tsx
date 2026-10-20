// First: probe the GPU and set perf-<tier> on <html> before anything renders.
import '@/lib/perfBoot'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/index.css'
import './loom.css'
import { LoomPage } from './LoomPage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LoomPage />
  </StrictMode>,
)
