import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import ChurchHistory2App from './ChurchHistory2App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ChurchHistory2App />
  </StrictMode>,
)
