import { type ReactNode, useEffect, useRef, useState } from 'react';
import { useAuth } from '../store/auth';
import { dingtalkLogin, isInDingTalk } from './dingtalkLogin';

type Status = 'authenticating' | 'ready' | 'error';

export function AuthGate({ children }: { children: ReactNode }) {
  const { token, setSession } = useAuth();
  // 钉钉环境：始终以后端用 authCode 换取的钉钉身份为准，进入即静默重登，
  //   覆盖本地可能过期 / 残留（如 mock 时代或他人）的旧身份，避免「看到的不是自己的钉钉信息」。
  // 非钉钉环境（浏览器调试）：已有 token 直接复用，避免反复触发 dev 兜底登录。
  const [status, setStatus] = useState<Status>(() => (!isInDingTalk() && token ? 'ready' : 'authenticating'));
  const [err, setErr] = useState<string | null>(null);
  const tried = useRef(false);

  useEffect(() => {
    if (tried.current) return;
    tried.current = true; // 每个挂载周期只登录一次（含 StrictMode 的二次执行）
    if (!isInDingTalk() && token) {
      setStatus('ready');
      return;
    }
    dingtalkLogin()
      .then((r) => {
        setSession(r.token, r.userId, r.tenantId, r.name);
        setStatus('ready');
      })
      .catch((e) => {
        const msg = e?.response?.data?.error ?? e?.message ?? String(e);
        console.error('dingtalk login failed:', msg);
        // 钉钉环境登录失败：不回落到可能错误的旧身份，直接报错让问题可见。
        setErr(String(msg));
        setStatus('error');
      });
  }, [token, setSession]);

  if (status !== 'ready') {
    return (
      <div className="p-6 font-kuaile">
        {status === 'error' ? (
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
