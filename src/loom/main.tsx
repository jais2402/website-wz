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
