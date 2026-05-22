import { useDimensions, useLeaderboard } from '@cpm/api-client';
import type { LeaderboardEntry } from '@cpm/types';
import { AuroraBg } from '@cpm/ui';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type Scope = 'total' | 'dim' | 'dept';
type Win = 'week' | 'month' | 'quarter' | 'year';

const scopeLabels: { key: Scope; label: string }[] = [
  { key: 'total', label: '总榜' },
  { key: 'dim', label: '维度榜' },
  { key: 'dept', label: '部门榜' },
];

const winLabels: { key: Win; label: string }[] = [
  { key: 'week', label: '周' },
  { key: 'month', label: '月' },
  { key: 'quarter', label: '季' },
  { key: 'year', label: '年' },
];

const dimColor: Record<string, string> = {
  customer_first: '#f97316',
  team_collab: '#0ea5e9',
  innovation: '#ec4899',
  integrity: '#10b981',
  craftsmanship: '#8b5cf6',
  growth: '#eab308',
};

const podiumConfig = [
  { tint: '#f59e0b', bg: 'linear-gradient(135deg,#fef9c3,#fde68a)', rank: 1, height: 84 },
  { tint: '#94a3b8', bg: 'linear-gradient(135deg,#f1f5f9,#e2e8f0)', rank: 2, height: 60 },
  { tint: '#cd7c3a', bg: 'linear-gradient(135deg,#fff7ed,#fed7aa)', rank: 3, height: 48 },
];

function Avatar({ name, avatarUrl }: { name: string; avatarUrl?: string }) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          objectFit: 'cover',
          border: '2px solid rgba(255,255,255,0.7)',
          boxShadow: 'var(--cpm-shadow-soft)',
          flexShrink: 0,
        }}
      />
    );
  }
  return (
    <div
      style={{
        width: 44,
        height: 44,
        borderRadius: '50%',
        background: 'linear-gradient(135deg,#c4b5fd,#fda4af)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 18,
        fontWeight: 700,
        color: '#fff',
        flexShrink: 0,
        boxShadow: 'var(--cpm-shadow-soft)',
      }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function PodiumCard({
  entry,
  cfg,
  isCenter,
}: {
  entry: LeaderboardEntry | undefined;
  cfg: (typeof podiumConfig)[0];
  isCenter: boolean;
}) {
  if (!entry) return <div style={{ flex: 1 }} />;
  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 180, damping: 18, delay: (cfg.rank - 1) * 0.12 }}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
      }}
    >
      {isCenter && (
        <span style={{ fontSize: 20 }}>👑</span>
      )}
      <div
        style={{
          width: isCenter ? 52 : 44,
          height: isCenter ? 52 : 44,
          borderRadius: '50%',
          overflow: 'hidden',
          border: `2px solid ${cfg.tint}`,
          boxShadow: `0 4px 12px -4px ${cfg.tint}60`,
        }}
      >
        {entry.avatarUrl ? (
          <img src={entry.avatarUrl} alt={entry.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg,#c4b5fd,#fda4af)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: isCenter ? 22 : 18,
              fontWeight: 700,
              color: '#fff',
            }}
          >
            {entry.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: 'var(--cpm-text-primary)',
          textAlign: 'center',
          maxWidth: 70,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {entry.name}
      </div>
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: cfg.tint,
          fontFeatureSettings: '"tnum"',
        }}
      >
        {entry.score.toLocaleString()}
      </div>
      <div
        style={{
          width: '100%',
          height: cfg.height,
          background: cfg.bg,
          borderRadius: '12px 12px 0 0',
          border: `1px solid ${cfg.tint}30`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: isCenter ? 20 : 16,
          fontWeight: 700,
          color: cfg.tint,
        }}
      >
        #{cfg.rank}
      </div>
    </motion.div>
  );
}

