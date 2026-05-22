import axios from 'axios';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, StatTile, Button } from '@cpm/ui';
import { useAuth } from '../../store/auth';

interface LbEntry {
  rank: number;
  userId: number;
  name: string;
  score: number;
}

interface LbResp {
  entries: LbEntry[] | null;
  total: number;
  totalScore?: number;
}

interface Activity {
  ID: number;
  Title: string;
  Status: string;
  DimensionID: number;
  PointsReward: number;
  CreatedAt: string;
}

interface Dim {
  id: number;
  code: string;
  name: string;
}

const colorByCode: Record<string, string> = {
  customer_first: '#f97316',
  team_collab: '#0ea5e9',
  innovation: '#ec4899',
  integrity: '#10b981',
  craftsmanship: '#8b5cf6',
  growth: '#eab308',
};

const bgByCode: Record<string, string> = {
  customer_first: 'rgba(249,115,22,0.1)',
  team_collab: 'rgba(14,165,233,0.1)',
  innovation: 'rgba(236,72,153,0.1)',
  integrity: 'rgba(16,185,129,0.1)',
  craftsmanship: 'rgba(139,92,246,0.1)',
  growth: 'rgba(234,179,8,0.1)',
};

const statusLabel: Record<string, string> = {
  draft: '草稿',
  published: '已发布',
  running: '进行中',
  closed: '已结束',
};

const statusColor: Record<string, string> = {
  draft: '#d97706',
  published: '#0891b2',
  running: '#10b981',
  closed: '#94a3b8',
};

function relTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return '今天';
  if (days === 1) return '昨天';
  return `${days} 天前`;
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function AdminHomePage() {
  const { name } = useAuth();
  const navigate = useNavigate();
  const [totalEntries, setTotalEntries] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [activityCount, setActivityCount] = useState(0);
  const [badgeCount] = useState(0);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [dims, setDims] = useState<Dim[]>([]);
  const [dimTotals, setDimTotals] = useState<Record<number, number>>({});

  useEffect(() => {
    const token = localStorage.getItem('cpm_admin_jwt');
    const h = { Authorization: `Bearer ${token}` };

    // 总体排行榜
    axios
      .get<LbResp>('/api/v1/leaderboard?scope=total', { headers: h })
      .then((r) => {
        setTotalEntries(r.data.total);
        const sumScore = (r.data.entries ?? []).reduce((s, e) => s + e.score, 0);
        setTotalScore(r.data.totalScore ?? sumScore);
      })
      .catch(() => {});

    // 活动
    axios
      .get<{ items: Activity[] | null }>('/api/v1/activities', { headers: h })
      .then((r) => {
        const list = r.data.items ?? [];
        setActivityCount(list.length);
        setRecentActivities(list.slice(0, 5));
      })
      .catch(() => {});

    // 维度 + 每维度积分
    axios
      .get<{ items: Dim[] }>('/api/v1/values/dimensions', { headers: h })
      .then(async (r) => {
        setDims(r.data.items);
        const totals: Record<number, number> = {};
        for (const d of r.data.items) {
          try {
            const lb = await axios.get<LbResp>(
              `/api/v1/leaderboard?scope=dim&dimension_id=${d.id}`,
              { headers: h },
            );
            totals[d.id] = (lb.data.entries ?? []).reduce((s, e) => s + e.score, 0);
          } catch {
            totals[d.id] = 0;
          }
        }
        setDimTotals(totals);
      })
      .catch(() => {});
  }, []);

  const maxDim = Math.max(...Object.values(dimTotals), 1);

  return (
    <div>
      <PageHeader
        title={`欢迎回来，${name ?? '管理员'}`}
        subtitle="CPM 运营数据概览"
      />

      {/* StatTile 横排 */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <motion.div variants={itemVariants}>
          <StatTile
            label="参与人数"
            value={totalEntries}
            icon="✦"
            tint="var(--cpm-brand-violet)"
            bg="var(--cpm-brand-violet-bg)"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatTile
            label="积分总量"
            value={totalScore}
            icon="⌬"
            tint="var(--cpm-brand-cyan)"
            bg="var(--cpm-brand-cyan-bg)"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatTile
            label="活动数"
            value={activityCount}
            icon="◐"
            tint="var(--cpm-dim-innovation)"
            bg="rgba(236,72,153,0.1)"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatTile
            label="徽章颁发"
            value={badgeCount}
            icon="✧"
            tint="var(--cpm-dim-growth)"
            bg="rgba(234,179,8,0.1)"
          />
        </motion.div>
      </motion.div>

      {/* 双列 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 20,
          marginBottom: 24,
        }}
      >
        {/* 左：最近活动 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2 }}
          style={{
            background: '#fff',
            border: '1px solid var(--cpm-card-border)',
            borderRadius: 20,
            padding: 20,
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
              marginBottom: 14,
            }}
          >
            RECENT ACTIVITIES
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {recentActivities.length === 0 && (
              <div style={{ fontSize: 13, color: 'var(--cpm-text-muted)', padding: '12px 0' }}>
                暂无活动记录
              </div>
            )}
            {recentActivities.map((a) => (
              <motion.div
                key={a.ID}
                whileHover={{ x: 3 }}
                transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 12px',
                  borderRadius: 12,
                  background: 'var(--cpm-bg-0)',
                  cursor: 'pointer',
                }}
                onClick={() => navigate('/activities')}
              >
                <div
                  style={{
                    width: 4,
                    height: 36,
                    borderRadius: 2,
                    background: colorByCode[dims.find((d) => d.id === a.DimensionID)?.code ?? ''] ?? 'var(--cpm-brand-violet)',
                    flexShrink: 0,
                  }}
                />
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
                    {a.Title}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--cpm-text-tertiary)', marginTop: 2 }}>
                    {relTime(a.CreatedAt)} · {a.PointsReward} 分
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '3px 8px',
                    borderRadius: 999,
                    background: `${statusColor[a.Status] ?? '#94a3b8'}18`,
                    color: statusColor[a.Status] ?? '#94a3b8',
                    flexShrink: 0,
                  }}
                >
                  {statusLabel[a.Status] ?? a.Status}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* 右：维度热度条形图 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.3 }}
          style={{
            background: '#fff',
            border: '1px solid var(--cpm-card-border)',
            borderRadius: 20,
            padding: 20,
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
              marginBottom: 14,
            }}
          >
            DIMENSION HEAT
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {dims.map((d) => {
              const v = dimTotals[d.id] ?? 0;
              const pct = (v / maxDim) * 100;
              const color = colorByCode[d.code] ?? '#7c3aed';
              const bg = bgByCode[d.code] ?? 'rgba(124,58,237,0.1)';
              return (
                <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: bg,
                      color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 13,
                      fontWeight: 600,
                      flexShrink: 0,
                    }}
                  >
                    {d.name.charAt(0)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 4,
                      }}
                    >
                      <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--cpm-text-secondary)' }}>
                        {d.name}
                      </span>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color,
                          fontFeatureSettings: '"tnum"',
                        }}
                      >
                        {v.toLocaleString()}
                      </span>
                    </div>
                    <div
                      style={{
                        height: 6,
                        borderRadius: 3,
                        background: 'rgba(15,23,42,0.05)',
                        overflow: 'hidden',
                      }}
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.4 + dims.indexOf(d) * 0.06, ease: 'easeOut' }}
                        style={{
                          height: '100%',
                          background: color,
                          borderRadius: 3,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* 底部快捷操作 */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.4 } } }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
        }}
      >
        {[
          {
            icon: '⚡',
            label: '去 HR-Agent',
            desc: '用自然语言创建活动、发放积分',
            tint: '#7c3aed',
            bg: 'linear-gradient(135deg, #fef3ff 0%, #f0e9ff 100%)',
            to: '/chat',
          },
          {
            icon: '✧',
            label: '维度配置',
            desc: '查看 6 大企业文化价值观维度',
            tint: '#0891b2',
            bg: 'linear-gradient(135deg, #ecfeff 0%, #dbeafe 100%)',
            to: '/values',
          },
          {
            icon: '⊕',
            label: '钉钉推送',
            desc: '查看模拟推送时间线',
            tint: '#10b981',
            bg: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            to: '/dingtalk/mock-outbox',
          },
        ].map((it) => (
          <motion.div
            key={it.to}
            variants={itemVariants}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 350, damping: 22 }}
            onClick={() => navigate(it.to)}
            style={{
              background: it.bg,
              border: '1px solid var(--cpm-card-border)',
              borderRadius: 18,
              padding: '20px 20px 18px',
              boxShadow: 'var(--cpm-shadow-soft)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 13,
                background: `${it.tint}18`,
                color: it.tint,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                fontWeight: 600,
              }}
            >
              {it.icon}
            </div>
            <div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: 'var(--cpm-text-primary)',
                  letterSpacing: '-0.01em',
                  marginBottom: 4,
                }}
              >
                {it.label}
              </div>
              <div style={{ fontSize: 12, color: 'var(--cpm-text-tertiary)', lineHeight: 1.5 }}>
                {it.desc}
              </div>
            </div>
            <div style={{ marginTop: 'auto' }}>
              <Button tone="ghost" size="sm" style={{ padding: '4px 0', color: it.tint, fontSize: 12 }}>
                前往 →
              </Button>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
