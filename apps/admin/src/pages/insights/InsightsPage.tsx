import axios from 'axios';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { PageHeader, StatTile } from '@cpm/ui';

interface Entry {
  rank: number;
  userId: number;
  name: string;
  avatarUrl: string;
  deptName: string;
  score: number;
}

interface LbResp {
  entries: Entry[] | null;
  total: number;
}

interface Dim {
  id: number;
  code: string;
  name: string;
}

const colorByCode: Record<string, string> = {
  customer_first: '#f97316',
  candor: '#0ea5e9',
  innovation: '#ec4899',
  ownership: '#10b981',
};

const bgByCode: Record<string, string> = {
  customer_first: 'rgba(249,115,22,0.1)',
  candor: 'rgba(14,165,233,0.1)',
  innovation: 'rgba(236,72,153,0.1)',
  ownership: 'rgba(16,185,129,0.1)',
};

type Window = 'week' | 'month' | 'quarter' | 'year';

const windowLabel: Record<Window, string> = {
  week: '本周',
  month: '本月',
  quarter: '本季',
  year: '本年',
};

export function InsightsPage() {
  const [dims, setDims] = useState<Dim[]>([]);
  const [dimTotals, setDimTotals] = useState<Record<number, number>>({});
  const [totalEntries, setTotalEntries] = useState(0);
  const [totalSum, setTotalSum] = useState(0);
  const [topEntries, setTopEntries] = useState<Entry[]>([]);
  const [activeWindow, setActiveWindow] = useState<Window>('month');

  useEffect(() => {
    const token = localStorage.getItem('cpm_admin_jwt');
    const headers = { Authorization: `Bearer ${token}` };

    // 总榜
    axios.get<LbResp>('/api/v1/leaderboard?scope=total', { headers }).then((r) => {
      setTotalEntries(r.data.total);
      const entries = r.data.entries ?? [];
      setTopEntries(entries.slice(0, 5));
      setTotalSum(entries.reduce((s, e) => s + e.score, 0));
    }).catch(() => {});

    // 维度分榜
    axios
      .get<{ items: Dim[] }>('/api/v1/values/dimensions', { headers })
      .then(async (r) => {
        setDims(r.data.items);
        const totals: Record<number, number> = {};
        for (const d of r.data.items) {
          try {
            const lb = await axios.get<LbResp>(
              `/api/v1/leaderboard?scope=dim&dimension_id=${d.id}`,
              { headers },
            );
            totals[d.id] = (lb.data.entries ?? []).reduce((s, e) => s + e.score, 0);
          } catch {
            totals[d.id] = 0;
          }
        }
        setDimTotals(totals);
        setTotalSum(Object.values(totals).reduce((s, n) => s + n, 0));
      })
      .catch(() => {});
  }, []);

  const avg = totalEntries > 0 ? Math.round(totalSum / totalEntries) : 0;
  const maxDim = Math.max(...Object.values(dimTotals), 1);

  return (
    <div>
      <PageHeader
        title="数据洞察"
        subtitle="企业文化运营全貌"
        action={
          <div style={{ display: 'flex', gap: 4 }}>
            {(Object.keys(windowLabel) as Window[]).map((w) => (
              <motion.button
                key={w}
                type="button"
                onClick={() => setActiveWindow(w)}
                whileTap={{ scale: 0.94 }}
                style={{
                  padding: '5px 12px',
                  borderRadius: 8,
                  border: '1px solid',
                  borderColor: activeWindow === w ? 'var(--cpm-brand-violet)' : 'var(--cpm-card-border)',
                  background: activeWindow === w ? 'var(--cpm-brand-violet-bg)' : 'transparent',
                  color: activeWindow === w ? 'var(--cpm-brand-violet)' : 'var(--cpm-text-tertiary)',
                  fontSize: 12,
                  fontWeight: activeWindow === w ? 600 : 500,
                  cursor: 'pointer',
                  fontFamily: 'var(--cpm-font-sans)',
                  transition: 'all 0.15s',
                }}
              >
                {windowLabel[w]}
              </motion.button>
            ))}
          </div>
        }
      />

      {/* StatTile 横排 4 个 */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16,
          marginBottom: 24,
        }}
      >
        {[
          { label: '参与人数', value: totalEntries, icon: '✦', tint: 'var(--cpm-brand-violet)', bg: 'var(--cpm-brand-violet-bg)' },
          { label: '积分总量', value: totalSum, icon: '⌬', tint: 'var(--cpm-brand-cyan)', bg: 'var(--cpm-brand-cyan-bg)' },
          { label: '人均积分', value: avg, icon: '◐', tint: 'var(--cpm-dim-innovation)', bg: 'rgba(236,72,153,0.1)' },
          { label: '活跃维度', value: dims.filter((d) => (dimTotals[d.id] ?? 0) > 0).length, icon: '✧', tint: 'var(--cpm-dim-growth)', bg: 'rgba(234,179,8,0.1)', suffix: `/ ${dims.length}` },
        ].map((s) => (
          <motion.div
            key={s.label}
            variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
          >
            <StatTile
              label={s.label}
              value={s.value}
              icon={s.icon}
              tint={s.tint}
              bg={s.bg}
              suffix={s.suffix}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* 双列 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* 左：维度分布条形图 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.25 }}
          style={{
            background: '#fff',
            border: '1px solid var(--cpm-card-border)',
            borderRadius: 20,
            padding: 24,
            boxShadow: 'var(--cpm-shadow-soft)',
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--cpm-text-tertiary)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: 18,
            }}
          >
            DIMENSION DISTRIBUTION
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {dims.map((d, i) => {
              const v = dimTotals[d.id] ?? 0;
              const pct = (v / maxDim) * 100;
              const color = colorByCode[d.code] ?? '#7c3aed';
              const bg = bgByCode[d.code] ?? 'rgba(124,58,237,0.1)';
              const totalNonZero = Object.values(dimTotals).reduce((s, n) => s + n, 0);
              const sharePct = totalNonZero > 0 ? Math.round((v / totalNonZero) * 100) : 0;

              return (
                <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 9,
                      background: bg,
                      color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 13,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {d.name.charAt(0)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--cpm-text-secondary)' }}>
                        {d.name}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 11, color, fontWeight: 600 }}>
                          {sharePct}%
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 700, color, fontFeatureSettings: '"tnum"' }}>
                          {v.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div
                      style={{
                        height: 8,
                        borderRadius: 4,
                        background: 'rgba(15,23,42,0.05)',
                        overflow: 'hidden',
                      }}
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.7, delay: 0.3 + i * 0.06, ease: 'easeOut' }}
                        style={{
                          height: '100%',
                          background: color,
                          borderRadius: 4,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 14, fontSize: 11, color: 'var(--cpm-text-muted)' }}>
            基于 user_dimension_scores 实时聚合 · 最长条 = 最热维度
          </div>
        </motion.div>

        {/* 右：Top 5 员工 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.35 }}
          style={{
            background: '#fff',
            border: '1px solid var(--cpm-card-border)',
            borderRadius: 20,
            padding: 24,
            boxShadow: 'var(--cpm-shadow-soft)',
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--cpm-text-tertiary)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: 18,
            }}
          >
            TOP CONTRIBUTORS
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {topEntries.length === 0 && (
              <div style={{ fontSize: 13, color: 'var(--cpm-text-muted)', padding: '12px 0' }}>
                暂无排行数据
              </div>
            )}
            {topEntries.map((e, i) => {
              const rankColors = ['#f59e0b', '#94a3b8', '#b45309', '#7c3aed', '#0891b2'];
              const rankColor = rankColors[i] ?? 'var(--cpm-text-muted)';

              return (
                <motion.div
                  key={e.userId}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.06 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 12px',
                    borderRadius: 12,
                    background: i === 0 ? 'rgba(245,158,11,0.06)' : 'var(--cpm-bg-0)',
                  }}
                >
                  {/* 排名 */}
                  <span
                    style={{
                      width: 24,
                      textAlign: 'center',
                      fontSize: 13,
                      fontWeight: 700,
                      color: rankColor,
                      flexShrink: 0,
                      fontFeatureSettings: '"tnum"',
                    }}
                  >
                    #{i + 1}
                  </span>

                  {/* 头像 */}
                  {e.avatarUrl ? (
                    <img
                      src={e.avatarUrl}
                      alt={e.name}
                      style={{ width: 32, height: 32, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 10,
                        background: `${rankColor}22`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 13,
                        fontWeight: 700,
                        color: rankColor,
                        flexShrink: 0,
                      }}
                    >
                      {e.name.charAt(0)}
                    </div>
                  )}

                  {/* 名字 */}
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
                    {e.deptName && (
                      <div style={{ fontSize: 11, color: 'var(--cpm-text-muted)' }}>{e.deptName}</div>
                    )}
                  </div>

                  {/* 分数 */}
                  <span
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: rankColor,
                      fontFeatureSettings: '"tnum"',
                      flexShrink: 0,
                    }}
                  >
                    {e.score.toLocaleString()}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
