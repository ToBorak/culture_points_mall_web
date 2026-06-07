import { Button } from '@cpm/ui';
import { motion } from 'framer-motion';
import { type CSSProperties, useMemo, useState } from 'react';

// MallBatchTable 渲染 open_mall_batch 信号里内嵌的商品列表，支持勾选多个商品 + 选一个批量操作
// （下架/上架/改库存），提交后拼成「表单回填·batch_update_mall」文本发回 agent。

export interface MallBatchItem {
  id: number;
  name: string;
  type: string;
  cost: number;
  stock: number | null;
  status: string; // on_shelf / off_shelf
}
export interface MallBatchSpec {
  title: string;
  items: MallBatchItem[];
}

interface Props {
  spec: MallBatchSpec;
  onSubmit: (text: string) => void;
  onCancel: () => void;
}

type Action = 'delist' | 'relist' | 'set_stock';
const ACTIONS: { value: Action; label: string }[] = [
  { value: 'delist', label: '批量下架' },
  { value: 'relist', label: '批量上架' },
  { value: 'set_stock', label: '批量改库存' },
];

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '7px 10px',
  borderRadius: 9,
  border: '1.5px solid var(--cpm-card-border-strong)',
  background: 'var(--cpm-bg-0)',
  fontSize: 13,
  color: 'var(--cpm-text-primary)',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'var(--cpm-font-sans)',
};

