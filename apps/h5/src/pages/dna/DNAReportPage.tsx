import { useBreakpoint } from '@cpm/ui';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface DNAStats {
  totalScore: number;
  badgesEarned: number;
  activitiesJoined: number;
  scoresByDim: Record<string, number>;
}

interface DNAReport {
  title: string;
  period: string;
  highlights: string[];
  personality: string[];
  story: string;
  advice: string;
  topDimCode: string;
  topDimColor: string;
  stats: DNAStats;
}

export function DNAReportPage() {
  const navigate = useNavigate();
  const { isDesktop } = useBreakpoint();
  const [data, setData] = useState<DNAReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [stage, setStage] = useState(0); // 0..5 当前滚动阶段

  useEffect(() => {
    const token = localStorage.getItem('cpm_jwt');
    axios
      .get<DNAReport>('/api/v1/me/dna-report?period=quarter', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((r) => setData(r.data))
      .catch((e) => setErr(e?.response?.data?.error ?? String(e)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <FullScreen color="#a78bfa">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ textAlign: 'center', color: '#fff' }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
            style={{
              fontSize: 48,
              marginBottom: 16,
            }}
          >
            ✨
          </motion.div>
          <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 4 }}>
            AI 正在生成你的文化 DNA…
          </div>
          <div style={{ fontSize: 12, opacity: 0.7, lineHeight: 1.6 }}>
            分析积分流水 · 维度分布 · 活动轨迹
            <br />约 10-15 秒
          </div>
        </motion.div>
      </FullScreen>
    );
  }
  if (err || !data) {
    return (
      <FullScreen color="#94a3b8">
        <div style={{ color: '#fff', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⚠</div>
          <div style={{ fontSize: 14, marginBottom: 18 }}>{err ?? '加载失败'}</div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
              padding: '10px 22px',
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.3)',
              background: 'rgba(255,255,255,0.1)',
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            返回
          </button>
        </div>
      </FullScreen>
    );
  }

  const tint = data.topDimColor;
  const stages = [
    <CoverStage key={0} title={data.title} tint={tint} onNext={() => setStage(1)} />,
    <StatsStage key={1} stats={data.stats} tint={tint} onNext={() => setStage(2)} />,
    <HighlightsStage key={2} highlights={data.highlights} tint={tint} onNext={() => setStage(3)} />,
    <PersonalityStage key={3} personality={data.personality} tint={tint} onNext={() => setStage(4)} />,
    <StoryStage key={4} story={data.story} tint={tint} onNext={() => setStage(5)} />,
    <AdviceStage key={5} advice={data.advice} tint={tint} onClose={() => navigate(-1)} />,
  ];

  return (
    <FullScreen color={tint}>
      {/* 进度条 */}
      <div
        style={{
          position: 'absolute',
          top: 14,
          left: 14,
          right: 14,
          display: 'flex',
          gap: 4,
          zIndex: 10,
        }}
      >
        {stages.map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 2,
              background: i <= stage ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.25)',
              transition: 'background 0.3s',
            }}
          />
        ))}
      </div>
      {/* 关闭：移动端用钉钉自带返回，仅桌面端显示 */}
      {isDesktop && (
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{
            position: 'absolute',
            top: 24,
            right: 18,
            width: 32,
            height: 32,
            borderRadius: 16,
            border: 'none',
            background: 'rgba(255,255,255,0.15)',
            color: '#fff',
            fontSize: 16,
            cursor: 'pointer',
            zIndex: 10,
            backdropFilter: 'blur(8px)',
          }}
        >
          ✕
        </button>
      )}

      <AnimatePresence mode="wait">{stages[stage]}</AnimatePresence>

      <div style={{ position: 'absolute', bottom: 20, left: 0, right: 0, textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 11, letterSpacing: '0.18em', fontFamily: 'var(--cpm-font-sans)' }}>
        AI · GENERATED BY DEEPSEEK
      </div>
    </FullScreen>
  );
}

