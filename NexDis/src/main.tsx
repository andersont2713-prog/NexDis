import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { RegionalProvider } from './context/RegionalContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RegionalProvider>
      <App />
    </RegionalProvider>
  </StrictMode>,
);
