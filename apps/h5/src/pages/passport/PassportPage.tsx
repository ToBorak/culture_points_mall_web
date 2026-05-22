import { useMyBadges, useMyTransactions, usePassport } from '@cpm/api-client';
import type { Badge } from '@cpm/types';
import { AuroraBg } from '@cpm/ui';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PassportRadar } from './PassportRadar';

type View = 'radar' | 'badges' | 'tx';

const dimColor: Record<string, string> = {
  customer_first: '#f97316',
  team_collab: '#0ea5e9',
  innovation: '#ec4899',
  integrity: '#10b981',
  craftsmanship: '#8b5cf6',
  growth: '#eab308',
};

const rarityConfig: Record<string, { label: string; color: string; bg: string }> = {
  common: { label: 'Common', color: '#64748b', bg: 'rgba(100,116,139,0.10)' },
  rare: { label: 'Rare', color: '#0ea5e9', bg: 'rgba(14,165,233,0.10)' },
  epic: { label: 'Epic', color: '#8b5cf6', bg: 'rgba(139,92,246,0.10)' },
  legendary: { label: 'Legendary', color: '#f59e0b', bg: 'rgba(245,158,11,0.10)' },
};

function levelOf(total: number) {
  if (total >= 1500) return { name: 'Legendary', tier: 'L4', color: '#7c3aed' };
  if (total >= 500) return { name: 'Epic', tier: 'L3', color: '#0891b2' };
  if (total >= 100) return { name: 'Rare', tier: 'L2', color: '#10b981' };
  return { name: 'Starter', tier: 'L1', color: '#d97706' };
}

const tabLabels: { key: View; label: string }[] = [
  { key: 'radar', label: '价值观雷达' },
  { key: 'badges', label: '徽章墙' },
  { key: 'tx', label: '积分流水' },
];

