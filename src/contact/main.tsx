import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/index.css'
import './contact.css'
import { LiteProvider } from '@/components/LiteProvider'
import { ContactPage } from './ContactPage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LiteProvider>
      <ContactPage />
    </LiteProvider>
  </StrictMode>,
)
