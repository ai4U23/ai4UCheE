// Browser entrypoint for ChemEng's Intelligent Workbench (ai4UCheE).
import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { consumeFragmentToken } from './lib/embed-token-store';
import './styles/theme-tokens.css';

const rootEl = document.getElementById('root');
if (rootEl) {
  // PVU embed: move #t=<token> out of the URL into the store BEFORE first render, so every
  // authedFetch carries the Bearer from the first API call (main.tsx is the only boot wiring —
  // without this the whole client auth chain dead-ends at token_missing 401s).
  consumeFragmentToken();
  createRoot(rootEl).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
