import { Button } from '@cpm/ui';
import axios from 'axios';
import { motion } from 'framer-motion';
import { type CSSProperties, useEffect, useMemo, useState } from 'react';

// BatchCard 是通用「批量管理」卡片，吃后端 open_*_batch 工具发出的 {form:"batch_form", ...} 信号
// （积分、活动等都用它）：勾选多行 + 选一个操作 + 填可选参数，提交后拼成「表单回填·<intent>」发回 agent。

interface BatchColumn {
  key: string;
  label: string;
}
interface BatchField {
  field: string;
  label: string;
  type: 'number' | 'text' | 'choice';
  options?: Array<{ value: string; label: string }>;
  source?: 'dimensions';
  placeholder?: string;
  required?: boolean;
}
interface BatchAction {
  value: string;
  label: string;
  fields?: BatchField[];
}
export interface BatchFormSpec {
  title: string;
  intent: string;
  idField: string;
  columns: BatchColumn[];
  items: Array<Record<string, unknown>>;
  actions: BatchAction[];
}

interface Props {
  spec: BatchFormSpec;
  onSubmit: (text: string) => void;
  onCancel: () => void;
}

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

function statusBadge(label: string) {
  const off = label.includes('关闭') || label.includes('草稿') || label.includes('下架');
  return (
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
      {label}
    </span>
  );
}

export function BatchCard({ spec, onSubmit, onCancel }: Props) {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [actionIdx, setActionIdx] = useState(0);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [dims, setDims] = useState<Array<{ value: string; label: string }>>([]);
  const [submitting, setSubmitting] = useState(false);

  const action = spec.actions[actionIdx] ?? spec.actions[0];
  const fields = action?.fields ?? [];
  const needDims = fields.some((f) => f.source === 'dimensions');

  useEffect(() => {
    if (!needDims) return;
    axios
      .get<{ items: Array<{ code: string; name: string }> }>('/admin/values/dimensions', {
        headers: { Authorization: `Bearer ${localStorage.getItem('cpm_admin_jwt')}` },
      })
      .then((r) => setDims((r.data.items ?? []).map((d) => ({ value: d.code, label: d.name }))))
      .catch(() => setDims([]));
  }, [needDims]);

  const idKey = spec.columns[0]?.key ?? 'name';
  const allChecked = spec.items.length > 0 && selected.size === spec.items.length;
  const toggle = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const toggleAll = () => setSelected(allChecked ? new Set() : new Set(spec.items.map((i) => Number(i.id))));

  const optsFor = (f: BatchField) => (f.source === 'dimensions' ? dims : (f.options ?? []));
  const canSubmit = useMemo(() => {
    if (submitting || selected.size === 0) return false;
    return fields.every((f) => !f.required || (fieldValues[f.field] ?? '').trim() !== '');
  }, [submitting, selected, fields, fieldValues]);

  const submit = () => {
    if (!canSubmit) return;
    setSubmitting(true);
    const chosen = spec.items.filter((i) => selected.has(Number(i.id)));
    const ids = chosen.map((i) => Number(i.id));
    const names = chosen.map((i) => String(i[idKey] ?? i.id));
    const params = [`${spec.idField}=${ids.join(',')}`, `action=${action.value}`];
    const detail: string[] = [];
    for (const f of fields) {
      const v = (fieldValues[f.field] ?? '').trim();
      if (v === '') continue;
      params.push(`${f.field}=${v}`);
      const optLabel = f.type === 'choice' ? (optsFor(f).find((o) => o.value === v)?.label ?? v) : v;
      detail.push(`${f.label}：${optLabel}`);
    }
    const lines = [
      `【表单回填·${spec.intent}】`,
      `- ${spec.columns[0]?.label ?? '对象'}：${names.join('、')}（${ids.length} 个）`,
      `- 操作：${action.label}${detail.length ? `（${detail.join('，')}）` : ''}`,
      `参数：${params.join('；')}`,
    ];
    onSubmit(lines.join('\n'));
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

      <div style={{ maxHeight: '38vh', overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
          <thead>
            <tr style={{ color: 'var(--cpm-text-tertiary)', textAlign: 'left' }}>
              <th style={{ padding: '8px 10px', width: 32 }}>
                <input type="checkbox" checked={allChecked} onChange={toggleAll} />
              </th>
              {spec.columns.map((c) => (
                <th key={c.key} style={{ padding: '8px 6px' }}>
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {spec.items.length === 0 && (
              <tr>
                <td
                  colSpan={spec.columns.length + 1}
                  style={{ padding: 16, textAlign: 'center', color: 'var(--cpm-text-muted)' }}
                >
                  暂无数据
                </td>
              </tr>
            )}
            {spec.items.map((it) => {
              const id = Number(it.id);
              return (
                <tr key={id} style={{ borderTop: '1px solid var(--cpm-card-border)' }}>
                  <td style={{ padding: '7px 10px' }}>
                    <input type="checkbox" checked={selected.has(id)} onChange={() => toggle(id)} />
                  </td>
                  {spec.columns.map((c, ci) => (
                    <td
                      key={c.key}
                      style={{
                        padding: '7px 6px',
                        color: ci === 0 ? 'var(--cpm-text-primary)' : 'var(--cpm-text-secondary)',
                      }}
                    >
                      {c.key === 'status' ? statusBadge(String(it[c.key] ?? '')) : String(it[c.key] ?? '')}
                    </td>
                  ))}
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
          {spec.actions.length > 1 &&
            spec.actions.map((a, idx) => {
              const active = idx === actionIdx;
              return (
                <button
                  key={a.value}
                  type="button"
                  onClick={() => setActionIdx(idx)}
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
          {spec.actions.length === 1 && (
            <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--cpm-brand-violet)' }}>{action.label}</span>
          )}
        </div>
        {fields.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {fields.map((f) => (
              <div key={f.field} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 12, color: 'var(--cpm-text-secondary)', width: 130, flexShrink: 0 }}>
                  {f.label}
                  {f.required && <span style={{ color: 'var(--cpm-danger)', marginLeft: 2 }}>*</span>}
                </span>
                {f.type === 'choice' ? (
                  <select
                    style={inputStyle}
                    value={fieldValues[f.field] ?? ''}
                    onChange={(e) => setFieldValues((p) => ({ ...p, [f.field]: e.target.value }))}
                  >
                    <option value="">请选择</option>
                    {optsFor(f).map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={f.type === 'number' ? 'number' : 'text'}
                    style={inputStyle}
                    placeholder={f.placeholder ?? ''}
                    value={fieldValues[f.field] ?? ''}
                    onChange={(e) => setFieldValues((p) => ({ ...p, [f.field]: e.target.value }))}
                  />
                )}
              </div>
            ))}
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
          <span style={{ flex: 1, fontSize: 11, color: 'var(--cpm-text-muted)' }}>勾选对象并填好操作后即可提交</span>
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
