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
    return <LoginScreen error={status === 'error' ? err : null} />;
  }
  return <>{children}</>;
}

// 进入文化官时的全屏登录态：品牌化的「登录中」与「登录失败」，替代旧的白屏「登录中...」。
function LoginScreen({ error }: { error: string | null }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        padding: 24,
        textAlign: 'center',
        background: 'var(--cpm-app-bg)',
        fontFamily: 'var(--cpm-font-sans)',
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 20,
          background: 'var(--cpm-grad-brand)',
          display: 'grid',
          placeItems: 'center',
          boxShadow: 'var(--cpm-elev-candy)',
          color: '#fff',
          fontSize: 30,
          lineHeight: 1,
        }}
      >
        ✦
      </div>
      <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--cpm-ink-1)', letterSpacing: '0.04em' }}>文化官</div>

      {error ? (
        <>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--cpm-ink-1)', marginTop: 2 }}>登录失败</div>
          <div
            style={{
              fontSize: 12.5,
              color: 'var(--cpm-ink-2)',
              maxWidth: 300,
              lineHeight: 1.6,
              wordBreak: 'break-all',
            }}
          >
            {error}
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--cpm-ink-2)', marginTop: 2 }}>
            请退出后在钉钉里重新打开「文化官」重试
          </div>
        </>
      ) : (
        <>
          <div
            className="cpm-spinner"
            style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              border: '2.5px solid var(--cpm-primary-soft)',
              borderTopColor: 'var(--cpm-primary)',
              marginTop: 2,
            }}
          />
          <div style={{ fontSize: 13.5, color: 'var(--cpm-ink-2)' }}>正在通过钉钉验证身份…</div>
        </>
      )}
    </div>
  );
}
