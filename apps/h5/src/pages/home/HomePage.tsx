import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  AuroraBg,
  AiCoachCard,
  ChallengeCard,
  type AiCoachData,
  type ChallengeData,
  type ChallengeSubmitResult,
} from '@cpm/ui';

interface Passport {
  totalScore: number;
  badgeCount: number;
  scoresByDimension: { dimensionCode: string; dimensionName: string; totalScore: number }[];
}

const iconEntries = [
  { to: '/passport', label: '文化护照', icon: '✦', tint: '#7c3aed', bg: 'rgba(124,58,237,0.10)' },
  { to: '/leaderboard', label: '排行榜', icon: '⌬', tint: '#0891b2', bg: 'rgba(8,145,178,0.10)' },
  { to: '/mall', label: '积分商城', icon: '◈', tint: '#e11d48', bg: 'rgba(225,29,72,0.10)' },
  { to: '/activities', label: '活动中心', icon: '◐', tint: '#10b981', bg: 'rgba(16,185,129,0.10)' },
  { to: '/signin', label: '扫码签到', icon: '⊕', tint: '#d97706', bg: 'rgba(217,119,6,0.10)' },
  { to: '/profile', label: '我的', icon: '◉', tint: '#0f172a', bg: 'rgba(15,23,42,0.06)' },
];

const dimColor: Record<string, string> = {
  customer_first: '#f97316',
  team_collab: '#0ea5e9',
  innovation: '#ec4899',
  integrity: '#10b981',
  craftsmanship: '#8b5cf6',
  growth: '#eab308',
};

function levelOf(total: number) {
  if (total >= 1500) return { name: 'Legendary', tier: 'L4', color: '#7c3aed' };
  if (total >= 500) return { name: 'Epic', tier: 'L3', color: '#0891b2' };
  if (total >= 100) return { name: 'Rare', tier: 'L2', color: '#10b981' };
  return { name: 'Starter', tier: 'L1', color: '#d97706' };
}

