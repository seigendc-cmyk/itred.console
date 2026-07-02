import { printSCIDiagnostics, runSCIDiagnostics } from './diagnostics';
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

declare global {
  interface Window {
    SCI?: {
      runDiagnostics: typeof runSCIDiagnostics;
      printDiagnostics: typeof printSCIDiagnostics;
    };
  }
}

window.SCI = {
  runDiagnostics: runSCIDiagnostics,
  printDiagnostics: printSCIDiagnostics,
};

