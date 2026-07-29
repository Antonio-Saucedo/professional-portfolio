import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import App from './App.tsx'

window.addEventListener('vite:preloadError', (event) => {
    console.warn('Vite preload error (non-fatal):', event);
    event.preventDefault();
});

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App/>
    </StrictMode>,
)
