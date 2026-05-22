import axios from 'axios';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Button, PageHeader, EmptyState } from '@cpm/ui';

interface Item {
  ID: number;
  Type: string;
  Name: string;
  Cost: number;
  Stock: number | null;
  ImageURL: string;
}

const boxGradients = [
  'linear-gradient(135deg, #fef3ff 0%, #e9d5ff 100%)',
  'linear-gradient(135deg, #fdf2f8 0%, #fbcfe8 100%)',
  'linear-gradient(135deg, #faf5ff 0%, #c4b5fd 60%)',
  'linear-gradient(135deg, #ecfeff 0%, #a5f3fc 100%)',
];

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.38 } },
};

function SectionTitle({ title, count, icon }: { title: string; count: number; icon: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 10,
          background: 'var(--cpm-brand-violet-bg)',
          color: 'var(--cpm-brand-violet)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 16,
        }}
      >
        {icon}
      </div>
      <span
        style={{
          fontSize: 17,
          fontWeight: 700,
          color: 'var(--cpm-text-primary)',
          letterSpacing: '-0.01em',
        }}
      >
        {title}
      </span>
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          padding: '2px 8px',
          borderRadius: 999,
          background: 'var(--cpm-brand-violet-bg)',
          color: 'var(--cpm-brand-violet)',
        }}
      >
        {count}
      </span>
    </div>
  );
}

export function MallAdminPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('cpm_admin_jwt');
    axios
      .get<{ items: Item[] | null }>('/api/v1/mall/items', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((r) => setItems(r.data.items ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const boxes = items.filter((i) => i.Type === 'blindbox');
  const goods = items.filter((i) => i.Type === 'item');

  return (
    <div>
      <PageHeader
        title="商城 / 盲盒管理"
        action={
          <Button tone="secondary" size="sm">+ 新增</Button>
        }
      />

      {loading && (
        <div style={{ color: 'var(--cpm-text-tertiary)', fontSize: 14, padding: '16px 0' }}>
          加载中...
        </div>
      )}

      {!loading && items.length === 0 && (
        <EmptyState
          icon="◈"
          title="商城暂无商品"
          description="完整商城管理功能在后续 Phase 上线"
        />
      )}

      {!loading && boxes.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <SectionTitle title="盲盒" count={boxes.length} icon="◈" />
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 16,
            }}
          >
            {boxes.map((b, idx) => (
              <motion.div
                key={b.ID}
                variants={itemVariants}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                style={{
                  background: boxGradients[idx % boxGradients.length],
                  border: '1px solid var(--cpm-card-border)',
                  borderRadius: 20,
                  padding: 20,
                  boxShadow: 'var(--cpm-shadow-soft)',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                {/* 装饰大字 */}
                <div
                  aria-hidden
                  style={{
                    position: 'absolute',
                    right: -10,
                    bottom: -16,
                    fontSize: 80,
                    opacity: 0.12,
                    fontWeight: 800,
                    color: '#8b5cf6',
                    pointerEvents: 'none',
                    lineHeight: 1,
                  }}
                >
                  ◈
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, position: 'relative' }}>
                  {b.ImageURL ? (
                    <img
                      src={b.ImageURL}
                      alt={b.Name}
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: 14,
                        objectFit: 'cover',
                        border: '1px solid var(--cpm-card-border)',
                        flexShrink: 0,
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: 14,
                        background: 'rgba(139,92,246,0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 28,
                        flexShrink: 0,
                      }}
                    >
                      ◈
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: 'var(--cpm-text-primary)',
                        letterSpacing: '-0.01em',
                        marginBottom: 6,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {b.Name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <span
                        style={{
                          fontSize: 20,
                          fontWeight: 700,
                          color: 'var(--cpm-brand-violet)',
                          fontFeatureSettings: '"tnum"',
                          letterSpacing: '-0.01em',
                        }}
                      >
                        {b.Cost}
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--cpm-text-tertiary)' }}>分</span>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          padding: '2px 7px',
                          borderRadius: 999,
                          background: 'rgba(16,185,129,0.12)',
                          color: 'var(--cpm-success)',
                        }}
                      >
                        库存 ∞
                      </span>
                    </div>
                    <Button tone="secondary" size="sm">查看奖品池</Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}

      {!loading && goods.length > 0 && (
        <section>
          <SectionTitle title="商品" count={goods.length} icon="✦" />
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 16,
            }}
          >
            {goods.map((g) => (
              <motion.div
                key={g.ID}
                variants={itemVariants}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                style={{
                  background: '#fff',
                  border: '1px solid var(--cpm-card-border)',
                  borderRadius: 16,
                  overflow: 'hidden',
                  boxShadow: 'var(--cpm-shadow-soft)',
                }}
              >
                {g.ImageURL ? (
                  <img
                    src={g.ImageURL}
                    alt={g.Name}
                    style={{
                      width: '100%',
                      height: 130,
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      height: 100,
                      background: 'linear-gradient(135deg, var(--cpm-bg-2), var(--cpm-bg-0))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 32,
                      color: 'var(--cpm-text-muted)',
                    }}
                  >
                    ✦
                  </div>
                )}
                <div style={{ padding: '12px 14px 14px' }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: 'var(--cpm-text-primary)',
                      marginBottom: 6,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {g.Name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                      <span
                        style={{
                          fontSize: 18,
                          fontWeight: 700,
                          color: 'var(--cpm-brand-violet)',
                          fontFeatureSettings: '"tnum"',
                        }}
                      >
                        {g.Cost}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--cpm-text-tertiary)' }}>分</span>
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--cpm-text-muted)' }}>
                      库存 {g.Stock ?? '∞'}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}
    </div>
  );
}
