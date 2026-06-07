import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { type ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Button, PageHeader, EmptyState } from '@cpm/ui';
import type { BlindboxConfig } from '@cpm/types';

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

function authHeader() {
  return { Authorization: `Bearer ${localStorage.getItem('cpm_admin_jwt')}` };
}

export function MallAdminPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [configBox, setConfigBox] = useState<Item | null>(null);

  const loadItems = useCallback(async () => {
    try {
      const r = await axios.get<{ items: Item[] | null }>('/api/v1/mall/items', {
        headers: authHeader(),
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

  const deleteItem = async (it: Item) => {
    if (!window.confirm(`确定删除「${it.Name}」吗？此操作不可撤销。`)) return;
    try {
      await axios.delete(`/api/v1/admin/mall/items/${it.ID}`, { headers: authHeader() });
      void loadItems();
    } catch (e) {
      const er = e as { response?: { data?: { error?: string } } };
      alert(`删除失败：${er?.response?.data?.error ?? '请稍后再试'}`);
    }
  };

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
        {configBox && (
          <BlindboxConfigModal
            box={configBox}
            onClose={() => setConfigBox(null)}
            onSaved={() => {
              setConfigBox(null);
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
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <Button tone="primary" size="sm" onClick={() => setConfigBox(b)}>
                        配置奖池
                      </Button>
                      <Button tone="danger" size="sm" onClick={() => deleteItem(b)}>
                        删除
                      </Button>
                    </div>
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
                      height: 160,
                      objectFit: 'contain',
                      display: 'block',
                      background: 'var(--cpm-bg-0)',
                      padding: 10,
                      boxSizing: 'border-box',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      height: 160,
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
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 10,
                    }}
                  >
                    {g.Cost > 0 ? (
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
                    ) : (
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--cpm-brand-violet)' }}>
                        实时上新
                      </span>
                    )}
                    <span style={{ fontSize: 11, color: 'var(--cpm-text-muted)' }}>
                      库存 {g.Stock ?? '∞'}
                    </span>
                  </div>
                  <Button tone="danger" size="sm" onClick={() => deleteItem(g)} style={{ width: '100%' }}>
                    删除
                  </Button>
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

        <FieldLabel>商品图片（选填）</FieldLabel>
        <ImageUploadField value={imageURL} onChange={setImageURL} />

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

// 图片上传控件：选图 → 调 /api/v1/admin/mall/upload → 回填相对 URL；带预览。
function ImageUploadField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onPick = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setErr(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const r = await axios.post<{ url: string }>('/api/v1/admin/mall/upload', fd, {
        headers: { ...authHeader(), 'Content-Type': 'multipart/form-data' },
      });
      onChange(r.data.url);
    } catch (e2) {
      const er = e2 as { response?: { data?: { error?: string } } };
      setErr(er?.response?.data?.error ?? '上传失败');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {value ? (
          <img
            src={value}
            alt="预览"
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              objectFit: 'cover',
              border: '1px solid var(--cpm-card-border)',
            }}
          />
        ) : (
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              background: 'var(--cpm-bg-0)',
              display: 'grid',
              placeItems: 'center',
              color: 'var(--cpm-text-muted)',
              fontSize: 22,
            }}
          >
            ✦
          </div>
        )}
        <label
          style={{
            padding: '8px 14px',
            borderRadius: 11,
            border: '1.5px solid var(--cpm-brand-violet)',
            background: 'var(--cpm-brand-violet-bg)',
            color: 'var(--cpm-brand-violet)',
            fontWeight: 600,
            fontSize: 13,
            cursor: uploading ? 'not-allowed' : 'pointer',
          }}
        >
          {uploading ? '上传中…' : value ? '更换图片' : '上传图片'}
          <input type="file" accept="image/*" onChange={onPick} disabled={uploading} style={{ display: 'none' }} />
        </label>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            style={{
              border: 'none',
              background: 'transparent',
              color: 'var(--cpm-text-tertiary)',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            清除
          </button>
        )}
      </div>
      {err && <div style={{ marginTop: 6, fontSize: 12, color: 'var(--cpm-danger)' }}>{err}</div>}
    </div>
  );
}

interface PrizeRow {
  itemId: number;
  name: string;
  image: string;
  cost: number;
  enabled: boolean;
  weight: string;
  stock: string;
}

// 盲盒奖池配置弹窗：勾选好物 + 设权重/份数 + 无奖品权重 + 未中奖是否扣分。
function BlindboxConfigModal({
  box,
  onClose,
  onSaved,
}: {
  box: Item;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [chargeOnMiss, setChargeOnMiss] = useState(true);
  const [noPrizeWeight, setNoPrizeWeight] = useState('80');
  const [rows, setRows] = useState<PrizeRow[]>([]);

  useEffect(() => {
    void (async () => {
      try {
        const r = await axios.get<BlindboxConfig>(`/api/v1/admin/mall/blindbox/${box.ID}/config`, {
          headers: authHeader(),
        });
        const cfg = r.data;
        setChargeOnMiss(cfg.box.chargeOnMiss);
        setNoPrizeWeight(String(cfg.noPrizeWeight));
        const byId = new Map((cfg.prizes ?? []).map((p) => [p.itemId, p]));
        const goods = (cfg.goods ?? []).filter((g) => g.Cost > 0); // 排除「实时上新」占位
        setRows(
          goods.map((g) => {
            const p = byId.get(g.ID);
            return {
              itemId: g.ID,
              name: g.Name,
              image: g.ImageURL,
              cost: g.Cost,
              enabled: !!p,
              weight: p ? String(p.weight) : '10',
              stock: p && p.stock != null ? String(p.stock) : '',
            };
          }),
        );
      } catch {
        setErr('加载配置失败');
      } finally {
        setLoading(false);
      }
    })();
  }, [box.ID]);

  const totalWeight = useMemo(() => {
    let t = Number(noPrizeWeight) || 0;
    for (const r of rows) if (r.enabled) t += Number(r.weight) || 0;
    return t;
  }, [rows, noPrizeWeight]);

  const pct = (w: number) => (totalWeight > 0 ? (w / totalWeight) * 100 : 0);
  const fmtPct = (w: number) => {
    const v = pct(w);
    return v > 0 && v < 1 ? `${v.toFixed(1)}%` : `${Math.round(v)}%`;
  };

  const update = (id: number, patch: Partial<PrizeRow>) =>
    setRows((rs) => rs.map((r) => (r.itemId === id ? { ...r, ...patch } : r)));

  const save = async () => {
    setErr(null);
    const prizes = rows
      .filter((r) => r.enabled)
      .map((r) => ({
        itemId: r.itemId,
        weight: Number(r.weight) || 0,
        stock: r.stock.trim() === '' ? null : Number(r.stock),
      }));
    setSaving(true);
    try {
      await axios.put(
        `/api/v1/admin/mall/blindbox/${box.ID}/config`,
        { chargeOnMiss, noPrizeWeight: Number(noPrizeWeight) || 0, prizes },
        { headers: authHeader() },
      );
      onSaved();
    } catch (e) {
      const er = e as { response?: { data?: { error?: string } } };
      setErr(er?.response?.data?.error ?? '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const numInputStyle: React.CSSProperties = {
    width: 64,
    padding: '6px 8px',
    borderRadius: 8,
    border: '1.5px solid var(--cpm-card-border-strong)',
    background: 'var(--cpm-bg-0)',
    fontSize: 13,
    color: 'var(--cpm-text-primary)',
    outline: 'none',
    fontFamily: 'var(--cpm-font-sans)',
    boxSizing: 'border-box',
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
          width: 560,
          maxWidth: '100%',
          maxHeight: '86vh',
          display: 'flex',
          flexDirection: 'column',
          background: '#fff',
          borderRadius: 22,
          border: '1px solid var(--cpm-card-border)',
          boxShadow: 'var(--cpm-shadow-pop)',
          padding: '24px 24px 20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 19, fontWeight: 700, color: 'var(--cpm-text-primary)' }}>配置奖池</div>
            <div style={{ fontSize: 13, color: 'var(--cpm-text-tertiary)', marginTop: 4 }}>
              {box.Name} · 每次抽奖消耗 {box.Cost} 分
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

        {loading ? (
          <div style={{ padding: '24px 0', color: 'var(--cpm-text-tertiary)', fontSize: 14 }}>加载中…</div>
        ) : (
          <div style={{ overflowY: 'auto', flex: 1, paddingRight: 4 }}>
            {/* 未中奖是否扣分 */}
            <FieldLabel>未中奖时</FieldLabel>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {[
                { v: true, label: '也扣分' },
                { v: false, label: '不扣分' },
              ].map((o) => {
                const active = chargeOnMiss === o.v;
                return (
                  <button
                    key={String(o.v)}
                    type="button"
                    onClick={() => setChargeOnMiss(o.v)}
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
                    }}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>

            {/* 无奖品 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 12px',
                borderRadius: 12,
                background: 'var(--cpm-bg-0)',
                marginBottom: 14,
              }}
            >
              <div style={{ flex: 1, fontSize: 14, fontWeight: 600, color: 'var(--cpm-text-primary)' }}>
                无奖品（谢谢参与）
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--cpm-text-tertiary)', marginRight: 6 }}>权重</span>
                <input
                  type="number"
                  value={noPrizeWeight}
                  onChange={(e) => setNoPrizeWeight(e.target.value)}
                  style={numInputStyle}
                />
              </div>
              <div style={{ width: 52, textAlign: 'right', fontSize: 13, fontWeight: 700, color: 'var(--cpm-text-secondary)' }}>
                {fmtPct(Number(noPrizeWeight) || 0)}
              </div>
            </div>

            <FieldLabel>好物奖品（勾选进入奖池）</FieldLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {rows.map((r) => (
                <div
                  key={r.itemId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 10px',
                    borderRadius: 12,
                    border: '1px solid var(--cpm-card-border)',
                    background: r.enabled ? 'var(--cpm-brand-violet-bg)' : '#fff',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={r.enabled}
                    onChange={(e) => update(r.itemId, { enabled: e.target.checked })}
                    style={{ width: 18, height: 18, cursor: 'pointer', flexShrink: 0 }}
                  />
                  {r.image ? (
                    <img
                      src={r.image}
                      alt={r.name}
                      style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        background: 'var(--cpm-bg-0)',
                        flexShrink: 0,
                      }}
                    />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: 'var(--cpm-text-primary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {r.name}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--cpm-text-tertiary)' }}>{r.cost} 分</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: 'var(--cpm-text-tertiary)', marginBottom: 2 }}>权重</div>
                    <input
                      type="number"
                      value={r.weight}
                      disabled={!r.enabled}
                      onChange={(e) => update(r.itemId, { weight: e.target.value })}
                      style={{ ...numInputStyle, opacity: r.enabled ? 1 : 0.5 }}
                    />
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: 'var(--cpm-text-tertiary)', marginBottom: 2 }}>份数</div>
                    <input
                      type="number"
                      value={r.stock}
                      disabled={!r.enabled}
                      placeholder="∞"
                      onChange={(e) => update(r.itemId, { stock: e.target.value })}
                      style={{ ...numInputStyle, opacity: r.enabled ? 1 : 0.5 }}
                    />
                  </div>
                  <div
                    style={{
                      width: 46,
                      textAlign: 'right',
                      fontSize: 13,
                      fontWeight: 700,
                      color: r.enabled ? 'var(--cpm-brand-violet)' : 'var(--cpm-text-muted)',
                    }}
                  >
                    {r.enabled ? fmtPct(Number(r.weight) || 0) : '—'}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 12, fontSize: 12, color: 'var(--cpm-text-tertiary)', lineHeight: 1.6 }}>
              概率 = 本项权重 ÷ 总权重。份数为「最多可中数量」，留空=不限；抽完即自动移出奖池（概率重新分配）。
            </div>

            {err && (
              <div
                style={{
                  marginTop: 12,
                  padding: '10px 13px',
                  borderRadius: 10,
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  color: 'var(--cpm-danger)',
                  fontSize: 13,
                }}
              >
                {err}
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <Button tone="ghost" size="md" onClick={onClose} style={{ flex: 1 }}>
            取消
          </Button>
          <Button tone="primary" size="md" onClick={save} disabled={saving || loading} style={{ flex: 1 }}>
            {saving ? '保存中…' : '保存奖池'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
