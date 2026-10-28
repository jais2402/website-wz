import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/fonts.css'
import './studio.css'
import { Studio } from './Studio'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Studio />
  </StrictMode>,
)
