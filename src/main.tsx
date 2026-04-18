import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Глобальный перехватчик события установки до старта React
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  (window as any).deferredPrompt = e;
  // Диспетчеризация специального события, чтобы компоненты могли его поймать, если они уже смонтировались
  window.dispatchEvent(new Event('app-install-ready'));
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