export function HomePage() {
  const name = localStorage.getItem('cpm_name') ?? '伙伴';
  const [pp, setPp] = useState<Passport | null>(null);
  const [coach, setCoach] = useState<AiCoachData | null>(null);
  const [challenge, setChallenge] = useState<ChallengeData | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('cpm_jwt');
    const h = { Authorization: `Bearer ${token}` };
    axios.get<Passport>('/api/v1/me/passport', { headers: h }).then((r) => setPp(r.data)).catch(() => {});
    axios.get<AiCoachData>('/api/v1/me/coach', { headers: h }).then((r) => setCoach(r.data)).catch(() => {});
    axios.get<ChallengeData>('/api/v1/me/challenge/today', { headers: h }).then((r) => setChallenge(r.data)).catch(() => {});
  }, []);

  const submitChallenge = async (proof: string): Promise<ChallengeSubmitResult> => {
    const token = localStorage.getItem('cpm_jwt');
    const { data } = await axios.post<ChallengeSubmitResult>(
      '/api/v1/me/challenge/submit',
      { proof },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return data;
  };

  const total = pp?.totalScore ?? 0;
  const lv = levelOf(total);
  const dims = pp?.scoresByDimension ?? [];
  const maxDim = Math.max(...dims.map((d) => d.totalScore), 1);
  const today = new Date();
  const dateStr = `${today.getMonth() + 1}月${today.getDate()}日`;

  return (
    <AuroraBg>
      <main style={{ padding: '20px 16px 60px', maxWidth: 460, margin: '0 auto' }}>
        {/* 顶部状态栏 */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 12,
            color: 'var(--cpm-text-tertiary)',
            marginBottom: 16,
          }}
        >
          <span style={{ letterSpacing: '0.12em', fontWeight: 600 }}>{dateStr}</span>
          <span>🔔 0</span>
        </div>

        {/* 个人中心 Hero 卡片 */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            position: 'relative',
            borderRadius: 24,
            padding: 22,
            background:
              'linear-gradient(135deg, #fef3ff 0%, #f0e9ff 40%, #e0f2fe 100%)',
            border: '1px solid rgba(255,255,255,0.6)',
            boxShadow: 'var(--cpm-shadow-pop)',
            overflow: 'hidden',
          }}
        >
          {/* 装饰光斑 */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              right: -40,
              top: -40,
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(167,139,250,0.45), transparent 70%)',
              filter: 'blur(20px)',
            }}
          />
          <div style={{ position: 'relative' }}>
            {/* 头像 + 信息 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 16,
                  background: 'linear-gradient(135deg, #c4b5fd, #fda4af)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  fontWeight: 700,
                  color: '#fff',
                  boxShadow: '0 6px 16px -4px rgba(124,58,237,0.4)',
                }}
              >
                {name.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: 'var(--cpm-text-primary)',
                    }}
                  >
                    {name}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      padding: '2px 8px',
                      borderRadius: 999,
                      background: `${lv.color}1A`,
                      color: lv.color,
                      fontWeight: 600,
                      letterSpacing: '0.08em',
                    }}
                  >
                    {lv.tier} · {lv.name}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--cpm-text-tertiary)', marginTop: 2 }}>
                  让企业文化变成可观测的运营指标
                </div>
              </div>
            </div>

            {/* 积分大数字 */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginTop: 18 }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--cpm-text-tertiary)', letterSpacing: '0.12em', fontWeight: 600 }}>
                  TOTAL POINTS
                </div>
                <div
                  style={{
                    fontSize: 38,
                    fontWeight: 700,
                    color: 'var(--cpm-text-primary)',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.05,
                    fontFeatureSettings: '"tnum"',
                  }}
                >
                  {total.toLocaleString()}
                </div>
              </div>
              <div style={{ flex: 1 }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--cpm-text-primary)' }}>
                  {pp?.badgeCount ?? 0}
                </div>
                <div style={{ fontSize: 11, color: 'var(--cpm-text-tertiary)' }}>徽章</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--cpm-text-primary)' }}>
                  {dims.filter((d) => d.totalScore > 0).length}
                </div>
                <div style={{ fontSize: 11, color: 'var(--cpm-text-tertiary)' }}>维度</div>
              </div>
            </div>

            {/* 6 维度迷你条 */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(6, 1fr)',
                gap: 6,
                marginTop: 16,
              }}
            >
              {dims.length === 0 &&
                Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      height: 4,
                      borderRadius: 2,
                      background: 'rgba(15,23,42,0.08)',
                    }}
                  />
                ))}
              {dims.map((d) => {
                const w = Math.max(4, (d.totalScore / maxDim) * 40 + 4);
                return (
                  <div
                    key={d.dimensionCode}
                    style={{
                      height: 4,
                      borderRadius: 2,
                      background: 'rgba(15,23,42,0.06)',
                      overflow: 'hidden',
                      position: 'relative',
                    }}
                    title={`${d.dimensionName} ${d.totalScore}`}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${w}%`,
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

        {/* 图标网格 · 3 列 2 行 */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.04, delayChildren: 0.15 } },
          }}
          style={{
            marginTop: 16,
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 12,
          }}
        >
          {iconEntries.map((it) => (
            <motion.div
              key={it.to}
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <Link
                to={it.to}
                style={{
                  textDecoration: 'none',
                  display: 'block',
                }}
              >
                <motion.div
                  whileTap={{ scale: 0.94 }}
                  whileHover={{ y: -3 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                  style={{
                    background: '#ffffff',
                    border: '1px solid var(--cpm-card-border)',
                    borderRadius: 18,
                    padding: '16px 8px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 8,
                    boxShadow: 'var(--cpm-shadow-soft)',
                    cursor: 'pointer',
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 14,
                      background: it.bg,
                      color: it.tint,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 22,
                      fontWeight: 600,
                    }}
                  >
                    {it.icon}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--cpm-text-primary)' }}>
                    {it.label}
                  </span>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.section>

        {/* AI 智能区 · 挑战 / 教练 / DNA 报告入口 */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.28 }}
          style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 14 }}
        >
          {/* 今日挑战 */}
          <ChallengeCard data={challenge} loading={!challenge} onSubmit={submitChallenge} />

          {/* AI 成长教练 */}
          <AiCoachCard data={coach} loading={!coach} />

          {/* DNA 年报入口 */}
          <Link to="/dna" style={{ textDecoration: 'none' }}>
            <motion.div
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              style={{
                position: 'relative',
                padding: '16px 18px 14px',
                borderRadius: 20,
                background: 'linear-gradient(135deg, #1e1b4b 0%, #7c3aed 60%, #ec4899 100%)',
                color: '#fff',
                boxShadow: '0 16px 36px -10px rgba(124,58,237,0.5)',
                fontFamily: 'var(--cpm-font-sans)',
                overflow: 'hidden',
              }}
            >
              <div
                aria-hidden
                style={{
                  position: 'absolute',
                  right: -20,
                  top: -20,
                  fontSize: 100,
                  opacity: 0.18,
                  pointerEvents: 'none',
                }}
              >
                🧬
              </div>
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.25em',
                    opacity: 0.8,
                    marginBottom: 6,
                  }}
                >
                  CULTURE DNA
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.01em', marginBottom: 4 }}>
                  你的文化 DNA 已生成
                </div>
                <div style={{ fontSize: 12, opacity: 0.75, lineHeight: 1.55, marginBottom: 12 }}>
                  AI 深度盘点本季度的成长与贡献
                </div>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '6px 14px',
                    borderRadius: 999,
                    background: 'rgba(255,255,255,0.18)',
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 600,
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  打开年报 →
                </span>
              </div>
            </motion.div>
          </Link>
        </motion.section>

        {/* 推荐横卡 · 宽 hero */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={{ marginTop: 16 }}
        >
          <Link to="/mall" style={{ textDecoration: 'none' }}>
            <div
              style={{
                position: 'relative',
                borderRadius: 20,
                padding: 18,
                background:
                  'linear-gradient(135deg, #ffe4e6 0%, #fce7f3 60%, #f3e8ff 100%)',
                border: '1px solid rgba(255,255,255,0.6)',
                boxShadow: 'var(--cpm-shadow-soft)',
                overflow: 'hidden',
              }}
            >
              <div
                aria-hidden
                style={{
                  position: 'absolute',
                  right: -20,
                  bottom: -20,
                  fontSize: 110,
                  opacity: 0.18,
                  fontWeight: 800,
                  letterSpacing: '-0.05em',
                  color: '#e11d48',
                  lineHeight: 1,
                  pointerEvents: 'none',
                }}
              >
                ◈
              </div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.14em',
                  color: '#e11d48',
                  marginBottom: 6,
                }}
              >
                LIMITED · 周末特惠
              </div>
              <div
                style={{
                  fontSize: 19,
                  fontWeight: 600,
                  color: 'var(--cpm-text-primary)',
                  letterSpacing: '-0.01em',
                }}
              >
                AI 文化盲盒 · 闪光款
              </div>
              <div
                style={{
                  fontSize: 12.5,
                  color: 'var(--cpm-text-secondary)',
                  marginTop: 4,
                  lineHeight: 1.55,
                }}
              >
                3D 转盘 · TCC 保障未中奖不扣分
              </div>
              <div
                style={{
                  marginTop: 12,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 14px',
                  borderRadius: 999,
                  background: '#0f172a',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                立即抽奖 →
              </div>
            </div>
          </Link>
        </motion.section>

        {/* 数据 Bento · 2x1 */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          style={{
            marginTop: 12,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12,
          }}
        >
          <Link to="/leaderboard" style={{ textDecoration: 'none' }}>
            <div
              style={{
                borderRadius: 18,
                padding: 16,
                background: '#fff',
                border: '1px solid var(--cpm-card-border)',
                boxShadow: 'var(--cpm-shadow-soft)',
                height: '100%',
              }}
            >
              <div style={{ fontSize: 11, color: 'var(--cpm-text-tertiary)', letterSpacing: '0.12em', fontWeight: 600 }}>
                MY RANK
              </div>
              <div
                style={{
                  fontSize: 30,
                  fontWeight: 700,
                  color: 'var(--cpm-text-primary)',
                  letterSpacing: '-0.02em',
                  marginTop: 4,
                  fontFeatureSettings: '"tnum"',
                }}
              >
                #1
              </div>
              <div style={{ fontSize: 11, color: 'var(--cpm-text-tertiary)', marginTop: 4 }}>
                超越 98% 同事
              </div>
            </div>
          </Link>
          <Link to="/activities" style={{ textDecoration: 'none' }}>
            <div
              style={{
                borderRadius: 18,
                padding: 16,
                background: 'linear-gradient(135deg, #ecfeff 0%, #dbeafe 100%)',
                border: '1px solid var(--cpm-card-border)',
                boxShadow: 'var(--cpm-shadow-soft)',
                height: '100%',
              }}
            >
              <div style={{ fontSize: 11, color: 'var(--cpm-brand-cyan)', letterSpacing: '0.12em', fontWeight: 600 }}>
                NEXT ACTIVITY
              </div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: 'var(--cpm-text-primary)',
                  marginTop: 6,
                  lineHeight: 1.3,
                }}
              >
                测试月底冲刺
              </div>
              <div style={{ fontSize: 11, color: 'var(--cpm-text-tertiary)', marginTop: 6 }}>
                团队协作 · 奖励 50 分
              </div>
            </div>
          </Link>
        </motion.section>

        <div
          style={{
            marginTop: 32,
            textAlign: 'center',
            fontSize: 11,
            color: 'var(--cpm-text-muted)',
            letterSpacing: '0.14em',
          }}
        >
          v0.1.0 · HR-AGENT × MCP
        </div>
      </main>
    </AuroraBg>
  );
}
