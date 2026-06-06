import { motion } from 'framer-motion';

export interface LeaderboardInsightData {
  headline: string;
  keyDriver: string;
  nextGoal: string;
  tone: string;
  currentRank: number;
  totalScore: number;
}

interface Props {
  data: LeaderboardInsightData | null;
  loading?: boolean;
}

const toneColors: Record<string, { from: string; to: string; text: string }> = {
  proud: { from: '#fef3c7', to: '#fed7aa', text: '#92400e' },
  encouraging: { from: '#ede9fe', to: '#dbeafe', text: '#5b21b6' },
  steady: { from: '#f0fdf4', to: '#dcfce7', text: '#166534' },
};

export function LeaderboardInsightCard({ data, loading }: Props) {
  if (loading || !data) {
    return (
      <div
        style={{
          flexShrink: 0,
          padding: '14px 16px',
          borderRadius: 16,
          background: 'rgba(124,58,237,0.06)',
          fontSize: 12,
          color: 'var(--cpm-text-tertiary)',
          fontFamily: 'var(--cpm-font-sans)',
        }}
      >
        ⚡ AI 正在分析你的排名变化…
      </div>
    );
  }
  const theme = toneColors[data.tone] ?? toneColors.encouraging;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      style={{
        position: 'relative',
        flexShrink: 0,
        padding: '14px 16px',
        borderRadius: 18,
        background: `linear-gradient(135deg, ${theme.from} 0%, ${theme.to} 100%)`,
        border: '1px solid rgba(255,255,255,0.7)',
        boxShadow: '0 12px 24px -8px rgba(124,58,237,0.18)',
        fontFamily: 'var(--cpm-font-sans)',
        overflow: 'hidden',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          right: -28,
          top: -28,
          width: 90,
          height: 90,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.6) 0%, transparent 70%)',
          filter: 'blur(12px)',
          pointerEvents: 'none',
        }}
      />
      <div style={{ position: 'relative' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '3px 9px',
            borderRadius: 999,
            background: 'rgba(255,255,255,0.7)',
            border: `1px solid ${theme.text}30`,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.15em',
            color: theme.text,
            marginBottom: 8,
          }}
        >
          <span>⚡</span>
          <span>AI 解读</span>
        </div>
        <div
          style={{
            fontSize: 17,
            fontWeight: 800,
            color: theme.text,
            letterSpacing: '-0.01em',
            marginBottom: 4,
          }}
        >
          {data.headline}
        </div>
        <div
          style={{
            fontSize: 13,
            color: 'var(--cpm-text-secondary)',
            lineHeight: 1.55,
            marginBottom: 6,
          }}
        >
          {data.keyDriver}
        </div>
        <div
          style={{
            fontSize: 12,
            color: theme.text,
            fontWeight: 600,
            opacity: 0.8,
          }}
        >
          🎯 {data.nextGoal}
        </div>
      </div>
    </motion.div>
  );
}
