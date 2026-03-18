import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

document.body.style.margin = '0';
document.body.style.padding = '0';
document.body.style.background = '#0a0a0f';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
