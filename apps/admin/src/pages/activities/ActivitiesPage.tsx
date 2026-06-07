import axios from 'axios';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader, Button, EmptyState } from '@cpm/ui';

interface Activity {
  ID: number;
  TenantID: number;
  DimensionID: number;
  Title: string;
  Status: string;
  Capacity: number | null;
  StartAt: string | null;
  EndAt: string | null;
  PointsReward: number;
  CreatedAt: string;
}

interface Dimension {
  id: number;
  code: string;
  name: string;
}

const statusColor: Record<string, string> = {
  draft: '#d97706',
  published: '#0891b2',
  running: '#10b981',
  closed: '#94a3b8',
};

const statusBg: Record<string, string> = {
  draft: 'rgba(217,119,6,0.1)',
  published: 'rgba(8,145,178,0.1)',
  running: 'rgba(16,185,129,0.1)',
  closed: 'rgba(148,163,184,0.1)',
};

const statusLabel: Record<string, string> = {
  draft: '草稿',
  published: '已发布',
  running: '进行中',
  closed: '已结束',
};

const dimColor: Record<string, string> = {
  customer_first: '#f97316',
  candor: '#0ea5e9',
  innovation: '#ec4899',
  ownership: '#10b981',
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
  visible: { transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.38 } },
};

export function ActivitiesPage() {
  const [rows, setRows] = useState<Activity[]>([]);
  const [dims, setDims] = useState<Dimension[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('cpm_admin_jwt');
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      axios.get<{ items: Activity[] | null }>('/api/v1/activities', { headers }),
      axios.get<{ items: Dimension[] }>('/api/v1/values/dimensions', { headers }),
    ])
      .then(([a, d]) => {
        setRows(a.data.items ?? []);
        setDims(d.data.items);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const dimByID = (id: number) => dims.find((d) => d.id === id);

  return (
    <div>
      <PageHeader
        title="活动管理"
        badge="通过 HR-Agent /chat 创建"
      />

      {loading && (
        <div style={{ color: 'var(--cpm-text-tertiary)', fontSize: 14, padding: '16px 0' }}>
          加载中...
        </div>
      )}

      {!loading && rows.length === 0 && (
        <EmptyState
          icon="◐"
          title="还没有活动"
          description="去 HR-Agent 用自然语言发布一场活动，例如「下周五下午 3 点举办团队分享会，奖励 50 分」"
          action={
            <Link to="/chat" style={{ textDecoration: 'none' }}>
              <Button tone="primary">去 HR-Agent 创建 →</Button>
            </Link>
          }
        />
      )}

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
      >
        {rows.map((a) => {
          const dim = dimByID(a.DimensionID);
          const color = dimColor[dim?.code ?? ''] ?? '#7c3aed';
          const sColor = statusColor[a.Status] ?? '#94a3b8';
          const sBg = statusBg[a.Status] ?? 'rgba(148,163,184,0.1)';

          return (
            <motion.div
              key={a.ID}
              variants={itemVariants}
              whileHover={{ y: -2 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 0,
                background: '#fff',
                border: '1px solid var(--cpm-card-border)',
                borderRadius: 18,
                boxShadow: 'var(--cpm-shadow-soft)',
                overflow: 'hidden',
              }}
            >
              {/* 左侧维度色条 */}
              <div
                style={{
                  width: 4,
                  alignSelf: 'stretch',
                  background: color,
                  flexShrink: 0,
                }}
              />

              {/* 内容 */}
              <div
                style={{
                  flex: 1,
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  minWidth: 0,
                }}
              >
                {/* 标题区 */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: 16,
                        fontWeight: 600,
                        color: 'var(--cpm-text-primary)',
                        letterSpacing: '-0.01em',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {a.Title}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        padding: '3px 9px',
                        borderRadius: 999,
                        background: sBg,
                        color: sColor,
                        flexShrink: 0,
                      }}
                    >
                      {statusLabel[a.Status] ?? a.Status}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 7, flexWrap: 'wrap' }}>
                    {dim && (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: 999,
                          background: `${color}18`,
                          color,
                        }}
                      >
                        {dim.name}
                      </span>
                    )}
                    <span style={{ fontSize: 12, color: 'var(--cpm-text-tertiary)' }}>
                      奖励 {a.PointsReward} 分
                    </span>
                    {a.Capacity != null && (
                      <span style={{ fontSize: 12, color: 'var(--cpm-text-tertiary)' }}>
                        上限 {a.Capacity} 人
                      </span>
                    )}
                    <span style={{ fontSize: 12, color: 'var(--cpm-text-muted)' }}>
                      {relTime(a.CreatedAt)}
                    </span>
                  </div>
                </div>

                {/* 右侧操作 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                  <Link to={`/activities/${a.ID}/code`} style={{ textDecoration: 'none' }}>
                    <Button tone="primary" size="sm">签到二维码</Button>
                  </Link>
                  <button
                    type="button"
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      border: '1px solid var(--cpm-card-border)',
                      background: 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 16,
                      color: 'var(--cpm-text-tertiary)',
                      cursor: 'pointer',
                    }}
                  >
                    ⋯
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
