import { Button } from '@cpm/ui';
import axios from 'axios';
import { motion } from 'framer-motion';
import { type CSSProperties, useEffect, useMemo, useState } from 'react';

// SlotForm 是 HR-Agent「对话式收集信息」的统一渲染器，吃后端 ask_user / open_*_form 工具发出的
// {form:"slot_form", ...} 信号。choice→可点击选项/下拉/多选，text/number→填空，datetime→时间选择器；
// source 字段（users/dimensions/robots）自动从既有 admin 接口拉候选。提交后把答案拼成一段
// 「表单回填·<intent>」结构化文本，作为新一轮消息发回 /admin/agent/chat，由 LLM 据此执行真正的操作。

export interface SlotFieldOption {
  value: string;
  label: string;
  disabled?: boolean;
}
export interface SlotField {
  field: string;
  label: string;
  type: 'choice' | 'text' | 'number' | 'datetime';
  options?: Array<SlotFieldOption | string>;
  source?: 'users' | 'dimensions' | 'robots' | 'rooms';
  valueKey?: 'id' | 'ding'; // users 源取哪个值：默认 id；钉钉日程的参与人用 ding（即 ding_user_id）
  multi?: boolean;
  allowAll?: boolean; // users 多选时提供「全体人员」
  required?: boolean;
  placeholder?: string;
}
export interface SlotFormSpec {
  title: string;
  intent?: string;
  source?: string;
  fields: SlotField[];
  prefill?: Record<string, unknown>;
}

interface Props {
  spec: SlotFormSpec;
  onSubmit: (text: string) => void;
  onCancel: () => void;
}

const ALL = '__ALL__'; // 「全体人员」哨兵值
const SOURCE_ENDPOINT: Record<string, string> = {
  users: '/admin/users',
  dimensions: '/admin/values/dimensions',
  robots: '/admin/dingtalk/robots',
  rooms: '/admin/dingtalk/meeting-rooms',
};

function normalizeOptions(opts?: Array<SlotFieldOption | string>): SlotFieldOption[] {
  if (!Array.isArray(opts)) return [];
  return opts
    .map((o) => (typeof o === 'string' ? { value: o, label: o } : o))
    .filter((o) => o && o.value !== undefined);
}

