import { type ReactNode, useEffect } from 'react';
import { useAuth } from '../store/auth';
import { dingtalkLogin } from './dingtalkLogin';

export function AuthGate({ children }: { children: ReactNode }) {
  const { token, setSession } = useAuth();
  useEffect(() => {
    if (!token) {
      dingtalkLogin()
        .then((r) => setSession(r.token, r.userId, r.tenantId, r.name))
        .catch(console.error);
    }
  }, [token, setSession]);

  if (!token) return <div className="p-6 font-kuaile">登录中...</div>;
  return <>{children}</>;
}
