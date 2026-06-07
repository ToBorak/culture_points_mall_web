import 'virtual:uno.css';
import '@cpm/ui/tokens.css';
import './index.css';
import { setupHttp } from '@cpm/api-client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import axios from 'axios';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';

setupHttp('/', () => localStorage.getItem('cpm_jwt'));

// 401 处理：
// - 登录接口（/auth/*）自身 401 = 登录失败，绝不刷新（否则 登录失败→刷新→再登录 会死循环）
// - 其它接口 401（例如 DB 重置后老 JWT 对应的用户已删）→ 清 session 并刷新一次，由 AuthGate 重新登录
// - guard 只在「请求成功」时清除，确保一次失败不会无限刷新
axios.interceptors.response.use(
  (r) => {
    sessionStorage.removeItem('cpm_reloading');
    return r;
  },
  (err) => {
    const url: string = err?.config?.url ?? '';
    if (err?.response?.status === 401 && !url.includes('/auth/')) {
      for (const k of ['cpm_jwt', 'cpm_uid', 'cpm_tid', 'cpm_name']) localStorage.removeItem(k);
      if (!sessionStorage.getItem('cpm_reloading')) {
        sessionStorage.setItem('cpm_reloading', '1');
        window.location.reload();
      }
    }
    return Promise.reject(err);
  },
);

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false } },
});

// 钉钉 H5 是固定布局应用，禁止缩放：viewport meta 的 user-scalable=no 覆盖 Android WebView，
// iOS WKWebView 会忽略该 meta，需再拦截 gesture 手势事件与多指 touchmove。
const preventZoom = (e: Event) => e.preventDefault();
document.addEventListener('gesturestart', preventZoom);
document.addEventListener('gesturechange', preventZoom);
document.addEventListener('gestureend', preventZoom);
document.addEventListener(
  'touchmove',
  (e) => {
    if (e.touches.length > 1) e.preventDefault();
  },
  { passive: false },
);

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
