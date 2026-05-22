import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { AuroraBg } from '@cpm/ui';

interface Item {
  ID: number;
  Type: string;
  Name: string;
  Cost: number;
  ImageURL: string;
}

type Tab = 'blindbox' | 'products';

const blindboxGradients = [
  'linear-gradient(135deg,#f3e8ff,#e0e7ff)',
  'linear-gradient(135deg,#fce7f3,#ffe4e6)',
  'linear-gradient(135deg,#ecfeff,#dbeafe)',
  'linear-gradient(135deg,#fef9c3,#fef3c7)',
];

const blindboxAccent = ['#7c3aed', '#e11d48', '#0891b2', '#d97706'];

export function MallPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('blindbox');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('cpm_jwt');
    axios
      .get<{ items: Item[] }>('/api/v1/mall/items', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((r) => setItems(r.data.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const blindboxes = items.filter((it) => it.Type === 'blindbox');
  const products = items.filter((it) => it.Type !== 'blindbox');

  const myPoints = Number(localStorage.getItem('cpm_points') ?? 0);

  return (
    <AuroraBg>
      <main style={{ padding: '20px 16px 80px', maxWidth: 460, margin: '0 auto' }}>
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
            积分商城
          </span>
          {/* 我的积分 chip */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '5px 12px',
              borderRadius: 999,
              background: 'var(--cpm-brand-violet)',
              color: '#fff',
              fontSize: 12,
              fontWeight: 700,
              boxShadow: 'var(--cpm-shadow-glow-violet)',
              fontFeatureSettings: '"tnum"',
            }}
          >
            ◆ {myPoints > 0 ? myPoints.toLocaleString() : '–'}
          </div>
        </div>

        {/* Tab 切换 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            display: 'flex',
            gap: 6,
            background: '#fff',
            borderRadius: 14,
            padding: 4,
            border: '1px solid var(--cpm-card-border)',
            boxShadow: 'var(--cpm-shadow-soft)',
            marginBottom: 16,
          }}
        >
          {([['blindbox', '盲盒'], ['products', '商品']] as [Tab, string][]).map(([key, label]) => (
            <motion.button
              key={key}
              onClick={() => setTab(key)}
              whileTap={{ scale: 0.94 }}
              style={{
                flex: 1,
                padding: '10px 4px',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                fontFamily: 'var(--cpm-font-sans)',
                cursor: 'pointer',
                border: 'none',
                background:
                  tab === key
                    ? 'linear-gradient(135deg, var(--cpm-brand-violet), var(--cpm-brand-cyan))'
                    : 'transparent',
                color: tab === key ? '#fff' : 'var(--cpm-text-tertiary)',
                transition: 'all 0.2s ease',
              }}
            >
              {label}
            </motion.button>
          ))}
        </motion.div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--cpm-text-tertiary)', fontSize: 14 }}>
            加载中...
          </div>
        )}

        {/* 盲盒 Tab - 2列大卡 */}
        {tab === 'blindbox' && !loading && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.07 } },
            }}
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}
          >
            {blindboxes.length === 0 && (
              <div
                style={{
                  gridColumn: '1/-1',
                  textAlign: 'center',
                  padding: '60px 0',
                  color: 'var(--cpm-text-muted)',
                  fontSize: 14,
                }}
              >
                暂无盲盒
              </div>
            )}
            {blindboxes.map((box, idx) => {
              const grad = blindboxGradients[idx % blindboxGradients.length];
              const accent = blindboxAccent[idx % blindboxAccent.length];
              return (
                <motion.div
                  key={box.ID}
                  variants={{
                    hidden: { opacity: 0, y: 16 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  <Link to={`/mall/blindbox/${box.ID}`} style={{ textDecoration: 'none' }}>
                    <motion.div
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.96 }}
                      transition={{ type: 'spring', stiffness: 320, damping: 20 }}
                      style={{
                        borderRadius: 20,
                        padding: '18px 14px 14px',
                        background: grad,
                        border: '1px solid rgba(255,255,255,0.7)',
                        boxShadow: 'var(--cpm-shadow-soft)',
                        position: 'relative',
                        overflow: 'hidden',
                        cursor: 'pointer',
                      }}
                    >
                      {/* 装饰大字背景 */}
                      <div
                        aria-hidden
                        style={{
                          position: 'absolute',
                          right: -10,
                          bottom: -10,
                          fontSize: 80,
                          opacity: 0.12,
                          fontWeight: 900,
                          color: accent,
                          lineHeight: 1,
                          pointerEvents: 'none',
                          letterSpacing: '-0.05em',
                        }}
                      >
                        ◈
                      </div>

                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: '0.12em',
                          color: accent,
                          marginBottom: 6,
                        }}
                      >
                        BLIND BOX
                      </div>
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: 'var(--cpm-text-primary)',
                          lineHeight: 1.3,
                          marginBottom: 10,
                        }}
                      >
                        {box.Name}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--cpm-text-secondary)', marginBottom: 10 }}>
                        查看奖品池 →
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        {/* 价格 chip */}
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            padding: '4px 10px',
                            borderRadius: 999,
                            background: `${accent}18`,
                            color: accent,
                            fontFeatureSettings: '"tnum"',
                          }}
                        >
                          {box.Cost} 分
                        </span>
                        {/* CTA */}
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            padding: '6px 12px',
                            borderRadius: 999,
                            background: accent,
                            color: '#fff',
                            boxShadow: `0 4px 12px -4px ${accent}60`,
                          }}
                        >
                          抽！
                        </span>
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* 商品 Tab - 3列小卡 */}
        {tab === 'products' && !loading && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.05 } },
            }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}
          >
            {products.length === 0 && (
              <div
                style={{
                  gridColumn: '1/-1',
                  textAlign: 'center',
                  padding: '60px 0',
                  color: 'var(--cpm-text-muted)',
                  fontSize: 14,
                }}
              >
                暂无商品
              </div>
            )}
            {products.map((prod, idx) => (
              <motion.div
                key={prod.ID}
                variants={{
                  hidden: { opacity: 0, scale: 0.9 },
                  visible: { opacity: 1, scale: 1 },
                }}
              >
                <motion.div
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.94 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 20 }}
                  style={{
                    background: '#fff',
                    borderRadius: 16,
                    border: '1px solid var(--cpm-card-border)',
                    boxShadow: 'var(--cpm-shadow-soft)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {prod.ImageURL ? (
                    <img
                      src={prod.ImageURL}
                      alt={prod.Name}
                      style={{
                        width: '100%',
                        height: 90,
                        objectFit: 'cover',
                        background: 'var(--cpm-bg-2)',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        height: 90,
                        background: blindboxGradients[idx % blindboxGradients.length],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 36,
                        color: blindboxAccent[idx % blindboxAccent.length],
                        opacity: 0.6,
                      }}
                    >
                      ◈
                    </div>
                  )}
                  <div style={{ padding: '10px 10px 12px' }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: 'var(--cpm-text-primary)',
                        marginBottom: 4,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {prod.Name}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: 'var(--cpm-brand-violet)',
                        marginBottom: 8,
                        fontFeatureSettings: '"tnum"',
                      }}
                    >
                      {prod.Cost} 分
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.92 }}
                      style={{
                        width: '100%',
                        padding: '6px 0',
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 600,
                        fontFamily: 'var(--cpm-font-sans)',
                        border: 'none',
                        background: 'var(--cpm-brand-violet-bg)',
                        color: 'var(--cpm-brand-violet)',
                        cursor: 'pointer',
                      }}
                    >
                      兑换
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* 底部我的订单 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{
            position: 'fixed',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            maxWidth: 460,
            padding: '12px 16px',
            background: 'rgba(249,247,255,0.88)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderTop: '1px solid var(--cpm-card-border)',
            zIndex: 50,
          }}
        >
          <motion.button
            whileTap={{ scale: 0.97 }}
            style={{
              width: '100%',
              padding: '12px 0',
              borderRadius: 14,
              fontSize: 14,
              fontWeight: 600,
              fontFamily: 'var(--cpm-font-sans)',
              border: '1px solid var(--cpm-card-border)',
              background: '#fff',
              color: 'var(--cpm-text-primary)',
              cursor: 'pointer',
              boxShadow: 'var(--cpm-shadow-soft)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            📦 我的订单
          </motion.button>
        </motion.div>
      </main>
    </AuroraBg>
  );
}