export function LeaderboardPage() {
  const [scope, setScope] = useState<Scope>('total');
  const [win, setWin] = useState<Win>('year');
  const [dimId, setDimId] = useState<number | undefined>();
  const navigate = useNavigate();
  const dims = useDimensions();
  const q = useLeaderboard({ scope, window: win, dimensionId: dimId });

  const entries: LeaderboardEntry[] = q.data?.entries ?? [];
  const myUserId = Number(localStorage.getItem('cpm_user_id') ?? 0);
  const myEntry = entries.find((e) => e.userId === myUserId);
  const myRank = myEntry?.rank ?? null;
  const total = q.data?.total ?? entries.length;
  const beatPct = myRank != null && total > 0 ? Math.round(((total - myRank) / total) * 100) : null;

  return (
    <AuroraBg>
      <main style={{ padding: '20px 16px 60px', maxWidth: 460, margin: '0 auto' }}>
        {/* 顶部状态栏 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
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
            排行榜
          </span>
          <div style={{ width: 60 }} />
        </div>

        {/* 我的排名卡（紫渐变） */}
        {myEntry != null && (
          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            style={{
              position: 'relative',
              borderRadius: 20,
              padding: '16px 20px',
              background: 'linear-gradient(135deg, #4c1d95 0%, #1e3a8a 100%)',
              boxShadow: 'var(--cpm-shadow-glow-violet)',
              overflow: 'hidden',
              marginBottom: 16,
            }}
          >
            <div
              aria-hidden
              style={{
                position: 'absolute',
                right: -30,
                top: -30,
                width: 160,
                height: 160,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(167,139,250,0.35), transparent 70%)',
                filter: 'blur(20px)',
              }}
            />
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12 }}>
              <Avatar name={myEntry.name} avatarUrl={myEntry.avatarUrl} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.08em', fontWeight: 600 }}>
                  MY POSITION
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 2 }}>
                  <span
                    style={{
                      fontSize: 32,
                      fontWeight: 700,
                      color: '#fff',
                      letterSpacing: '-0.03em',
                      fontFeatureSettings: '"tnum"',
                      lineHeight: 1,
                    }}
                  >
                    #{myRank}
                  </span>
                  {beatPct !== null && (
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)' }}>
                      超越 {beatPct}% 同事
                    </span>
                  )}
                </div>
              </div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: '#fef08a',
                  fontFeatureSettings: '"tnum"',
                }}
              >
                {myEntry.score.toLocaleString()}
              </div>
            </div>
          </motion.section>
        )}

        {/* Scope 切换 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
          style={{ marginBottom: 10 }}
        >
          <div
            style={{
              display: 'flex',
              gap: 6,
              background: '#fff',
              borderRadius: 14,
              padding: 4,
              border: '1px solid var(--cpm-card-border)',
              boxShadow: 'var(--cpm-shadow-soft)',
            }}
          >
            {scopeLabels.map((s) => (
              <motion.button
                key={s.key}
                onClick={() => {
                  setScope(s.key);
                  if (s.key !== 'dim') setDimId(undefined);
                }}
                whileTap={{ scale: 0.94 }}
                style={{
                  flex: 1,
                  padding: '8px 4px',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: 'var(--cpm-font-sans)',
                  cursor: 'pointer',
                  border: 'none',
                  background:
                    scope === s.key
                      ? 'linear-gradient(135deg, var(--cpm-brand-violet), var(--cpm-brand-cyan))'
                      : 'transparent',
                  color: scope === s.key ? '#fff' : 'var(--cpm-text-tertiary)',
                  transition: 'all 0.2s ease',
                }}
              >
                {s.label}
              </motion.button>
            ))}
          </div>

          {/* 时间窗 chip */}
          <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
            {winLabels.map((w) => (
              <motion.button
                key={w.key}
                onClick={() => setWin(w.key)}
                whileTap={{ scale: 0.9 }}
                style={{
                  padding: '5px 14px',
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: 'var(--cpm-font-sans)',
                  cursor: 'pointer',
                  border: win === w.key ? 'none' : '1px solid var(--cpm-card-border)',
                  background:
                    win === w.key ? 'var(--cpm-brand-violet)' : '#fff',
                  color: win === w.key ? '#fff' : 'var(--cpm-text-tertiary)',
                  boxShadow: win === w.key ? 'var(--cpm-shadow-glow-violet)' : 'var(--cpm-shadow-soft)',
                  transition: 'all 0.2s ease',
                }}
              >
                {w.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* 维度 chip（仅维度榜） */}
        {scope === 'dim' && dims.data && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}
          >
            {dims.data.map((d) => (
              <motion.button
                key={d.id}
                onClick={() => setDimId(d.id === dimId ? undefined : d.id)}
                whileTap={{ scale: 0.9 }}
                style={{
                  padding: '5px 12px',
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: 'var(--cpm-font-sans)',
                  cursor: 'pointer',
                  border: 'none',
                  background:
                    d.id === dimId
                      ? dimColor[d.code] ?? 'var(--cpm-brand-violet)'
                      : `${dimColor[d.code] ?? '#7c3aed'}15`,
                  color: d.id === dimId ? '#fff' : (dimColor[d.code] ?? '#7c3aed'),
                  transition: 'all 0.2s ease',
                }}
              >
                {d.name}
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* 加载中 */}
        {q.isLoading && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--cpm-text-tertiary)', fontSize: 14 }}>
            加载中...
          </div>
        )}

        {/* Top 3 颁奖台 */}
        {!q.isLoading && entries.length >= 3 && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            style={{
              background: '#fff',
              borderRadius: 22,
              border: '1px solid var(--cpm-card-border)',
              boxShadow: 'var(--cpm-shadow-soft)',
              padding: '20px 16px 0',
              marginBottom: 12,
              overflow: 'hidden',
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', color: 'var(--cpm-text-tertiary)', marginBottom: 16 }}>
              TOP 3
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
              {/* 2nd */}
              <PodiumCard entry={entries[1]} cfg={podiumConfig[1]} isCenter={false} />
              {/* 1st */}
              <PodiumCard entry={entries[0]} cfg={podiumConfig[0]} isCenter={true} />
              {/* 3rd */}
              <PodiumCard entry={entries[2]} cfg={podiumConfig[2]} isCenter={false} />
            </div>
          </motion.section>
        )}

        {/* 剩余列表 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {entries.slice(3).map((e, i) => (
            <motion.div
              key={e.userId}
              initial={{ x: -24, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.03 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                background: e.userId === myUserId
                  ? 'linear-gradient(135deg,rgba(124,58,237,0.06),rgba(8,145,178,0.06))'
                  : '#fff',
                borderRadius: 16,
                border: e.userId === myUserId
                  ? '1px solid rgba(124,58,237,0.18)'
                  : '1px solid var(--cpm-card-border)',
                boxShadow: 'var(--cpm-shadow-soft)',
                padding: '10px 14px',
              }}
            >
              {/* 排名 badge */}
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'var(--cpm-bg-2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  fontWeight: 700,
                  color: 'var(--cpm-text-secondary)',
                  fontFeatureSettings: '"tnum"',
                  flexShrink: 0,
                }}
              >
                {e.rank}
              </div>
              <Avatar name={e.name} avatarUrl={e.avatarUrl} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: 'var(--cpm-text-primary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {e.name}
                </div>
                <div style={{ fontSize: 11, color: 'var(--cpm-text-tertiary)', marginTop: 1 }}>
                  {e.deptName}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: 'var(--cpm-text-primary)',
                    fontFeatureSettings: '"tnum"',
                  }}
                >
                  {e.score.toLocaleString()}
                </div>
                {e.trend !== 0 && (
                  <div
                    style={{
                      fontSize: 11,
                      color: e.trend > 0 ? 'var(--cpm-success)' : 'var(--cpm-danger)',
                      fontWeight: 600,
                    }}
                  >
                    {e.trend > 0 ? `▲ ${e.trend}` : `▼ ${Math.abs(e.trend)}`}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {!q.isLoading && entries.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--cpm-text-muted)', fontSize: 14 }}>
            暂无数据
          </div>
        )}
      </main>
    </AuroraBg>
  );
}
