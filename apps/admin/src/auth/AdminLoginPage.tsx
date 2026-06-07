import { motion } from 'framer-motion';

// 管理后台不再提供独立登录：去掉 User ID / dev-login（已从后端移除）。
// 唯一入口是从钉钉「文化官」H5「我的」页点「前往后台」，由当前钉钉身份握手进入。
export function AdminLoginPage() {
  const steps = ['打开钉钉 →「工作台」', '进入「文化官」应用', '底部切到「我的」页', '点击「前往后台」'];
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
        padding: 20,
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

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: 440,
          maxWidth: '100%',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
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
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--cpm-text-primary)', letterSpacing: '-0.01em' }}>
              CPM 管理后台
            </div>
            <div style={{ fontSize: 12, color: 'var(--cpm-text-muted)', marginTop: 1 }}>Culture Points Mall</div>
          </div>
        </div>

        {/* 标题 */}
        <h1
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: 'var(--cpm-text-primary)',
            letterSpacing: '-0.02em',
            margin: '0 0 8px',
          }}
        >
          请从「文化官」进入
        </h1>
        <p style={{ fontSize: 14, color: 'var(--cpm-text-tertiary)', lineHeight: 1.6, margin: '0 0 24px' }}>
          管理后台仅支持钉钉身份进入，不再提供独立登录。请在钉钉里按下面步骤打开：
        </p>

        {/* 步骤 */}
        <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {steps.map((step, i) => (
            <li key={step} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: 'var(--cpm-brand-violet-bg)',
                  color: 'var(--cpm-brand-violet)',
                  fontSize: 12,
                  fontWeight: 700,
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </span>
              <span style={{ fontSize: 14, color: 'var(--cpm-text-secondary)' }}>{step}</span>
            </li>
          ))}
        </ol>

        <div
          style={{
            marginTop: 24,
            padding: '12px 14px',
            borderRadius: 10,
            background: 'var(--cpm-brand-violet-bg)',
            border: '1px solid rgba(124,58,237,0.12)',
          }}
        >
          <div style={{ fontSize: 12, color: 'var(--cpm-text-tertiary)', lineHeight: 1.5 }}>
            「前往后台」入口仅对授权管理员显示。如看不到，请联系管理员开通权限。
          </div>
        </div>
      </motion.div>
    </div>
  );
}
