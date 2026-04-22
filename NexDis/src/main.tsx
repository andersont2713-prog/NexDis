import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { RegionalProvider } from './context/RegionalContext.tsx';
import { ThemeProvider } from './context/ThemeContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <RegionalProvider>
        <App />
      </RegionalProvider>
    </ThemeProvider>
  </StrictMode>,
);
