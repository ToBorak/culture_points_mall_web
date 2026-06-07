import { PageHeader } from '@cpm/ui';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Dim {
  id: number;
  code: string;
  name: string;
  description?: string;
  keywords?: string[] | string;
}

function parseKeywords(kw: string[] | string | undefined): string[] | undefined {
  if (!kw) return undefined;
  if (Array.isArray(kw)) return kw;
  return kw
    .split(/[,，]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

interface LbResp {
  entries: { score: number }[] | null;
  total: number;
}

const colorByCode: Record<string, string> = {
  customer_first: '#f97316',
  candor: '#0ea5e9',
  ownership: '#10b981',
  innovation: '#ec4899',
};

const bgByCode: Record<string, string> = {
  customer_first: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)',
  candor: 'linear-gradient(135deg, #ecfeff 0%, #bae6fd 100%)',
  ownership: 'linear-gradient(135deg, #f0fdf4 0%, #bbf7d0 100%)',
  innovation: 'linear-gradient(135deg, #fdf2f8 0%, #fbcfe8 100%)',
};

const keywordsByCode: Record<string, string[]> = {
  customer_first: ['客户优先', '服务思维', '用户洞察', '同理心'],
  candor: ['开诚布公', '就事论事', '直面问题', '互信坦率'],
  ownership: ['主人翁意识', '担当负责', '结果导向', '主动补位'],
  innovation: ['突破常规', '拥抱变化', '敢于试错', '设计思维'],
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
            const lb = await axios.get<LbResp>(`/api/v1/leaderboard?scope=dim&dimension_id=${d.id}`, { headers: h });
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
      <PageHeader title="价值观维度" subtitle="4 大企业文化核心方向" />

      {loading && <div style={{ color: 'var(--cpm-text-tertiary)', fontSize: 14, padding: '20px 0' }}>加载中...</div>}

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: 20,
        }}
      >
        {dims.map((d) => {
          const color = colorByCode[d.code] ?? '#7c3aed';
          const bgGrad = bgByCode[d.code] ?? 'linear-gradient(135deg, #f9f7ff, #f0e9ff)';
          const keywords = parseKeywords(d.keywords) ?? keywordsByCode[d.code] ?? [];
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
                borderRadius: 22,
                padding: 24,
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
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      background: color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 22,
                      color: '#fff',
                      fontWeight: 700,
                      boxShadow: `0 6px 16px -4px ${color}70`,
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
                    fontSize: 20,
                    fontWeight: 700,
                    color: 'var(--cpm-text-primary)',
                    letterSpacing: '-0.01em',
                    marginBottom: 14,
                  }}
                >
                  {d.name}
                </div>

                {/* 关键词（左）｜ 累计积分（右） */}
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16 }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, flex: 1, minWidth: 0 }}>
                    {keywords.map((kw) => (
                      <span
                        key={kw}
                        style={{
                          fontSize: 11,
                          fontWeight: 500,
                          padding: '4px 10px',
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
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div
                      style={{
                        fontSize: 36,
                        fontWeight: 800,
                        color,
                        letterSpacing: '-0.02em',
                        lineHeight: 1.05,
                        fontFeatureSettings: '"tnum"',
                      }}
                    >
                      {score.toLocaleString()}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--cpm-text-tertiary)', fontWeight: 500, marginTop: 3 }}>
                      累计积分
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
