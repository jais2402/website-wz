import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './loom/loom.css'
import App from './App.tsx'
import { LiteProvider } from './components/LiteProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LiteProvider>
      <App />
    </LiteProvider>
  </StrictMode>,
)
