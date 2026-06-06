import { type ReactNode, useEffect, useRef, useState } from 'react';
import { useAuth } from '../store/auth';
import { dingtalkLogin } from './dingtalkLogin';

export function AuthGate({ children }: { children: ReactNode }) {
  const { token, setSession } = useAuth();
  const [err, setErr] = useState<string | null>(null);
  const tried = useRef(false);
  useEffect(() => {
    if (token || tried.current) return;
    tried.current = true; // 只尝试一次，避免重复触发登录
    dingtalkLogin()
      .then((r) => setSession(r.token, r.userId, r.tenantId, r.name))
      .catch((e) => {
        const msg = e?.response?.data?.error ?? e?.message ?? String(e);
        console.error('dingtalk login failed:', msg);
        setErr(String(msg));
      });
  }, [token, setSession]);

  if (!token) {
    return (
      <div className="p-6 font-kuaile">
        {err ? (
          <div>
            <div>登录失败</div>
            <div style={{ fontSize: 12, color: '#888', marginTop: 8, wordBreak: 'break-all' }}>{err}</div>
          </div>
        ) : (
          '登录中...'
        )}
      </div>
    );
  }
  return <>{children}</>;
}
