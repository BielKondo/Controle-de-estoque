import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { I18nProvider } from './lib/i18n.tsx'

// Apply persisted dark mode before first render
if (localStorage.getItem('darkMode') === 'true') {
  document.documentElement.classList.add('dark')
}

// Redirect invite/recovery tokens to the accept-invite page
const _hash = window.location.hash;
if (
  (_hash.includes('type=invite') || _hash.includes('type=recovery')) &&
  !window.location.pathname.includes('/accept-invite')
) {
  window.location.replace('/accept-invite' + _hash);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </StrictMode>,
)
