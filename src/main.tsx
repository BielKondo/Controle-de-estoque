import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { I18nProvider } from './lib/i18n.tsx'

// Apply persisted dark mode before first render
if (localStorage.getItem('darkMode') === 'true') {
  document.documentElement.classList.add('dark')
}

// Redirect invite/recovery tokens to /accept-invite before React mounts.
// Supabase uses PKCE flow (token arrives as ?code= query param) or
// implicit flow (token arrives as #type=invite hash fragment).
// Either way, intercept here so PrivateRoute never gets a chance to
// redirect an unauthenticated invite user to /login.
const _path = window.location.pathname;
const _hash = window.location.hash;
const _search = window.location.search;
const _alreadyOnAcceptInvite = _path.includes('/accept-invite');

const _hasInviteHash = _hash.includes('type=invite') || _hash.includes('type=recovery');
const _hasCodeParam  = _search.includes('code='); // PKCE flow

if ((_hasInviteHash || _hasCodeParam) && !_alreadyOnAcceptInvite) {
  window.location.replace('/accept-invite' + _search + _hash);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </StrictMode>,
)
