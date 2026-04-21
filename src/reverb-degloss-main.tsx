import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ReverbDeGloss } from '../reverbdegloss';
import './index.css';

const handleClose = () => {
  window.parent.postMessage({ type: 'CLOSE_MODAL' }, '*');
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ReverbDeGloss onClose={handleClose} />
  </StrictMode>,
);
