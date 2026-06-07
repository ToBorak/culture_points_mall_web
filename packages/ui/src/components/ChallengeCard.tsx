import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';

export interface ChallengeData {
  id: string;
  dimensionCode: string;
  dimensionName: string;
  dimensionColor: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  verificationPrompt: string;
  points: number;
}

export interface ChallengeSubmitResult {
  pass: boolean;
  feedback: string;
  pointsAwarded?: number;
}

interface Props {
  data: ChallengeData | null;
  loading?: boolean;
  onSubmit: (proof: string) => Promise<ChallengeSubmitResult>;
}

export function ChallengeCard({ data, loading, onSubmit }: Props) {
  const [open, setOpen] = useState(false);
  const [proof, setProof] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ChallengeSubmitResult | null>(null);

  const submit = async () => {
    if (!proof.trim() || submitting) return;
    setSubmitting(true);
    try {
      const r = await onSubmit(proof);
      setResult(r);
      if (r.pass) setProof('');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !data) {
    return (
      <div
        style={{
          padding: 16,
          borderRadius: 20,
          background: 'rgba(124,58,237,0.05)',
          border: '1px solid var(--cpm-card-border)',
          fontSize: 12,
          color: 'var(--cpm-text-tertiary)',
        }}
      >
        ◇ AI 正在为你准备今日挑战…
      </div>
    );
  }

  const tint = data.dimensionColor;
  const done = result?.pass === true;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        position: 'relative',
        padding: '16px 18px 14px',
        borderRadius: 22,
        background: done ? `linear-gradient(135deg, ${tint}15 0%, ${tint}10 100%)` : '#fff',
        border: `1.5px solid ${tint}30`,
        boxShadow: `0 14px 32px -12px ${tint}40`,
        fontFamily: 'var(--cpm-font-sans)',
        overflow: 'hidden',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          right: -28,
          bottom: -28,
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${tint}40 0%, transparent 70%)`,
          filter: 'blur(15px)',
          pointerEvents: 'none',
          opacity: 0.7,
        }}
      />

      <div style={{ position: 'relative' }}>
        {/* 顶 chip */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 10px',
              borderRadius: 999,
              background: `${tint}15`,
              border: `1px solid ${tint}30`,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.15em',
              color: tint,
            }}
          >
            <span>◇</span>
            <span>每日挑战</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--cpm-text-muted)' }}>
            约 {data.estimatedMinutes} 分钟 · {data.dimensionName}
          </div>
        </div>

        {/* 标题 */}
        <div
          style={{
            fontSize: 17,
            fontWeight: 800,
            color: 'var(--cpm-text-primary)',
            letterSpacing: '-0.01em',
            marginBottom: 6,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          {data.title}
          {done && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 999,
                background: 'var(--cpm-success)',
                color: '#fff',
              }}
            >
              ✓ 已完成
            </span>
          )}
        </div>

        {/* 描述 */}
        <div
          style={{
            fontSize: 13,
            color: 'var(--cpm-text-secondary)',
            lineHeight: 1.55,
            marginBottom: 12,
          }}
        >
          {data.description}
        </div>

        {/* 收益 + CTA */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 10,
            borderTop: '1px solid rgba(15,23,42,0.06)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: tint,
                fontFeatureSettings: '"tnum"',
              }}
            >
              +{data.points}
            </span>
            <span style={{ fontSize: 11, color: 'var(--cpm-text-tertiary)' }}>分</span>
          </div>
          {!done && (
            <motion.button
              type="button"
              onClick={() => setOpen((v) => !v)}
              whileTap={{ scale: 0.96 }}
              style={{
                padding: '8px 14px',
                borderRadius: 11,
                border: 'none',
                background: `linear-gradient(135deg, ${tint} 0%, ${tint}dd 100%)`,
                color: '#fff',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
                boxShadow: `0 6px 16px -4px ${tint}80`,
              }}
            >
              {open ? '收起' : '去挑战 →'}
            </motion.button>
          )}
        </div>

        {/* 展开提交区 */}
        <AnimatePresence>
          {open && !done && (
            <motion.div
              initial={{ height: 0, opacity: 0, marginTop: 0 }}
              animate={{ height: 'auto', opacity: 1, marginTop: 12 }}
              exit={{ height: 0, opacity: 0, marginTop: 0 }}
              transition={{ duration: 0.25 }}
              style={{ overflow: 'hidden' }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--cpm-text-tertiary)',
                  marginBottom: 8,
                  padding: '8px 10px',
                  background: 'rgba(15,23,42,0.03)',
                  borderRadius: 8,
                  lineHeight: 1.5,
                }}
              >
                提交要求：{data.verificationPrompt}
              </div>
              <textarea
                value={proof}
                onChange={(e) => setProof(e.target.value)}
                placeholder="把你的完成证明写在这里…"
                rows={3}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 11,
                  border: '1.5px solid var(--cpm-card-border-strong)',
                  background: '#fff',
                  fontSize: 13,
                  color: 'var(--cpm-text-primary)',
                  outline: 'none',
                  resize: 'none',
                  fontFamily: 'inherit',
                  marginBottom: 10,
                  boxSizing: 'border-box',
                }}
              />
              {result && (
                <div
                  style={{
                    padding: '8px 10px',
                    borderRadius: 8,
                    background: result.pass ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                    border: `1px solid ${result.pass ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
                    color: result.pass ? 'var(--cpm-success)' : 'var(--cpm-danger)',
                    fontSize: 12,
                    marginBottom: 10,
                    lineHeight: 1.5,
                  }}
                >
                  {result.feedback}
                  {result.pass && result.pointsAwarded && (
                    <span style={{ fontWeight: 700, marginLeft: 6 }}>+{result.pointsAwarded} 分</span>
                  )}
                </div>
              )}
              <motion.button
                type="button"
                onClick={submit}
                disabled={submitting || !proof.trim()}
                whileTap={proof.trim() ? { scale: 0.96 } : undefined}
                style={{
                  width: '100%',
                  padding: '11px 0',
                  borderRadius: 11,
                  border: 'none',
                  background: proof.trim() ? `linear-gradient(135deg, ${tint} 0%, ${tint}dd 100%)` : 'var(--cpm-bg-2)',
                  color: proof.trim() ? '#fff' : 'var(--cpm-text-muted)',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: proof.trim() && !submitting ? 'pointer' : 'not-allowed',
                  fontFamily: 'inherit',
                }}
              >
                {submitting ? '🤖 AI 审核中…' : '提交挑战'}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
