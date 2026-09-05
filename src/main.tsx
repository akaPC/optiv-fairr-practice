import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { ModelProvider } from './lib/model-context';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <ModelProvider>
        <App />
      </ModelProvider>
    </HashRouter>
  </StrictMode>,
);
