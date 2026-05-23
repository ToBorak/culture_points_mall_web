import 'virtual:uno.css';
import '@cpm/ui/tokens.css';
import { setupHttp } from '@cpm/api-client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import { App } from './App';

setupHttp('/', () => localStorage.getItem('cpm_jwt'));

// 任意 API 401（例如 DB 重置后老 JWT 对应的用户已删）→ 清掉本地 session 强制重新登录
axios.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401) {
      ['cpm_jwt', 'cpm_uid', 'cpm_tid', 'cpm_name'].forEach((k) => localStorage.removeItem(k));
      if (!window.location.pathname.includes('login') && !sessionStorage.getItem('cpm_reloading')) {
        sessionStorage.setItem('cpm_reloading', '1');
        window.location.reload();
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
