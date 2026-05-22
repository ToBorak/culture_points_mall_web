import axios from 'axios';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { PageHeader } from '@cpm/ui';

interface Dim {
  id: number;
  code: string;
  name: string;
  description?: string;
  keywords?: string[];
}

interface LbResp {
  entries: { score: number }[] | null;
  total: number;
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
  customer_first: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)',
  team_collab: 'linear-gradient(135deg, #ecfeff 0%, #bae6fd 100%)',
  innovation: 'linear-gradient(135deg, #fdf2f8 0%, #fbcfe8 100%)',
  integrity: 'linear-gradient(135deg, #f0fdf4 0%, #bbf7d0 100%)',
  craftsmanship: 'linear-gradient(135deg, #faf5ff 0%, #e9d5ff 100%)',
  growth: 'linear-gradient(135deg, #fefce8 0%, #fef08a 100%)',
};

const keywordsByCode: Record<string, string[]> = {
  customer_first: ['客户优先', '服务思维', '用户洞察', '同理心'],
  team_collab: ['团队协作', '开放沟通', '互信互助', '跨职能'],
  innovation: ['创新突破', '拥抱变化', '敢于试错', '设计思维'],
  integrity: ['诚信透明', '言行一致', '专业负责', '伦理底线'],
  craftsmanship: ['极致品质', '持续打磨', '工匠精神', '细节之美'],
  growth: ['持续学习', '成长心态', '知识分享', '开放反馈'],
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function ValuesPage() {
  const [dims, setDims] = useState<Dim[]>([]);
  const [dimScores, setDimScores] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('cpm_admin_jwt');
    const h = { Authorization: `Bearer ${token}` };
    axios
      .get<{ items: Dim[] }>('/api/v1/values/dimensions', { headers: h })
      .then(async (r) => {
        setDims(r.data.items);
        const scores: Record<number, number> = {};
        for (const d of r.data.items) {
          try {
            const lb = await axios.get<LbResp>(
              `/api/v1/leaderboard?scope=dim&dimension_id=${d.id}`,
              { headers: h },
            );
            scores[d.id] = (lb.data.entries ?? []).reduce((s, e) => s + e.score, 0);
          } catch {
            scores[d.id] = 0;
          }
        }
        setDimScores(scores);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader title="价值观维度" subtitle="6 大企业文化核心方向" />

      {loading && (
        <div style={{ color: 'var(--cpm-text-tertiary)', fontSize: 14, padding: '20px 0' }}>
          加载中...
        </div>
      )}

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 18,
        }}
      >
        {dims.map((d) => {
          const color = colorByCode[d.code] ?? '#7c3aed';
          const bgGrad = bgByCode[d.code] ?? 'linear-gradient(135deg, #f9f7ff, #f0e9ff)';
          const keywords = d.keywords ?? keywordsByCode[d.code] ?? [];
          const score = dimScores[d.id] ?? 0;

          return (
            <motion.div
              key={d.id}
              variants={cardVariants}
              whileHover={{ y: -4, boxShadow: `0 20px 40px -12px ${color}40` }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              style={{
                background: bgGrad,
                border: '1px solid var(--cpm-card-border)',
                borderRadius: 20,
                padding: 20,
                boxShadow: 'var(--cpm-shadow-soft)',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              {/* 装饰光斑 */}
              <div
                aria-hidden
                style={{
                  position: 'absolute',
                  right: -30,
                  bottom: -30,
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${color}30 0%, transparent 70%)`,
                  filter: 'blur(20px)',
                  pointerEvents: 'none',
                }}
              />
              <div style={{ position: 'relative' }}>
                {/* 顶部彩色方块 + code */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 14,
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 20,
                      color: '#fff',
                      fontWeight: 700,
                      boxShadow: `0 4px 12px -4px ${color}60`,
                    }}
                  >
                    {d.name.charAt(0)}
                  </div>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: '0.1em',
                      color: `${color}`,
                      background: `${color}18`,
                      padding: '3px 8px',
                      borderRadius: 999,
                      fontFamily: 'monospace',
                    }}
                  >
                    {d.code.toUpperCase()}
                  </span>
                </div>

                {/* 维度名 */}
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: 'var(--cpm-text-primary)',
                    letterSpacing: '-0.01em',
                    marginBottom: 10,
                  }}
                >
                  {d.name}
                </div>

                {/* 关键词标签 */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                  {keywords.map((kw) => (
                    <span
                      key={kw}
                      style={{
                        fontSize: 11,
                        fontWeight: 500,
                        padding: '3px 9px',
                        borderRadius: 999,
                        background: `${color}14`,
                        color: 'var(--cpm-text-secondary)',
                        border: `1px solid ${color}28`,
                      }}
                    >
                      {kw}
                    </span>
                  ))}
                </div>

                {/* 累计积分 */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 6,
                    borderTop: '1px solid rgba(15,23,42,0.06)',
                    paddingTop: 12,
                    marginTop: 4,
                  }}
                >
                  <span
                    style={{
                      fontSize: 28,
                      fontWeight: 700,
                      color,
                      letterSpacing: '-0.02em',
                      fontFeatureSettings: '"tnum"',
                    }}
                  >
                    {score.toLocaleString()}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--cpm-text-tertiary)', fontWeight: 500 }}>
                    累计积分
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {!loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{
            marginTop: 20,
            padding: '12px 16px',
            borderRadius: 12,
            background: 'var(--cpm-brand-violet-bg)',
            border: '1px solid rgba(124,58,237,0.12)',
            fontSize: 12,
            color: 'var(--cpm-text-tertiary)',
          }}
        >
          ✧ 完整增删改功能在后续 Phase 上线。当前数据实时从 leaderboard API 聚合。
        </motion.div>
      )}
    </div>
  );
}
