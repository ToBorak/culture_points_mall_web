import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { AuroraBg } from '@cpm/ui';

interface Quiz {
  question: string;
  expect: string;
}

type Step = 'gps' | 'quiz' | 'submit' | 'ok' | 'fail';

const QUIZ_OPTIONS = ['客户至上', '团队协作', '创新求变', '诚信务实', '极致专注', '学习成长'];

const QUIZ_COLORS = [
  { bg: 'rgba(249,115,22,0.10)', color: '#f97316' },
  { bg: 'rgba(14,165,233,0.10)', color: '#0ea5e9' },
  { bg: 'rgba(236,72,153,0.10)', color: '#ec4899' },
  { bg: 'rgba(16,185,129,0.10)', color: '#10b981' },
  { bg: 'rgba(139,92,246,0.10)', color: '#8b5cf6' },
  { bg: 'rgba(234,179,8,0.10)', color: '#eab308' },
];

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

  const [step, setStep] = useState<Step>('gps');
  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null);
  const [answer, setAnswer] = useState('');
  const [reason, setReason] = useState<string | null>(null);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [quiz] = useState<Quiz>({
    question: '今天活动主题中哪个价值观最重要？',
    expect: '客户至上',
  });

  useEffect(() => {
    if (step !== 'gps') return;
    if (!navigator.geolocation) {
      setStep('quiz');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setStep('quiz');
      },
      () => setStep('quiz'),
      { timeout: 6000 },
    );
  }, [step]);

  const submit = async () => {
    setStep('submit');
    const token = localStorage.getItem('cpm_jwt');
    try {
      const res = await axios.post<{ points?: number }>(
        '/api/v1/signin/check',
        {
          activityId,
          code,
          gpsLat: gps?.lat,
          gpsLng: gps?.lng,
          quizExpect: quiz.expect,
          quizAnswer: answer,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setEarnedPoints(res.data?.points ?? 10);
      setStep('ok');
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string; reason?: string } } };
      setReason(err?.response?.data?.error ?? err?.response?.data?.reason ?? '签到失败，请重试');
      setStep('fail');
    }
  };

  // 步骤编号 0-based for progress
  const stepIndex: Record<Step, number> = { gps: 0, quiz: 1, submit: 1, ok: 2, fail: 1 };
  const currentStepIdx = stepIndex[step];
  const steps = ['定位', '答题', '完成'];

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

        {/* Stepper */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0,
            marginBottom: 28,
          }}
        >
          {steps.map((label, idx) => {
            const done = currentStepIdx > idx;
            const active = currentStepIdx === idx;
            return (
              <div key={label} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                  <motion.div
                    animate={{
                      background: done
                        ? 'var(--cpm-success)'
                        : active
                        ? 'linear-gradient(135deg,var(--cpm-brand-violet),var(--cpm-brand-cyan))'
                        : '#fff',
                      boxShadow: active ? 'var(--cpm-shadow-glow-violet)' : 'none',
                    }}
                    transition={{ duration: 0.3 }}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      border: done || active
                        ? 'none'
                        : '1.5px solid var(--cpm-card-border-strong)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 13,
                      fontWeight: 700,
                      color: done || active ? '#fff' : 'var(--cpm-text-muted)',
                    }}
                  >
                    {done ? '✓' : idx + 1}
                  </motion.div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: active ? 600 : 400,
                      color: active
                        ? 'var(--cpm-brand-violet)'
                        : done
                        ? 'var(--cpm-success)'
                        : 'var(--cpm-text-muted)',
                    }}
                  >
                    {label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    style={{
                      width: 48,
                      height: 2,
                      background: done
                        ? 'var(--cpm-success)'
                        : 'var(--cpm-card-border)',
                      borderRadius: 1,
                      margin: '0 4px',
                      marginBottom: 18,
                      transition: 'background 0.4s ease',
                    }}
                  />
                )}
              </div>
            );
          })}
        </motion.div>

        {/* 步骤内容 */}
        <AnimatePresence mode="wait">
          {/* 步骤 1：GPS 定位 */}
          {step === 'gps' && (
            <motion.div
              key="gps"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              style={{
                background: '#fff',
                borderRadius: 24,
                border: '1px solid var(--cpm-card-border)',
                boxShadow: 'var(--cpm-shadow-soft)',
                padding: '36px 24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 16,
                textAlign: 'center',
              }}
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [1, 0.7, 1] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg,rgba(124,58,237,0.12),rgba(8,145,178,0.08))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 34,
                }}
              >
                ⊕
              </motion.div>
              <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--cpm-text-primary)' }}>
                正在获取定位...
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: 'var(--cpm-text-tertiary)',
                  lineHeight: 1.6,
                  maxWidth: 260,
                }}
              >
                我们需要验证您在活动现场，请允许浏览器获取您的位置信息。
              </div>
            </motion.div>
          )}

          {/* 步骤 2：答题 */}
          {step === 'quiz' && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              style={{
                background: '#fff',
                borderRadius: 24,
                border: '1px solid var(--cpm-card-border)',
                boxShadow: 'var(--cpm-shadow-soft)',
                padding: '24px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  color: 'var(--cpm-text-tertiary)',
                }}
              >
                QUIZ · 活动 #{activityId}
              </div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: 'var(--cpm-text-primary)',
                  lineHeight: 1.5,
                }}
              >
                {quiz.question}
              </div>

              {/* 选项 chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {QUIZ_OPTIONS.map((opt, idx) => {
                  const c = QUIZ_COLORS[idx % QUIZ_COLORS.length];
                  const selected = answer === opt;
                  return (
                    <motion.button
                      key={opt}
                      onClick={() => setAnswer(opt)}
                      whileTap={{ scale: 0.92 }}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 999,
                        fontSize: 13,
                        fontWeight: 600,
                        fontFamily: 'var(--cpm-font-sans)',
                        cursor: 'pointer',
                        border: selected ? 'none' : `1px solid ${c.color}40`,
                        background: selected ? c.color : c.bg,
                        color: selected ? '#fff' : c.color,
                        boxShadow: selected ? `0 4px 12px -4px ${c.color}50` : 'none',
                        transition: 'all 0.18s ease',
                      }}
                    >
                      {opt}
                    </motion.button>
                  );
                })}
              </div>

              {/* 或者手输 */}
              <input
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="或直接输入答案..."
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 12,
                  border: '1px solid var(--cpm-card-border-strong)',
                  background: 'var(--cpm-bg-0)',
                  fontSize: 14,
                  color: 'var(--cpm-text-primary)',
                  fontFamily: 'var(--cpm-font-sans)',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />

              <motion.button
                onClick={submit}
                disabled={!answer.trim()}
                whileHover={answer.trim() ? { scale: 1.02 } : undefined}
                whileTap={answer.trim() ? { scale: 0.97 } : undefined}
                style={{
                  width: '100%',
                  padding: '14px 0',
                  borderRadius: 14,
                  fontSize: 15,
                  fontWeight: 700,
                  fontFamily: 'var(--cpm-font-sans)',
                  border: 'none',
                  background: answer.trim()
                    ? 'linear-gradient(135deg,var(--cpm-brand-violet),var(--cpm-brand-cyan))'
                    : 'rgba(15,23,42,0.08)',
                  color: answer.trim() ? '#fff' : 'var(--cpm-text-muted)',
                  cursor: answer.trim() ? 'pointer' : 'not-allowed',
                  boxShadow: answer.trim() ? 'var(--cpm-shadow-glow-violet)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                提交签到
              </motion.button>
            </motion.div>
          )}

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
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  border: '3px solid var(--cpm-card-border)',
                  borderTopColor: 'var(--cpm-brand-violet)',
                }}
              />
              <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--cpm-text-secondary)' }}>
                验证中，请稍候...
              </div>
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
              <div style={{ fontSize: 14, color: '#064e3b', fontWeight: 500 }}>
                积分已入账 🎊
              </div>
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
                {reason ?? '请检查位置和答案后重试'}
              </div>
              <motion.button
                onClick={() => setStep('quiz')}
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