// ISO/可解析时间字符串 → datetime-local 输入框的值（本地时区，YYYY-MM-DDTHH:MM）
function toLocalInput(v?: unknown): string {
  if (typeof v !== 'string' || !v) return '';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '';
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

// datetime-local 值 → 带本地时区偏移的 RFC3339（如 2025-03-20T14:00:00+08:00），保证下游不偏时区
function toRFC3339Local(v: string): string {
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  const p = (n: number) => String(n).padStart(2, '0');
  const off = -d.getTimezoneOffset();
  const sign = off >= 0 ? '+' : '-';
  const oh = p(Math.floor(Math.abs(off) / 60));
  const om = p(Math.abs(off) % 60);
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:00${sign}${oh}:${om}`;
}

const labelStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: 'var(--cpm-text-secondary)',
  marginBottom: 5,
  display: 'block',
};
const inputStyle: CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  borderRadius: 9,
  border: '1.5px solid var(--cpm-card-border-strong)',
  background: 'var(--cpm-bg-0)',
  fontSize: 13,
  color: 'var(--cpm-text-primary)',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'var(--cpm-font-sans)',
};

type ValueMap = Record<string, string | string[]>;
type RawItem = Record<string, unknown>;

export function SlotForm({ spec, onSubmit, onCancel }: Props) {
  // 各 source 拉到的原始行（users 需要 id + dingUserId，按字段 valueKey 取值）
  const [sourceItems, setSourceItems] = useState<Record<string, RawItem[]>>({});
  const [values, setValues] = useState<ValueMap>(() => {
    const init: ValueMap = {};
    for (const f of spec.fields) {
      const pv = spec.prefill?.[f.field];
      if (pv !== undefined && pv !== null) {
        if (f.type === 'datetime') init[f.field] = toLocalInput(pv);
        else init[f.field] = Array.isArray(pv) ? pv.map(String) : String(pv);
        continue;
      }
      // 成员多选 + 允许全体：默认「全体人员」
      if (f.type === 'choice' && f.source === 'users' && f.multi && f.allowAll) init[f.field] = [ALL];
    }
    return init;
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const sources = Array.from(new Set(spec.fields.map((f) => f.source).filter(Boolean))) as string[];
    if (sources.length === 0) return;
    const headers = { Authorization: `Bearer ${localStorage.getItem('cpm_admin_jwt')}` };
    for (const src of sources) {
      const url = SOURCE_ENDPOINT[src];
      if (!url) continue;
      axios
        .get<{ items: RawItem[] }>(url, { headers })
        .then((r) => setSourceItems((prev) => ({ ...prev, [src]: r.data.items ?? [] })))
        .catch(() => setSourceItems((prev) => ({ ...prev, [src]: [] })));
    }
  }, [spec]);

  const optionsFor = (f: SlotField): SlotFieldOption[] => {
    if (f.source === 'users') {
      const items = sourceItems.users ?? [];
      return items
        .map((it) => ({
          value: f.valueKey === 'ding' ? String(it.dingUserId ?? '') : String(it.id),
          label: `${String(it.name)}${it.dingUserId ? '' : '（未绑定钉钉）'}`,
          disabled: f.valueKey === 'ding' && !it.dingUserId,
        }))
        .filter((o) => o.value !== ''); // valueKey=ding 时丢掉没绑定钉钉的人（无法邀约）
    }
    if (f.source === 'dimensions')
      return (sourceItems.dimensions ?? []).map((it) => ({ value: String(it.code), label: String(it.name) }));
    if (f.source === 'robots')
      return (sourceItems.robots ?? []).map((it) => ({ value: String(it.id), label: String(it.name ?? it.id) }));
    if (f.source === 'rooms')
      return (sourceItems.rooms ?? []).map((it) => ({
        value: String(it.roomId),
        label: `${String(it.roomName)}${it.capacity ? `（${it.capacity}人）` : ''}`,
      }));
    return normalizeOptions(f.options);
  };

  const canSubmit = useMemo(() => {
    if (submitting) return false;
    return spec.fields.every((f) => {
      if (!f.required) return true;
      const v = values[f.field];
      if (Array.isArray(v)) return v.length > 0;
      return v !== undefined && String(v).trim() !== '';
    });
  }, [spec.fields, values, submitting]);

  const setVal = (field: string, v: string | string[]) => setValues((prev) => ({ ...prev, [field]: v }));
  const toggleMulti = (field: string, v: string) => {
    setValues((prev) => {
      const cur = Array.isArray(prev[field]) ? (prev[field] as string[]).filter((x) => x !== ALL) : [];
      return { ...prev, [field]: cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v] };
    });
  };

  const submit = () => {
    if (!canSubmit) return;
    setSubmitting(true);
    const lines: string[] = [];
    const params: string[] = [];
    for (const f of spec.fields) {
      const raw = values[f.field];
      if (raw === undefined || (Array.isArray(raw) && raw.length === 0) || raw === '') continue;
      const opts = optionsFor(f);
      const labelOf = (val: string) => opts.find((o) => o.value === val)?.label ?? val;

      if (f.type === 'datetime') {
        const v = raw as string;
        lines.push(`- ${f.label}：${v.replace('T', ' ')}`);
        params.push(`${f.field}=${toRFC3339Local(v)}`);
      } else if (Array.isArray(raw)) {
        if (raw.includes(ALL)) {
          const all = opts.map((o) => o.value);
          lines.push(`- ${f.label}：全体人员（${all.length} 人）`);
          params.push(`${f.field}=${all.join(',')}`);
        } else {
          lines.push(`- ${f.label}：${raw.map(labelOf).join('、')}`);
          params.push(`${f.field}=${raw.join(',')}`);
        }
      } else {
        lines.push(`- ${f.label}：${f.type === 'choice' ? labelOf(raw) : raw}`);
        params.push(`${f.field}=${raw}`);
      }
    }
    const head = spec.intent ? `【表单回填·${spec.intent}】` : '【我的回答】';
    onSubmit(`${head}\n${lines.join('\n')}\n参数：${params.join('；')}`);
  };

  const renderField = (f: SlotField) => {
    if (f.type === 'datetime') {
      return (
        <input
          type="datetime-local"
          style={inputStyle}
          value={(values[f.field] as string) ?? ''}
          onChange={(e) => setVal(f.field, e.target.value)}
        />
      );
    }
    if (f.type === 'text' || f.type === 'number') {
      return (
        <input
          style={inputStyle}
          type={f.type === 'number' ? 'number' : 'text'}
          value={(values[f.field] as string) ?? ''}
          placeholder={f.placeholder ?? ''}
          onChange={(e) => setVal(f.field, e.target.value)}
        />
      );
    }
    // choice
    const opts = optionsFor(f);
    // 成员多选 + 全体：全体/指定人员 二选一，指定时展开成员勾选
    if (f.multi && f.source === 'users' && f.allowAll) {
      const cur = (Array.isArray(values[f.field]) ? values[f.field] : []) as string[];
      const isAll = cur.includes(ALL);
      return (
        <div>
          <div style={{ display: 'flex', gap: 14, marginBottom: isAll ? 0 : 8 }}>
            <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
              <input type="radio" checked={isAll} onChange={() => setVal(f.field, [ALL])} /> 全体人员
            </label>
            <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
              <input type="radio" checked={!isAll} onChange={() => setVal(f.field, [])} /> 指定人员
            </label>
          </div>
          {!isAll && (
            <div
              style={{
                maxHeight: 140,
                overflowY: 'auto',
                border: '1px solid var(--cpm-card-border)',
                borderRadius: 9,
                padding: 8,
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
            >
              {opts.length === 0 && <span style={{ fontSize: 12, color: 'var(--cpm-text-muted)' }}>暂无可选成员</span>}
              {opts.map((o) => (
                <label
                  key={o.value}
                  style={{ fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
                >
                  <input
                    type="checkbox"
                    checked={cur.includes(o.value)}
                    onChange={() => toggleMulti(f.field, o.value)}
                  />
                  {o.label}
                </label>
              ))}
            </div>
          )}
        </div>
      );
    }
    if (f.multi) {
      const cur = (Array.isArray(values[f.field]) ? values[f.field] : []) as string[];
      return (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            maxHeight: 140,
            overflowY: 'auto',
            border: opts.length > 0 ? '1px solid var(--cpm-card-border)' : 'none',
            borderRadius: 9,
            padding: opts.length > 0 ? 8 : 0,
          }}
        >
          {opts.length === 0 && <span style={{ fontSize: 12, color: 'var(--cpm-text-muted)' }}>暂无可选项</span>}
          {opts.map((o) => (
            <label
              key={o.value}
              style={{ fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}
            >
              <input type="checkbox" checked={cur.includes(o.value)} onChange={() => toggleMulti(f.field, o.value)} />
              {o.label}
            </label>
          ))}
        </div>
      );
    }
    // 单选：source 候选（可能很长）用下拉，内联候选用按钮组（更像选择题）
    if (f.source) {
      return (
        <select
          style={inputStyle}
          value={(values[f.field] as string) ?? ''}
          onChange={(e) => setVal(f.field, e.target.value)}
        >
          <option value="">{f.source === 'rooms' ? '不预定会议室' : '请选择'}</option>
          {opts.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
    }
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {opts.length === 0 && <span style={{ fontSize: 12, color: 'var(--cpm-text-muted)' }}>暂无可选项</span>}
        {opts.map((o) => {
          const active = values[f.field] === o.value;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => setVal(f.field, o.value)}
              style={{
                padding: '7px 14px',
                borderRadius: 9,
                border: `1.5px solid ${active ? 'var(--cpm-brand-violet)' : 'var(--cpm-card-border-strong)'}`,
                background: active ? 'var(--cpm-brand-violet)' : 'var(--cpm-bg-0)',
                color: active ? '#fff' : 'var(--cpm-text-primary)',
                fontSize: 13,
                fontWeight: active ? 600 : 500,
                cursor: 'pointer',
                fontFamily: 'var(--cpm-font-sans)',
                transition: 'all 0.15s',
              }}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 280, damping: 24 }}
      style={{
        alignSelf: 'flex-start',
        width: '100%',
        maxWidth: 460,
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
        💬 {spec.title}
      </div>

      <div
        style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14, maxHeight: '46vh', overflowY: 'auto' }}
      >
        {spec.fields.map((f) => (
          <div key={f.field}>
            <div style={labelStyle}>
              {f.label}
              {f.required && <span style={{ color: 'var(--cpm-danger)', marginLeft: 3 }}>*</span>}
            </div>
            {renderField(f)}
          </div>
        ))}
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
          <span style={{ flex: 1, fontSize: 11, color: 'var(--cpm-text-muted)' }}>填好带 * 的必填项后即可提交</span>
        )}
        <Button tone="ghost" size="sm" onClick={onCancel} disabled={submitting}>
          取消
        </Button>
        <Button tone="primary" size="sm" onClick={submit} disabled={!canSubmit}>
          {submitting ? '提交中…' : '提交'}
        </Button>
      </div>
    </motion.div>
  );
}
