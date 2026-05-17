import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ArthurianStudio } from './Arthuriana/ArthurianStudio.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ArthurianStudio />
  </StrictMode>
);