export function MallBatchTable({ spec, onSubmit, onCancel }: Props) {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [action, setAction] = useState<Action>('delist');
  const [stock, setStock] = useState('');
  const [unlimited, setUnlimited] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const allChecked = spec.items.length > 0 && selected.size === spec.items.length;
  const toggle = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const toggleAll = () => setSelected(allChecked ? new Set() : new Set(spec.items.map((i) => i.id)));

  const canSubmit = useMemo(() => {
    if (submitting || selected.size === 0) return false;
    if (action === 'set_stock') return unlimited || stock.trim() !== '';
    return true;
  }, [submitting, selected, action, stock, unlimited]);

  const submit = () => {
    if (!canSubmit) return;
    setSubmitting(true);
    const ids = spec.items.filter((i) => selected.has(i.id)).map((i) => i.id);
    const names = spec.items.filter((i) => selected.has(i.id)).map((i) => i.name);
    const actionLabel = ACTIONS.find((a) => a.value === action)?.label ?? action;
    const params = [`item_ids=${ids.join(',')}`, `action=${action}`];
    let detail = '';
    if (action === 'set_stock') {
      if (unlimited) {
        params.push('unlimited_stock=true');
        detail = '：改为不限量';
      } else {
        params.push(`stock=${Number(stock) || 0}`);
        detail = `：改为 ${Number(stock) || 0}`;
      }
    }
    const text = `【表单回填·batch_update_mall】\n- 商品：${names.join('、')}（${ids.length} 个）\n- 操作：${actionLabel}${detail}\n参数：${params.join('；')}`;
    onSubmit(text);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 280, damping: 24 }}
      style={{
        alignSelf: 'flex-start',
        width: '100%',
        maxWidth: 560,
        borderRadius: 16,
        borderTopLeftRadius: 4,
        border: '1.5px solid rgba(109,40,217,0.25)',
        background: '#fff',
        boxShadow: 'var(--cpm-shadow-soft)',
        overflow: 'hidden',
        fontFamily: 'var(--cpm-font-sans)',
      }}
    >
      <div
        style={{
          padding: '11px 16px',
          background: 'rgba(124,58,237,0.05)',
          borderBottom: '1px solid var(--cpm-card-border)',
          fontSize: 13,
          fontWeight: 700,
          color: 'var(--cpm-brand-violet)',
        }}
      >
        🗂️ {spec.title}
      </div>

      <div style={{ maxHeight: '40vh', overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
          <thead>
            <tr style={{ color: 'var(--cpm-text-tertiary)', textAlign: 'left' }}>
              <th style={{ padding: '8px 10px', width: 32 }}>
                <input type="checkbox" checked={allChecked} onChange={toggleAll} />
              </th>
              <th style={{ padding: '8px 6px' }}>商品</th>
              <th style={{ padding: '8px 6px', width: 64 }}>积分</th>
              <th style={{ padding: '8px 6px', width: 64 }}>库存</th>
              <th style={{ padding: '8px 6px', width: 64 }}>状态</th>
            </tr>
          </thead>
          <tbody>
            {spec.items.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: 16, textAlign: 'center', color: 'var(--cpm-text-muted)' }}>
                  暂无商品
                </td>
              </tr>
            )}
            {spec.items.map((it) => {
              const off = it.status === 'off_shelf';
              return (
                <tr key={it.id} style={{ borderTop: '1px solid var(--cpm-card-border)' }}>
                  <td style={{ padding: '7px 10px' }}>
                    <input type="checkbox" checked={selected.has(it.id)} onChange={() => toggle(it.id)} />
                  </td>
                  <td style={{ padding: '7px 6px', color: 'var(--cpm-text-primary)' }}>
                    {it.name}
                    {it.type === 'blindbox' && <span style={{ color: 'var(--cpm-text-muted)' }}> · 盲盒</span>}
                  </td>
                  <td style={{ padding: '7px 6px' }}>{it.cost}</td>
                  <td style={{ padding: '7px 6px' }}>{it.stock === null ? '不限' : it.stock}</td>
                  <td style={{ padding: '7px 6px' }}>
                    <span
                      style={{
                        padding: '1px 7px',
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 600,
                        background: off ? 'rgba(15,23,42,0.06)' : 'rgba(16,185,129,0.12)',
                        color: off ? 'var(--cpm-text-muted)' : 'var(--cpm-success)',
                      }}
                    >
                      {off ? '已下架' : '在售'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--cpm-card-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--cpm-text-secondary)', fontWeight: 600 }}>
            对选中的 {selected.size} 个：
          </span>
          {ACTIONS.map((a) => {
            const active = action === a.value;
            return (
              <button
                key={a.value}
                type="button"
                onClick={() => setAction(a.value)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 8,
                  border: `1.5px solid ${active ? 'var(--cpm-brand-violet)' : 'var(--cpm-card-border-strong)'}`,
                  background: active ? 'var(--cpm-brand-violet)' : 'var(--cpm-bg-0)',
                  color: active ? '#fff' : 'var(--cpm-text-primary)',
                  fontSize: 12.5,
                  fontWeight: active ? 600 : 500,
                  cursor: 'pointer',
                  fontFamily: 'var(--cpm-font-sans)',
                }}
              >
                {a.label}
              </button>
            );
          })}
        </div>
        {action === 'set_stock' && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input
              type="number"
              style={{ ...inputStyle, maxWidth: 140 }}
              placeholder="新库存"
              value={stock}
              disabled={unlimited}
              onChange={(e) => setStock(e.target.value)}
            />
            <label style={{ fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
              <input type="checkbox" checked={unlimited} onChange={(e) => setUnlimited(e.target.checked)} /> 不限量
            </label>
          </div>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          gap: 10,
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: '10px 16px',
          borderTop: '1px solid var(--cpm-card-border)',
          background: 'rgba(124,58,237,0.03)',
        }}
      >
        {!canSubmit && !submitting && (
          <span style={{ flex: 1, fontSize: 11, color: 'var(--cpm-text-muted)' }}>勾选商品并选择操作后即可提交</span>
        )}
        <Button tone="ghost" size="sm" onClick={onCancel} disabled={submitting}>
          取消
        </Button>
        <Button tone="primary" size="sm" onClick={submit} disabled={!canSubmit}>
          {submitting ? '提交中…' : '执行'}
        </Button>
      </div>
    </motion.div>
  );
}
