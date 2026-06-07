import { AuroraBg, useBreakpoint } from '@cpm/ui';
import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

type Step = 'submit' | 'ok' | 'fail';

// animated counting number
function CountUp({ to, duration = 1.2 }: { to: number; duration?: number }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / (duration * 1000), 1);
      setVal(Math.round(progress * to));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [to, duration]);
  return <span style={{ fontFeatureSettings: '"tnum"' }}>{val > 0 ? `+${val}` : val}</span>;
}

export function SigninPage() {
  const [params] = useSearchParams();
  const activityId = Number(params.get('a') ?? 0);
  const code = params.get('c') ?? '';
  const navigate = useNavigate();
  const { isDesktop } = useBreakpoint();
  const qc = useQueryClient();

  const [step, setStep] = useState<Step>('submit');
  const [reason, setReason] = useState<string | null>(null);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const fired = useRef(false);

  const submit = async () => {
    setStep('submit');
    const token = localStorage.getItem('cpm_jwt');
    try {
      const res = await axios.post<{ points?: number }>(
        '/api/v1/signin/check',
        { activityId, code },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setEarnedPoints(res.data?.points ?? 10);
      setStep('ok');
      // 与积分商城一致：失效积分/勋章墙/活动等缓存。totalScore 变化会驱动全局
      // BadgeCelebration 结算并弹出本次新解锁的勋章（如首次签到）。
      qc.invalidateQueries({ queryKey: ['me', 'passport'] });
      qc.invalidateQueries({ queryKey: ['me', 'badges'] });
      qc.invalidateQueries({ queryKey: ['me', 'transactions'] });
      qc.invalidateQueries({ queryKey: ['activities'] });
      qc.invalidateQueries({ queryKey: ['activity', activityId] });
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string; reason?: string } } };
      setReason(err?.response?.data?.error ?? err?.response?.data?.reason ?? '签到失败，请重试');
      setStep('fail');
    }
  };

  // 扫码进入即自动核销签到（无需定位、无需答题）；ref 守卫保证含 StrictMode 双调用/重渲染下
  // 只提交一次，避免并发重复请求把签到记录与积分重复计入。
  // biome-ignore lint/correctness/useExhaustiveDependencies: 仅在首次进入时自动提交一次
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    submit();
  }, []);

  return (
    <AuroraBg>
      <main style={{ padding: '20px 16px 60px', maxWidth: 460, margin: '0 auto' }}>
        {/* 顶部状态栏 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
          }}
        >
          {/* 移动端依赖钉钉自带返回；桌面端保留顶部返回 */}
          {isDesktop ? (
            <motion.button
              onClick={() => navigate(-1)}
              whileTap={{ scale: 0.88 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 10,
                background: '#fff',
                border: '1px solid var(--cpm-card-border)',
                boxShadow: 'var(--cpm-shadow-soft)',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 500,
                color: 'var(--cpm-text-primary)',
              }}
            >
              ← 返回
            </motion.button>
          ) : (
            <div style={{ width: 60 }} />
          )}
          <span
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: 'var(--cpm-text-primary)',
              letterSpacing: '-0.01em',
            }}
          >
            扫码签到
          </span>
          <div style={{ width: 60 }} />
        </div>

        {/* 步骤内容 */}
        <AnimatePresence mode="wait">
          {/* 提交中 */}
          {step === 'submit' && (
            <motion.div
              key="submit"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                background: '#fff',
                borderRadius: 24,
                border: '1px solid var(--cpm-card-border)',
                boxShadow: 'var(--cpm-shadow-soft)',
                padding: '48px 24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 14,
                textAlign: 'center',
              }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1, ease: 'linear' }}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  border: '3px solid var(--cpm-card-border)',
                  borderTopColor: 'var(--cpm-brand-violet)',
                }}
              />
              <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--cpm-text-secondary)' }}>验证中，请稍候...</div>
            </motion.div>
          )}

          {/* 成功 */}
          {step === 'ok' && (
            <motion.div
              key="ok"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 200, damping: 18 }}
              style={{
                background: 'linear-gradient(135deg,#f0fdf4,#ecfdf5)',
                borderRadius: 24,
                border: '1px solid rgba(16,185,129,0.15)',
                boxShadow: '0 12px 32px -8px rgba(16,185,129,0.22)',
                padding: '36px 24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 14,
                textAlign: 'center',
              }}
            >
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 14, delay: 0.1 }}
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  background: 'var(--cpm-success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 34,
                  color: '#fff',
                  boxShadow: '0 8px 24px -6px rgba(16,185,129,0.5)',
                }}
              >
                ✓
              </motion.div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: '#065f46',
                  letterSpacing: '-0.01em',
                }}
              >
                签到成功！
              </div>
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                style={{
                  fontSize: 42,
                  fontWeight: 800,
                  color: 'var(--cpm-success)',
                  letterSpacing: '-0.03em',
                  lineHeight: 1,
                }}
              >
                <CountUp to={earnedPoints} />
              </motion.div>
              <div style={{ fontSize: 14, color: '#064e3b', fontWeight: 500 }}>积分已入账 🎊</div>
              <motion.button
                onClick={() => navigate('/')}
                whileTap={{ scale: 0.96 }}
                style={{
                  marginTop: 8,
                  padding: '12px 32px',
                  borderRadius: 14,
                  fontSize: 14,
                  fontWeight: 700,
                  fontFamily: 'var(--cpm-font-sans)',
                  border: 'none',
                  background: 'var(--cpm-success)',
                  color: '#fff',
                  cursor: 'pointer',
                  boxShadow: '0 8px 20px -6px rgba(16,185,129,0.45)',
                }}
              >
                返回首页
              </motion.button>
            </motion.div>
          )}

          {/* 失败 */}
          {step === 'fail' && (
            <motion.div
              key="fail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              style={{
                background: 'linear-gradient(135deg,#fff1f2,#fef2f2)',
                borderRadius: 24,
                border: '1px solid rgba(239,68,68,0.15)',
                boxShadow: '0 8px 24px -8px rgba(239,68,68,0.18)',
                padding: '32px 24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 14,
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: 'rgba(239,68,68,0.10)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 30,
                }}
              >
                ✕
              </div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: '#991b1b',
                  letterSpacing: '-0.01em',
                }}
              >
                签到未通过
              </div>
              <div
                style={{
                  fontSize: 14,
                  color: '#7f1d1d',
                  lineHeight: 1.6,
                  background: 'rgba(239,68,68,0.07)',
                  borderRadius: 12,
                  padding: '10px 16px',
                  maxWidth: 280,
                }}
              >
                {reason ?? '签到失败，请重试'}
              </div>
              <motion.button
                onClick={() => submit()}
                whileTap={{ scale: 0.96 }}
                style={{
                  padding: '12px 28px',
                  borderRadius: 14,
                  fontSize: 14,
                  fontWeight: 700,
                  fontFamily: 'var(--cpm-font-sans)',
                  border: 'none',
                  background: 'linear-gradient(135deg,#ef4444,#dc2626)',
                  color: '#fff',
                  cursor: 'pointer',
                  boxShadow: 'var(--cpm-shadow-glow-rose)',
                }}
              >
                重试
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </AuroraBg>
  );
}
