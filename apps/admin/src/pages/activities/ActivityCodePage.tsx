import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';

export function ActivityCodePage() {
  const { id } = useParams();
  const [code, setCode] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const activityId = Number(id);
  const h5Base = window.location.origin.replace(':5174', ':5173');

  // WebSocket 连接
  useEffect(() => {
    const wsURL = `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host.replace(':5174', ':18080')}/admin/activities/${activityId}/signin-codes/stream`;
    const ws = new WebSocket(wsURL);

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onerror = () => setConnected(false);

    ws.onmessage = (ev) => {
      try {
        const obj = JSON.parse(ev.data) as { code: string };
        setCode(obj.code);
        setCountdown(30);
      } catch {
        // ignore parse errors
      }
    };
    return () => ws.close();
  }, [activityId]);

  // 倒计时
  useEffect(() => {
    if (!code) return;
    const timer = setInterval(() => {
      setCountdown((c) => (c > 0 ? c - 1 : 30));
    }, 1000);
    return () => clearInterval(timer);
  }, [code]);

  const url = code ? `${h5Base}/signin?a=${activityId}&c=${code}` : '';

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 56px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0f172a',
        margin: -28,
        padding: 40,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 背景装饰 */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          width: 600,
          height: 600,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 65%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />

      {/* 顶部活动信息 */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          marginBottom: 32,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.16em',
            color: 'rgba(167,139,250,0.8)',
            marginBottom: 8,
          }}
        >
          ACTIVITY SIGNIN
        </div>
        <div
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: '#fff',
            letterSpacing: '-0.02em',
          }}
        >
          活动 #{activityId} 签到大屏
        </div>
      </motion.div>

      {/* QR 码卡片 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{
          background: '#fff',
          borderRadius: 28,
          padding: 36,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
          boxShadow: '0 0 80px rgba(124,58,237,0.4), 0 32px 80px rgba(0,0,0,0.4)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {code ? (
          <>
            <QRCodeCanvas
              value={url}
              size={380}
              bgColor="#ffffff"
              fgColor="#0f172a"
              level="M"
            />
            <div
              style={{
                fontFamily: 'monospace',
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: '0.18em',
                color: 'var(--cpm-text-primary)',
                borderTop: '1px solid var(--cpm-card-border)',
                paddingTop: 16,
                width: '100%',
                textAlign: 'center',
              }}
            >
              {code}
            </div>

            {/* 倒计时进度条 */}
            <div style={{ width: '100%' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 6,
                }}
              >
                <span style={{ fontSize: 11, color: 'var(--cpm-text-muted)', fontWeight: 500 }}>
                  自动刷新
                </span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: countdown <= 5 ? 'var(--cpm-danger)' : 'var(--cpm-brand-violet)',
                    fontFeatureSettings: '"tnum"',
                  }}
                >
                  {countdown}s
                </span>
              </div>
              <div
                style={{
                  height: 4,
                  borderRadius: 2,
                  background: 'rgba(15,23,42,0.08)',
                  overflow: 'hidden',
                }}
              >
                <motion.div
                  animate={{ width: `${(countdown / 30) * 100}%` }}
                  transition={{ duration: 1, ease: 'linear' }}
                  style={{
                    height: '100%',
                    background: countdown <= 5
                      ? 'var(--cpm-danger)'
                      : 'linear-gradient(90deg, var(--cpm-brand-violet), var(--cpm-brand-cyan))',
                    borderRadius: 2,
                  }}
                />
              </div>
            </div>
          </>
        ) : (
          <div
            style={{
              width: 380,
              height: 380,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--cpm-text-tertiary)',
              fontSize: 14,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: 'var(--cpm-brand-violet)',
                  }}
                />
              ))}
              <span style={{ marginTop: 4 }}>连接中...</span>
            </div>
          </div>
        )}
      </motion.div>

      {/* 左下角 status indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{
          position: 'fixed',
          bottom: 28,
          left: 268,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 14px',
          borderRadius: 999,
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.15)',
        }}
      >
        <motion.div
          animate={connected ? { scale: [1, 1.5, 1], opacity: [1, 0.4, 1] } : {}}
          transition={connected ? { duration: 2, repeat: Infinity } : {}}
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: connected ? '#10b981' : '#ef4444',
          }}
        />
        <span style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.8)' }}>
          {connected ? '已连接' : '未连接'}
        </span>
      </motion.div>

      {/* 底部提示 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        style={{
          marginTop: 28,
          fontSize: 12,
          color: 'rgba(255,255,255,0.3)',
          textAlign: 'center',
        }}
      >
        扫码签到 · 每 30 秒自动刷新防重复
      </motion.div>
    </div>
  );
}
