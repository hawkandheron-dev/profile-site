import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ArthurianApp } from './Arthuriana/ArthurianApp.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ArthurianApp />
  </StrictMode>
);
