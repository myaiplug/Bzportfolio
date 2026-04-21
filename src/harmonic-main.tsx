import React from 'react';
import ReactDOM from 'react-dom/client';
import HarmonicWarper from './harmonic';
import './index.css';

// This file serves as the entry point for the Harmonic Reality Warper standalone page.
// It mounts the HarmonicWarper component into the DOM.

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <HarmonicWarper onClose={() => {
        // Send a message to the parent window to close the modal
        window.parent.postMessage({ type: 'CLOSE_MODAL' }, '*');
      }} />
    </React.StrictMode>
  );
}
