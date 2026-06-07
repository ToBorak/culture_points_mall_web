import { motion } from 'framer-motion';

export interface AiCoachData {
  focusDimCode: string;
  focusDimName: string;
  focusDimColor: string;
  title: string;
  reason: string;
  actionItems: string[];
  expectedGain: string;
}

interface Props {
  data: AiCoachData | null;
  loading?: boolean;
}

export function AiCoachCard({ data, loading }: Props) {
  if (loading || !data) {
    return (
      <div
        style={{
          padding: 18,
          borderRadius: 20,
          background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
          border: '1px solid rgba(255,255,255,0.8)',
          boxShadow: 'var(--cpm-shadow-soft)',
        }}
      >
        <div style={{ fontSize: 12, opacity: 0.6 }}>✨ AI 正在为你生成个性化建议…</div>
      </div>
    );
  }
  const tint = data.focusDimColor;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileTap={{ scale: 0.99 }}
      style={{
        position: 'relative',
        padding: '18px 18px 16px',
        borderRadius: 22,
        background: `linear-gradient(135deg, ${tint}10 0%, ${tint}22 100%)`,
        border: `1px solid ${tint}33`,
        boxShadow: `0 14px 32px -10px ${tint}33`,
        fontFamily: 'var(--cpm-font-sans)',
        overflow: 'hidden',
      }}
    >
      {/* 角标 */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          right: -20,
          top: -20,
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${tint}55 0%, transparent 70%)`,
          filter: 'blur(10px)',
          pointerEvents: 'none',
        }}
      />
      <div style={{ position: 'relative' }}>
        {/* 顶 chip */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            borderRadius: 999,
            background: '#fff',
            border: `1px solid ${tint}40`,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.15em',
            color: tint,
            marginBottom: 10,
          }}
        >
          <span>⚡</span>
          <span>AI 成长教练</span>
        </div>

        {/* 标题 */}
        <div
          style={{
            fontSize: 18,
            fontWeight: 800,
            color: 'var(--cpm-text-primary)',
            letterSpacing: '-0.01em',
            marginBottom: 6,
          }}
        >
          {data.title}
        </div>

        {/* 原因 */}
        <div
          style={{
            fontSize: 13,
            color: 'var(--cpm-text-secondary)',
            lineHeight: 1.55,
            marginBottom: 14,
          }}
        >
          {data.reason}
        </div>

        {/* Action items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
          {data.actionItems.map((it, idx) => (
            <motion.div
              key={it}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * idx + 0.1 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '9px 12px',
                background: '#fff',
                borderRadius: 11,
                border: '1px solid rgba(15,23,42,0.04)',
                fontSize: 13,
                fontWeight: 500,
                color: 'var(--cpm-text-primary)',
              }}
            >
              <span
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: tint,
                  color: '#fff',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {idx + 1}
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>{it}</span>
            </motion.div>
          ))}
        </div>

        {/* 预期收益 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 10,
            borderTop: '1px solid rgba(15,23,42,0.06)',
            fontSize: 12,
          }}
        >
          <span style={{ color: 'var(--cpm-text-tertiary)' }}>预期收益</span>
          <span style={{ fontWeight: 700, color: tint, fontFeatureSettings: '"tnum"' }}>{data.expectedGain}</span>
        </div>
      </div>
    </motion.div>
  );
}
