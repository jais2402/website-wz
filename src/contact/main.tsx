import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/index.css'
import './contact.css'
import { LiteProvider } from '@/components/LiteProvider'
import { initAnalytics } from '@/lib/ga'

// Consent-gated GA: no script or cookie until the visitor accepts; nothing at all without an ID.
initAnalytics()
import { ContactPage } from './ContactPage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LiteProvider>
      <ContactPage />
    </LiteProvider>
  </StrictMode>,
)