export function PassportPage() {
  const [view, setView] = useState<View>('radar');
  const navigate = useNavigate();
  const p = usePassport();
  const b = useMyBadges();
  const txQ = useMyTransactions(20);

  const name = localStorage.getItem('cpm_name') ?? '伙伴';
  const total = p.data?.totalScore ?? 0;
  const lv = levelOf(total);
  const dims = p.data?.scoresByDimension ?? [];
  const badges: Badge[] = b.data?.items ?? [];
  const txPages = txQ.data?.pages ?? [];
  const txItems = txPages.flatMap((pg) => pg.items);

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
            文化护照
          </span>
          <motion.button
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
              color: 'var(--cpm-text-secondary)',
            }}
          >
            分享
          </motion.button>
        </div>

        {/* Hero 卡 */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            position: 'relative',
            borderRadius: 24,
            padding: 22,
            background: 'linear-gradient(135deg, #fef3ff 0%, #f0e9ff 40%, #e0f2fe 100%)',
            border: '1px solid rgba(255,255,255,0.6)',
            boxShadow: 'var(--cpm-shadow-pop)',
            overflow: 'hidden',
          }}
        >
          <div
            aria-hidden
            style={{
              position: 'absolute',
              right: -50,
              top: -50,
              width: 220,
              height: 220,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(167,139,250,0.4), transparent 70%)',
              filter: 'blur(24px)',
            }}
          />
          <div style={{ position: 'relative' }}>
            {/* 头像 + 等级 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 18,
                  background: 'linear-gradient(135deg, #c4b5fd, #fda4af)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                  fontWeight: 700,
                  color: '#fff',
                  boxShadow: '0 8px 20px -4px rgba(124,58,237,0.4)',
                  flexShrink: 0,
                }}
              >
                {name.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--cpm-text-primary)' }}>
                    {name}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      padding: '2px 9px',
                      borderRadius: 999,
                      background: `${lv.color}1A`,
                      color: lv.color,
                      fontWeight: 600,
                      letterSpacing: '0.06em',
                    }}
                  >
                    {lv.tier} · {lv.name}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--cpm-text-tertiary)', marginTop: 3 }}>
                  文化价值观可观测指标
                </div>
              </div>
            </div>

            {/* 总分 + 统计 */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 0, marginTop: 18 }}>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 11,
                    color: 'var(--cpm-text-tertiary)',
                    letterSpacing: '0.12em',
                    fontWeight: 600,
                  }}
                >
                  TOTAL POINTS
                </div>
                <div
                  style={{
                    fontSize: 40,
                    fontWeight: 700,
                    color: 'var(--cpm-text-primary)',
                    letterSpacing: '-0.03em',
                    lineHeight: 1.05,
                    fontFeatureSettings: '"tnum"',
                  }}
                >
                  {p.isLoading ? '···' : total.toLocaleString()}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: 700,
                      color: 'var(--cpm-text-primary)',
                      fontFeatureSettings: '"tnum"',
                    }}
                  >
                    {p.isLoading ? '-' : p.data?.badgeCount ?? 0}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--cpm-text-tertiary)' }}>徽章</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: 700,
                      color: 'var(--cpm-text-primary)',
                      fontFeatureSettings: '"tnum"',
                    }}
                  >
                    {p.isLoading ? '-' : dims.filter((d) => d.totalScore > 0).length}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--cpm-text-tertiary)' }}>维度</div>
                </div>
              </div>
            </div>

            {/* 维度迷你条 */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(6, 1fr)',
                gap: 5,
                marginTop: 16,
              }}
            >
              {dims.length === 0
                ? Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      style={{ height: 4, borderRadius: 2, background: 'rgba(15,23,42,0.08)' }}
                    />
                  ))
                : dims.map((d) => {
                    const maxDim = Math.max(...dims.map((x) => x.totalScore), 1);
                    const pct = Math.max(8, (d.totalScore / maxDim) * 100);
                    return (
                      <div
                        key={d.dimensionCode}
                        title={`${d.dimensionName} ${d.totalScore}`}
                        style={{
                          height: 4,
                          borderRadius: 2,
                          background: 'rgba(15,23,42,0.07)',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${pct}%`,
                            background: dimColor[d.dimensionCode] ?? '#7c3aed',
                            borderRadius: 2,
                          }}
                        />
                      </div>
                    );
                  })}
            </div>
          </div>
        </motion.section>

        {/* Tab 切换 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          style={{
            display: 'flex',
            gap: 6,
            marginTop: 16,
            background: '#fff',
            borderRadius: 14,
            padding: 4,
            border: '1px solid var(--cpm-card-border)',
            boxShadow: 'var(--cpm-shadow-soft)',
          }}
        >
          {tabLabels.map((t) => (
            <motion.button
              key={t.key}
              onClick={() => setView(t.key)}
              whileTap={{ scale: 0.94 }}
              style={{
                flex: 1,
                padding: '8px 4px',
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 600,
                fontFamily: 'var(--cpm-font-sans)',
                cursor: 'pointer',
                border: 'none',
                background:
                  view === t.key
                    ? 'linear-gradient(135deg, var(--cpm-brand-violet), var(--cpm-brand-cyan))'
                    : 'transparent',
                color: view === t.key ? '#fff' : 'var(--cpm-text-tertiary)',
                transition: 'all 0.2s ease',
              }}
            >
              {t.label}
            </motion.button>
          ))}
        </motion.div>

        {/* 雷达 Tab */}
        {view === 'radar' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            style={{
              marginTop: 12,
              background: '#fff',
              borderRadius: 24,
              padding: 20,
              border: '1px solid var(--cpm-card-border)',
              boxShadow: 'var(--cpm-shadow-soft)',
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.12em',
                color: 'var(--cpm-text-tertiary)',
                marginBottom: 14,
              }}
            >
              VALUE DISTRIBUTION
            </div>
            {p.data && (
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <PassportRadar scoresByDimension={p.data.scoresByDimension} />
              </div>
            )}
            {/* 6 维度图例 */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 6,
                marginTop: 16,
              }}
            >
              {dims.map((d) => (
                <span
                  key={d.dimensionCode}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '4px 10px',
                    borderRadius: 999,
                    background: `${dimColor[d.dimensionCode] ?? '#7c3aed'}15`,
                    fontSize: 12,
                    fontWeight: 500,
                    color: dimColor[d.dimensionCode] ?? '#7c3aed',
                  }}
                >
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      background: dimColor[d.dimensionCode] ?? '#7c3aed',
                      flexShrink: 0,
                    }}
                  />
                  {d.dimensionName}
                  <span style={{ fontFeatureSettings: '"tnum"', fontWeight: 700 }}>
                    {d.totalScore}
                  </span>
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* 徽章 Tab */}
        {view === 'badges' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            style={{ marginTop: 12 }}
          >
            {b.isLoading && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '40px 0',
                  color: 'var(--cpm-text-tertiary)',
                  fontSize: 14,
                }}
              >
                加载中...
              </div>
            )}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 10,
              }}
            >
              {badges.map((badge, i) => {
                const rc = rarityConfig[badge.rarity] ?? rarityConfig.common;
                return (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.04, type: 'spring', stiffness: 200 }}
                    whileTap={{ scale: 0.92 }}
                    style={{
                      background: badge.earned ? '#fff' : 'rgba(15,23,42,0.04)',
                      borderRadius: 16,
                      border: `1px solid ${badge.earned ? 'var(--cpm-card-border)' : 'transparent'}`,
                      boxShadow: badge.earned ? 'var(--cpm-shadow-soft)' : 'none',
                      padding: '12px 8px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 5,
                      filter: badge.earned ? 'none' : 'grayscale(1) opacity(0.4)',
                    }}
                  >
                    {badge.iconUrl ? (
                      <img
                        src={badge.iconUrl}
                        alt={badge.name}
                        style={{ width: 40, height: 40, objectFit: 'contain' }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 12,
                          background: `${dimColor[badge.dimensionCode] ?? '#7c3aed'}20`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 20,
                        }}
                      >
                        ✦
                      </div>
                    )}
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 500,
                        color: 'var(--cpm-text-primary)',
                        textAlign: 'center',
                        lineHeight: 1.3,
                      }}
                    >
                      {badge.name}
                    </div>
                    <span
                      style={{
                        fontSize: 10,
                        padding: '2px 7px',
                        borderRadius: 999,
                        background: rc.bg,
                        color: rc.color,
                        fontWeight: 600,
                      }}
                    >
                      {rc.label}
                    </span>
                    {badge.earned && badge.earnedAt && (
                      <div style={{ fontSize: 10, color: 'var(--cpm-text-muted)' }}>
                        {badge.earnedAt.slice(0, 10)}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
            {badges.length === 0 && !b.isLoading && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '60px 0',
                  color: 'var(--cpm-text-muted)',
                  fontSize: 14,
                }}
              >
                还没有徽章，快去完成活动吧
              </div>
            )}
          </motion.div>
        )}

        {/* 流水 Tab */}
        {view === 'tx' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}
          >
            {txQ.isLoading && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '40px 0',
                  color: 'var(--cpm-text-tertiary)',
                  fontSize: 14,
                }}
              >
                加载中...
              </div>
            )}
            {txItems.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ x: 24, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: Math.min(i, 12) * 0.04 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  background: '#fff',
                  borderRadius: 16,
                  border: '1px solid var(--cpm-card-border)',
                  boxShadow: 'var(--cpm-shadow-soft)',
                  padding: '12px 14px',
                }}
              >
                {/* 维度色条 */}
                <div
                  style={{
                    width: 4,
                    height: 44,
                    borderRadius: 2,
                    background: dimColor[t.dimensionCode] ?? '#7c3aed',
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: 'var(--cpm-text-primary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {t.reason || '加分'}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--cpm-text-tertiary)', marginTop: 2 }}>
                    {t.createdAt}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                    fontFeatureSettings: '"tnum"',
                    color: t.amount > 0 ? 'var(--cpm-success)' : 'var(--cpm-danger)',
                  }}
                >
                  {t.amount > 0 ? `+${t.amount}` : t.amount}
                </div>
              </motion.div>
            ))}
            {txItems.length === 0 && !txQ.isLoading && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '60px 0',
                  color: 'var(--cpm-text-muted)',
                  fontSize: 14,
                }}
              >
                还没有积分流水
              </div>
            )}
          </motion.div>
        )}
      </main>
    </AuroraBg>
  );
}