function FullScreen({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: `linear-gradient(135deg, ${color} 0%, #1e1b4b 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        fontFamily: 'var(--cpm-font-sans, system-ui)',
      }}
    >
      {/* 装饰光斑 */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          width: 500,
          height: 500,
          left: '50%',
          top: '20%',
          transform: 'translateX(-50%)',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${color}aa 0%, transparent 60%)`,
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />
      {children}
    </div>
  );
}

function CoverStage({ title, tint, onNext }: { title: string; tint: string; onNext: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      style={{ textAlign: 'center', color: '#fff', padding: '0 30px', position: 'relative', zIndex: 1 }}
      onClick={onNext}
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        style={{ fontSize: 72, marginBottom: 22, filter: `drop-shadow(0 8px 32px ${tint})` }}
      >
        🧬
      </motion.div>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.3em', opacity: 0.7, marginBottom: 10 }}>
        CULTURE DNA
      </div>
      <div style={{ fontSize: 30, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 22, lineHeight: 1.2 }}>
        {title}
      </div>
      <div style={{ fontSize: 13, opacity: 0.7, lineHeight: 1.7, marginBottom: 36 }}>
        AI 为你深度盘点这一季度的<br />文化成长与贡献
      </div>
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        onClick={onNext}
        style={{
          padding: '13px 32px',
          borderRadius: 999,
          border: 'none',
          background: '#fff',
          color: '#1e1b4b',
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: '0.08em',
          cursor: 'pointer',
          fontFamily: 'inherit',
          boxShadow: '0 12px 32px rgba(0,0,0,0.25)',
        }}
      >
        开启你的故事 →
      </motion.button>
    </motion.div>
  );
}

function StatsStage({ stats, tint, onNext }: { stats: DNAStats; tint: string; onNext: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5 }}
      style={{ width: '100%', maxWidth: 360, padding: '0 24px', color: '#fff', textAlign: 'center', position: 'relative', zIndex: 1 }}
    >
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.25em', opacity: 0.7, marginBottom: 8 }}>
        QUARTER IN NUMBERS
      </div>
      <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.01em', marginBottom: 28 }}>
        这季度的你
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
        <BigStat label="总积分" value={stats.totalScore.toLocaleString()} suffix="分" tint={tint} delay={0.1} />
        <BigStat label="徽章" value={String(stats.badgesEarned)} suffix="枚" tint={tint} delay={0.2} />
        <BigStat label="参与活动" value={String(stats.activitiesJoined)} suffix="场" tint={tint} delay={0.3} />
      </div>
      <NextDot onClick={onNext} />
    </motion.div>
  );
}

function BigStat({ label, value, suffix, tint, delay }: { label: string; value: string; suffix: string; tint: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
      style={{
        padding: '14px 18px',
        borderRadius: 16,
        background: 'rgba(255,255,255,0.1)',
        border: '1px solid rgba(255,255,255,0.18)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
      }}
    >
      <span style={{ fontSize: 14, opacity: 0.7 }}>{label}</span>
      <span style={{ fontSize: 30, fontWeight: 900, color: tint, fontFeatureSettings: '"tnum"' }}>
        {value} <span style={{ fontSize: 14, opacity: 0.7 }}>{suffix}</span>
      </span>
    </motion.div>
  );
}

function HighlightsStage({ highlights, tint, onNext }: { highlights: string[]; tint: string; onNext: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5 }}
      style={{ width: '100%', maxWidth: 360, padding: '0 30px', color: '#fff', position: 'relative', zIndex: 1 }}
    >
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.25em', opacity: 0.7, marginBottom: 8, textAlign: 'center' }}>
        HIGHLIGHTS
      </div>
      <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.01em', marginBottom: 24, textAlign: 'center' }}>
        高光时刻
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 30 }}>
        {highlights.map((h, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1, duration: 0.35 }}
            style={{
              padding: '12px 15px',
              borderRadius: 13,
              background: 'rgba(255,255,255,0.1)',
              border: `1px solid ${tint}55`,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: 14,
              fontWeight: 600,
              backdropFilter: 'blur(20px)',
            }}
          >
            <span
              style={{
                width: 26,
                height: 26,
                borderRadius: 8,
                background: tint,
                color: '#fff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              {i + 1}
            </span>
            <span style={{ flex: 1 }}>{h}</span>
          </motion.div>
        ))}
      </div>
      <NextDot onClick={onNext} />
    </motion.div>
  );
}

