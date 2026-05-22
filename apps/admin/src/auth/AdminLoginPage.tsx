import { motion } from 'framer-motion';
import axios from 'axios';
import { useState } from 'react';
import { useAuth } from '../store/auth';

export function AdminLoginPage() {
  const [userId, setUserId] = useState('1');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { setSession } = useAuth();

  const submit = async () => {
    if (loading) return;
    setLoading(true);
    setErr(null);
    try {
      const { data } = await axios.post<{ token: string; userId: number; tenantId: number; name: string }>(
        '/auth/dev/login',
        { userId: Number(userId) },
      );
      setSession(data.token, data.userId, data.tenantId, data.name);
      window.location.href = '/';
    } catch (e) {
      const err = e as { response?: { data?: { error?: string } } };
      setErr(err?.response?.data?.error ?? String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--cpm-bg-0)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--cpm-font-sans)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Mesh gradient 背景 */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          width: 600,
          height: 600,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(ellipse, var(--cpm-mesh-1) 0%, transparent 60%)',
          filter: 'blur(80px)',
          borderRadius: '50%',
          opacity: 0.7,
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          width: 400,
          height: 400,
          right: '10%',
          top: '10%',
          background: 'radial-gradient(circle, var(--cpm-mesh-3) 0%, transparent 65%)',
          filter: 'blur(80px)',
          borderRadius: '50%',
          opacity: 0.5,
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          width: 360,
          height: 360,
          left: '5%',
          bottom: '10%',
          background: 'radial-gradient(circle, var(--cpm-mesh-2) 0%, transparent 65%)',
          filter: 'blur(80px)',
          borderRadius: '50%',
          opacity: 0.45,
          pointerEvents: 'none',
        }}
      />

      {/* 登录卡片 */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: 420,
          background: '#fff',
          borderRadius: 24,
          border: '1px solid var(--cpm-card-border)',
          boxShadow: 'var(--cpm-shadow-pop)',
          padding: '36px 36px 32px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 28,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: 'linear-gradient(135deg, var(--cpm-brand-violet) 0%, var(--cpm-brand-cyan) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              color: '#fff',
              fontWeight: 700,
              boxShadow: 'var(--cpm-shadow-glow-violet)',
              flexShrink: 0,
            }}
          >
            ✦
          </div>
          <div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: 'var(--cpm-text-primary)',
                letterSpacing: '-0.01em',
              }}
            >
              CPM 管理后台
            </div>
            <div style={{ fontSize: 12, color: 'var(--cpm-text-muted)', marginTop: 1 }}>
              Culture Points Mall
            </div>
          </div>
        </div>

        {/* 标题 */}
        <h1
          style={{
            fontSize: 26,
            fontWeight: 700,
            color: 'var(--cpm-text-primary)',
            letterSpacing: '-0.02em',
            margin: '0 0 6px',
          }}
        >
          欢迎回来
        </h1>
        <p style={{ fontSize: 14, color: 'var(--cpm-text-tertiary)', margin: '0 0 28px' }}>
          登录以访问 HR-Agent 与运营数据
        </p>

        {/* User ID 输入框 */}
        <div style={{ marginBottom: 20 }}>
          <label
            style={{
              display: 'block',
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--cpm-text-secondary)',
              marginBottom: 8,
              letterSpacing: '0.02em',
            }}
          >
            User ID
          </label>
          <input
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void submit();
            }}
            style={{
              display: 'block',
              width: '100%',
              padding: '11px 14px',
              borderRadius: 12,
              border: '1.5px solid var(--cpm-card-border-strong)',
              background: 'var(--cpm-bg-0)',
              fontSize: 15,
              color: 'var(--cpm-text-primary)',
              outline: 'none',
              fontFamily: 'var(--cpm-font-sans)',
              transition: 'border-color 0.2s, box-shadow 0.2s',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--cpm-brand-violet)';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.12)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--cpm-card-border-strong)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* 错误提示 */}
        {err && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginBottom: 16,
              padding: '10px 14px',
              borderRadius: 10,
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.2)',
              color: 'var(--cpm-danger)',
              fontSize: 13,
            }}
          >
            {err}
          </motion.div>
        )}

        {/* 登录按钮 */}
        <motion.button
          type="button"
          onClick={submit}
          disabled={loading}
          whileHover={loading ? undefined : { scale: 1.02 }}
          whileTap={loading ? undefined : { scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 350, damping: 22 }}
          style={{
            display: 'block',
            width: '100%',
            padding: '13px 20px',
            borderRadius: 12,
            border: 'none',
            background: loading
              ? 'rgba(124,58,237,0.4)'
              : 'linear-gradient(135deg, var(--cpm-brand-violet) 0%, #6d28d9 100%)',
            color: '#fff',
            fontSize: 15,
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: loading ? 'none' : 'var(--cpm-shadow-glow-violet)',
            fontFamily: 'var(--cpm-font-sans)',
            letterSpacing: '0.01em',
            transition: 'background 0.2s',
          }}
        >
          {loading ? '登录中...' : '登录'}
        </motion.button>

        {/* 底部提示 */}
        <div
          style={{
            marginTop: 20,
            padding: '12px 14px',
            borderRadius: 10,
            background: 'var(--cpm-brand-violet-bg)',
            border: '1px solid rgba(124,58,237,0.12)',
          }}
        >
          <div style={{ fontSize: 12, color: 'var(--cpm-brand-violet)', fontWeight: 600, marginBottom: 2 }}>
            DEMO 模式
          </div>
          <div style={{ fontSize: 12, color: 'var(--cpm-text-tertiary)', lineHeight: 1.5 }}>
            输入任意员工 User ID 即可登录。钉钉 OAuth 登录在后续 Phase 上线。
          </div>
        </div>
      </motion.div>
    </div>
  );
}
