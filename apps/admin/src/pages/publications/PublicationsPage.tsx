import { Button, EmptyState, PageHeader } from '@cpm/ui';
import { useEffect, useState } from 'react';
import { cultureApi } from '../../api/cultureApi';

interface Publication {
  id: number;
  title: string;
  periodCode: string;
  status: string;
}

interface Robot {
  id: string;
  name: string;
}

const SECTION_TYPES = [
  { type: 'editorial', title: '刊首语' },
  { type: 'star', title: '星标公示' },
  { type: 'values', title: '价值观专区' },
  { type: 'honors', title: '获奖公示' },
  { type: 'lottery', title: '中奖公示' },
  { type: 'activity', title: '活动回顾' },
  { type: 'leaderboard', title: '文化分榜' },
  { type: 'innovation', title: '创新项目' },
  { type: 'custom', title: '自定义' },
];

function statusLabel(s: string): string {
  return { draft: '草稿', published: '已发布', archived: '已归档' }[s] ?? s;
}

export function PublicationsPage() {
  const [list, setList] = useState<Publication[]>([]);
  const [cur, setCur] = useState<Publication | null>(null);
  const [robots, setRobots] = useState<Robot[]>([]);
  const [picked, setPicked] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(SECTION_TYPES.map((s) => [s.type, true])),
  );
  const [msg, setMsg] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', periodCode: '' });

  useEffect(() => {
    cultureApi
      .listPublications()
      .then((items: Publication[]) => setList(items))
      .catch(() => {});
    cultureApi
      .robots()
      .then((items: Robot[]) => setRobots(items))
      .catch(() => {});
  }, []);

  const reload = () =>
    cultureApi
      .listPublications()
      .then((items: Publication[]) => setList(items))
      .catch(() => {});

  const create = async () => {
    if (!form.title || !form.periodCode) return;
    try {
      await cultureApi.createPublication(form);
      setForm({ title: '', periodCode: '' });
      reload();
    } catch {
      setMsg('新建失败');
    }
  };

  const saveSections = async () => {
    if (!cur) return;
    const sections = SECTION_TYPES.filter((s) => picked[s.type]).map((s, i) => ({
      type: s.type,
      title: s.title,
      sortOrder: i,
      visible: true,
    }));
    try {
      await cultureApi.configureSections(cur.id, sections);
      setMsg('栏目已保存');
    } catch {
      setMsg('保存栏目失败');
    }
  };

  const act = async (fn: () => Promise<unknown>, ok: string) => {
    try {
      await fn();
      setMsg(ok);
      reload();
    } catch (e: unknown) {
      const status = (e as { response?: { status?: number } })?.response?.status;
      setMsg(status === 503 ? 'AI 暂未开启' : '操作失败');
    }
  };

  if (cur) {
    return (
      <div>
        <PageHeader
          title={`编排 · ${cur.title}`}
          subtitle={cur.periodCode}
          action={
            <Button tone="secondary" onClick={() => setCur(null)}>
              ← 返回列表
            </Button>
          }
        />

        <section style={panel}>
          <h4 style={sectionTitle}>1 配栏目</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
            {SECTION_TYPES.map((s) => (
              <label key={s.type} style={checkLabel}>
                <input
                  type="checkbox"
                  checked={!!picked[s.type]}
                  onChange={(e) => setPicked((p) => ({ ...p, [s.type]: e.target.checked }))}
                />
                <span style={{ marginLeft: 4 }}>{s.title}</span>
              </label>
            ))}
          </div>
          <Button tone="secondary" onClick={saveSections}>
            保存栏目
          </Button>
        </section>

        <section style={panel}>
          <h4 style={sectionTitle}>2 聚合 &amp; AI</h4>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Button tone="secondary" onClick={() => act(() => cultureApi.aggregate(cur.id), '已聚合快照')}>
              聚合当期数据
            </Button>
            <Button tone="secondary" onClick={() => act(() => cultureApi.aiCompose(cur.id), 'AI 已生成刊首语/导语')}>
              ✍️ AI 一键编排
            </Button>
            <Button tone="secondary" onClick={() => act(() => cultureApi.aiCases(cur.id), 'AI 已生成案例')}>
              🔍 生成案例
            </Button>
          </div>
        </section>

        <section style={panel}>
          <h4 style={sectionTitle}>3 发布 &amp; 推送</h4>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Button tone="primary" onClick={() => act(() => cultureApi.publish(cur.id), '已发布')}>
              发布
            </Button>
            {robots.map((r) => (
              <Button
                key={r.id}
                tone="secondary"
                onClick={() => act(() => cultureApi.pushDingtalk(cur.id, r.id), `已推送「${r.name}」`)}
              >
                推「{r.name}」
              </Button>
            ))}
          </div>
        </section>

        {msg && <div style={{ color: 'var(--cpm-brand-violet, #7c3aed)', marginTop: 8, fontSize: 13 }}>{msg}</div>}
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="文化刊" subtitle="编排发布" />
      <div style={{ display: 'flex', gap: 8, margin: '12px 0', flexWrap: 'wrap' }}>
        <input
          placeholder="标题 如 2026 Q1 文化刊"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          style={inp}
        />
        <input
          placeholder="periodCode 如 2026Q1"
          value={form.periodCode}
          onChange={(e) => setForm({ ...form, periodCode: e.target.value })}
          style={inp}
        />
        <Button tone="primary" onClick={create}>
          新建一期
        </Button>
      </div>
      {list.length === 0 && <EmptyState icon="📰" title="还没有刊物" />}
      {list.map((p) => (
        <button
          key={p.id}
          type="button"
          style={cardBtn}
          onClick={() => {
            setMsg(null);
            setCur(p);
          }}
        >
          <b>{p.title}</b> <span style={badge}>{statusLabel(p.status)}</span>{' '}
          <span style={{ fontSize: 12, color: '#999' }}>{p.periodCode}</span>
        </button>
      ))}
      {msg && <div style={{ marginTop: 8, fontSize: 13 }}>{msg}</div>}
    </div>
  );
}

const inp: React.CSSProperties = {
  padding: 8,
  borderRadius: 8,
  border: '1px solid var(--cpm-border-subtle, #ddd)',
  fontSize: 13,
  minWidth: 180,
};
const panel: React.CSSProperties = {
  background: 'var(--cpm-surface, #fff)',
  border: '1px solid var(--cpm-card-border, #eee)',
  borderRadius: 12,
  padding: 14,
  marginBottom: 12,
};
const sectionTitle: React.CSSProperties = {
  margin: '0 0 10px 0',
  fontSize: 14,
  fontWeight: 600,
  color: 'var(--cpm-text-primary)',
};
const cardBtn: React.CSSProperties = {
  display: 'block',
  width: '100%',
  textAlign: 'left',
  background: 'var(--cpm-surface, #fff)',
  border: '1px solid var(--cpm-card-border, #eee)',
  borderRadius: 12,
  padding: 12,
  marginBottom: 10,
  cursor: 'pointer',
  fontSize: 14,
};
const badge: React.CSSProperties = {
  fontSize: 11,
  padding: '2px 8px',
  borderRadius: 12,
  background: 'var(--cpm-surface-2, #f3f3f3)',
};
const checkLabel: React.CSSProperties = {
  fontSize: 13,
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
};