function PersonalityStage({ personality, tint, onNext }: { personality: string[]; tint: string; onNext: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.55 }}
      style={{ width: '100%', maxWidth: 360, padding: '0 30px', color: '#fff', textAlign: 'center', position: 'relative', zIndex: 1 }}
    >
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.25em', opacity: 0.7, marginBottom: 8 }}>
        PERSONALITY KEYWORDS
      </div>
      <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.01em', marginBottom: 32 }}>
        AI 看到的你
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 30 }}>
        {personality.map((kw, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.7, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.18, type: 'spring', stiffness: 200, damping: 14 }}
            style={{
              fontSize: 36 - i * 4,
              fontWeight: 900,
              letterSpacing: '-0.02em',
              color: tint,
              textShadow: `0 6px 32px ${tint}`,
            }}
          >
            "{kw}"
          </motion.div>
        ))}
      </div>
      <NextDot onClick={onNext} />
    </motion.div>
  );
}

function StoryStage({ story, tint, onNext }: { story: string; tint: string; onNext: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.55 }}
      style={{ width: '100%', maxWidth: 360, padding: '0 30px', color: '#fff', position: 'relative', zIndex: 1 }}
    >
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.25em', opacity: 0.7, marginBottom: 8, textAlign: 'center' }}>
        YOUR STORY
      </div>
      <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.01em', marginBottom: 24, textAlign: 'center' }}>
        AI 写给你
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        style={{
          fontSize: 15,
          lineHeight: 1.85,
          letterSpacing: '0.02em',
          padding: '18px 20px',
          borderRadius: 18,
          background: 'rgba(255,255,255,0.08)',
          border: `1px solid ${tint}44`,
          backdropFilter: 'blur(20px)',
          marginBottom: 24,
        }}
      >
        {story}
      </motion.div>
      <NextDot onClick={onNext} />
    </motion.div>
  );
}

function AdviceStage({ advice, tint, onClose }: { advice: string; tint: string; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      style={{ width: '100%', maxWidth: 360, padding: '0 30px', color: '#fff', textAlign: 'center', position: 'relative', zIndex: 1 }}
    >
      <motion.div
        animate={{ rotate: [0, -5, 5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{ fontSize: 56, marginBottom: 22 }}
      >
        🌱
      </motion.div>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.25em', opacity: 0.7, marginBottom: 6 }}>
        NEXT QUARTER
      </div>
      <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.01em', marginBottom: 18 }}>
        下一程
      </div>
      <div
        style={{
          fontSize: 16,
          lineHeight: 1.7,
          padding: '18px 20px',
          borderRadius: 16,
          background: 'rgba(255,255,255,0.1)',
          border: `1px solid ${tint}55`,
          backdropFilter: 'blur(20px)',
          marginBottom: 28,
        }}
      >
        {advice}
      </div>
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        onClick={onClose}
        style={{
          padding: '13px 32px',
          borderRadius: 999,
          border: 'none',
          background: `linear-gradient(135deg, ${tint} 0%, #fff 200%)`,
          color: '#1e1b4b',
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: '0.05em',
          cursor: 'pointer',
          fontFamily: 'inherit',
          boxShadow: `0 12px 32px ${tint}80`,
        }}
      >
        我已读懂自己 →
      </motion.button>
    </motion.div>
  );
}

function NextDot({ onClick }: { onClick: () => void }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.94 }}
        onClick={onClick}
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.3)',
          background: 'rgba(255,255,255,0.1)',
          color: '#fff',
          fontSize: 18,
          cursor: 'pointer',
          backdropFilter: 'blur(8px)',
        }}
      >
        ↓
      </motion.button>
    </div>
  );
}
