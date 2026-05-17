import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ArthurianSupabaseApp } from './Arthuriana/ArthurianSupabaseApp.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ArthurianSupabaseApp />
  </StrictMode>
);
