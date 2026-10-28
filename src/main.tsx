// Browser entrypoint for Perry's Intelligent Workbench (ai4UCheE).
import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles/theme-tokens.css';

const rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
