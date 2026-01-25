import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import ChurchHistoryApp from './ChurchHistoryApp.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ChurchHistoryApp />
  </StrictMode>,
)
