import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
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
  const [showModal, setShowModal] = useState(false);

  const loadItems = useCallback(async () => {
    const token = localStorage.getItem('cpm_admin_jwt');
    try {
      const r = await axios.get<{ items: Item[] | null }>('/api/v1/mall/items', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(r.data.items ?? []);
    } catch {
      /* noop */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  const boxes = items.filter((i) => i.Type === 'blindbox');
  const goods = items.filter((i) => i.Type === 'item');

  return (
    <div>
      <PageHeader
        title="商城 / 盲盒管理"
        action={
          <Button tone="secondary" size="sm" onClick={() => setShowModal(true)}>
            + 新增
          </Button>
        }
      />

      <AnimatePresence>
        {showModal && (
          <CreateItemModal
            onClose={() => setShowModal(false)}
            onCreated={() => {
              setShowModal(false);
              void loadItems();
            }}
          />
        )}
      </AnimatePresence>

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

function CreateItemModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [type, setType] = useState<'item' | 'blindbox'>('item');
  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  const [stock, setStock] = useState('');
  const [imageURL, setImageURL] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    setErr(null);
    const costN = Number(cost);
    if (!name.trim()) return setErr('请填写商品名');
    if (!Number.isFinite(costN) || costN <= 0) return setErr('cost 必须 > 0');
    const body: Record<string, unknown> = { type, name: name.trim(), cost: costN };
    if (stock.trim() !== '') body.stock = Number(stock);
    if (imageURL.trim() !== '') body.image_url = imageURL.trim();

    setSubmitting(true);
    try {
      const token = localStorage.getItem('cpm_admin_jwt');
      await axios.post('/api/v1/admin/mall/items', body, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onCreated();
    } catch (e) {
      const er = e as { response?: { data?: { error?: string } } };
      setErr(er?.response?.data?.error ?? String(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15,23,42,0.45)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.97 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: 460,
          maxWidth: '100%',
          background: '#fff',
          borderRadius: 22,
          border: '1px solid var(--cpm-card-border)',
          boxShadow: 'var(--cpm-shadow-pop)',
          padding: '28px 28px 24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--cpm-text-primary)', letterSpacing: '-0.01em' }}>
              新增商品
            </div>
            <div style={{ fontSize: 13, color: 'var(--cpm-text-tertiary)', marginTop: 4 }}>
              支持普通商品 / 盲盒两种类型
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              border: 'none',
              background: 'var(--cpm-bg-0)',
              color: 'var(--cpm-text-tertiary)',
              fontSize: 16,
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        {/* 类型切换 */}
        <FieldLabel>类型</FieldLabel>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {(['item', 'blindbox'] as const).map((t) => {
            const active = type === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: 11,
                  border: active
                    ? '1.5px solid var(--cpm-brand-violet)'
                    : '1.5px solid var(--cpm-card-border-strong)',
                  background: active ? 'var(--cpm-brand-violet-bg)' : 'transparent',
                  color: active ? 'var(--cpm-brand-violet)' : 'var(--cpm-text-secondary)',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                  fontFamily: 'var(--cpm-font-sans)',
                  transition: 'all 0.15s',
                }}
              >
                {t === 'item' ? '✦ 普通商品' : '◈ 盲盒'}
              </button>
            );
          })}
        </div>

        <FieldLabel>名称</FieldLabel>
        <Input value={name} onChange={setName} placeholder="例如：咖啡券" />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
          <div>
            <FieldLabel>消耗积分</FieldLabel>
            <Input value={cost} onChange={setCost} placeholder="30" type="number" />
          </div>
          <div>
            <FieldLabel>库存（选填）</FieldLabel>
            <Input value={stock} onChange={setStock} placeholder="留空 = 不限量" type="number" />
          </div>
        </div>

        <FieldLabel>图片 URL（选填）</FieldLabel>
        <Input value={imageURL} onChange={setImageURL} placeholder="https://..." />

        {err && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: 4,
              padding: '10px 13px',
              borderRadius: 10,
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.2)',
              color: 'var(--cpm-danger)',
              fontSize: 13,
            }}
          >
            {err}
          </motion.div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          <Button tone="ghost" size="md" onClick={onClose} style={{ flex: 1 }}>
            取消
          </Button>
          <Button tone="primary" size="md" onClick={submit} disabled={submitting} style={{ flex: 1 }}>
            {submitting ? '提交中…' : '提交'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label
      style={{
        display: 'block',
        fontSize: 12,
        fontWeight: 600,
        color: 'var(--cpm-text-secondary)',
        marginBottom: 6,
        letterSpacing: '0.02em',
      }}
    >
      {children}
    </label>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: 'text' | 'number';
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      type={type}
      style={{
        display: 'block',
        width: '100%',
        padding: '10px 13px',
        borderRadius: 11,
        border: '1.5px solid var(--cpm-card-border-strong)',
        background: 'var(--cpm-bg-0)',
        fontSize: 14,
        color: 'var(--cpm-text-primary)',
        outline: 'none',
        marginBottom: 14,
        fontFamily: 'var(--cpm-font-sans)',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        boxSizing: 'border-box',
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = 'var(--cpm-brand-violet)';
        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.12)';
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = 'var(--cpm-card-border-strong)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    />
  );
}
