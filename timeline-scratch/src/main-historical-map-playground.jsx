import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import HistoricalMapPlaygroundApp from './HistoricalMapPlaygroundApp.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HistoricalMapPlaygroundApp />
  </StrictMode>,
);
