import { StrictMode, startTransition } from 'react'
import { createRoot } from 'react-dom/client'
import '@/index.css'
import './contact.css'
import { initAnalytics } from '@/lib/ga'

// Consent-gated GA: no script or cookie until the visitor accepts; nothing at all without an ID.
initAnalytics()
import { ContactPage } from './ContactPage'

// A transition render is time-sliced: React yields to the browser every few milliseconds while it builds the page,
// instead of one long task that blocks input. The commit (and so what is on screen) is unchanged.
const root = createRoot(document.getElementById('root')!)
startTransition(() =>
  root.render(
    <StrictMode>
        <ContactPage />
    </StrictMode>,
  ),
)
