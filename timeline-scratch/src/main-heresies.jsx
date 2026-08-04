import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import HeresiesApp from './HeresiesApp.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HeresiesApp />
  </StrictMode>,
)
