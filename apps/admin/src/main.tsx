import 'virtual:uno.css';
import '@cpm/ui/tokens.css';
import { setupHttp } from '@cpm/api-client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import { App } from './App';
import { useAuth } from './store/auth';

setupHttp('/', () => localStorage.getItem('cpm_admin_jwt'));

// 来自 H5「前往后台」的握手：URL hash 携带 token 则直接建立后台会话，
// 然后立即从地址栏抹掉 token，避免它残留在浏览器历史里。
{
  const hash = window.location.hash.replace(/^#/, '');
  if (hash) {
    const p = new URLSearchParams(hash);
    const handoff = p.get('handoff');
    if (handoff) {
      useAuth.getState().setSession(handoff, Number(p.get('uid')) || 0, Number(p.get('tid')) || 0, p.get('name') ?? '');
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }
}

// 401 → 清 session 跳登录页（DB 重置后老 JWT 对应的用户已删）
axios.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401) {
      ['cpm_admin_jwt', 'cpm_admin_uid', 'cpm_admin_tid', 'cpm_admin_name'].forEach((k) =>
        localStorage.removeItem(k),
      );
      if (!window.location.pathname.includes('/login') && !sessionStorage.getItem('cpm_reloading')) {
        sessionStorage.setItem('cpm_reloading', '1');
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  },
);
sessionStorage.removeItem('cpm_reloading');

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false } },
});

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('root element not found');
createRoot(rootEl).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
