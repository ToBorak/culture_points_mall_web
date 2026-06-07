import { Button, EmptyState, PageHeader } from '@cpm/ui';
import { useEffect, useState } from 'react';
import { cultureApi } from '../../api/cultureApi';

interface Season {
  id: number;
  name: string;
  quarterCode: string;
  status: string;
}

interface Nomination {
  ID: number;
  NomineeID: number;
  DimensionID: number;
  CaseText: string;
  CaseRefined?: string | null;
  Score?: number | null;
  Status: string;
}

const inp: React.CSSProperties = {
  padding: 8,
  borderRadius: 8,
  border: '1px solid var(--cpm-border-subtle,#ddd)',
  fontSize: 13,
};
const card: React.CSSProperties = {
  background: 'var(--cpm-surface,#fff)',
  border: '1px solid var(--cpm-border-subtle,#eee)',
  borderRadius: 12,
  padding: 12,
  marginBottom: 10,
  cursor: 'pointer',
};
const badge: React.CSSProperties = {
  fontSize: 11,
  padding: '2px 8px',
  borderRadius: 12,
  background: 'var(--cpm-surface-2,#f3f3f3)',
};

function statusLabel(s: string): string {
  return (
    (
      {
        nominating: '提报中',
        judging: '评审中',
        published: '已公示',
        closed: '已结束',
        submitted: '已提交',
        selected: '当选',
        shortlisted: '入围',
        rejected: '未选',
        duplicate: '重复',
      } as Record<string, string>
    )[s] ?? s
  );
}

function nextStatus(s: string): string | null {
  return ({ nominating: 'judging', judging: 'published', published: 'closed' } as Record<string, string>)[s] ?? null;
}

function NominationRow({
  n,
  disabled,
  onScore,
  checked,
  onCheck,
}: {
  n: Nomination;
  disabled: boolean;
  onScore: (n: Nomination, v: number) => void;
  checked: boolean;
  onCheck: (id: number, checked: boolean) => void;
}) {
  const [v, setV] = useState<string>(n.Score != null ? String(n.Score) : '');
  return (
    <div style={card}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onCheck(n.ID, e.target.checked)}
          style={{ marginTop: 2 }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13 }}>{n.CaseRefined || n.CaseText}</div>
          <div style={{ fontSize: 11, color: 'var(--cpm-ink-2,#888)', marginTop: 4 }}>
            被提名人#{n.NomineeID} · 维度#{n.DimensionID} · {statusLabel(n.Status)}
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
            <input
              type="number"
              value={v}
              onChange={(e) => setV(e.target.value)}
              disabled={disabled}
              placeholder="分"
              style={{ ...inp, width: 80 }}
            />
            <Button onClick={() => onScore(n, Number(v))} disabled={disabled || v === ''} size="sm">
              打分
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function StarsPage() {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [sel, setSel] = useState<Season | null>(null);
  const [noms, setNoms] = useState<Nomination[]>([]);
  const [name, setName] = useState('');
  const [qc, setQc] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  const reload = () =>
    cultureApi
      .listSeasons()
      .then(setSeasons)
      .catch(() => {});

  // biome-ignore lint/correctness/useExhaustiveDependencies: reload is stable per mount
  useEffect(() => {
    reload();
  }, []);

  useEffect(() => {
    if (sel) {
      cultureApi
        .listNominations(sel.id)
        .then(setNoms)
        .catch(() => setNoms([]));
    }
  }, [sel]);

  const create = async () => {
    if (!name || !qc) return;
    await cultureApi.createSeason({ name, quarterCode: qc });
    setName('');
    setQc('');
    reload();
  };

  const advance = async (s: Season, next: string) => {
    await cultureApi.advanceSeason(s.id, next);
    reload();
    setSel({ ...s, status: next });
  };

  const score = async (n: Nomination, v: number) => {
    if (!sel) return;
    try {
      await cultureApi.scoreNomination(sel.id, n.ID, v);
      cultureApi
        .listNominations(sel.id)
        .then(setNoms)
        .catch(() => {});
    } catch {
      setMsg('打分失败（季次需处于评审阶段）');
    }
  };

  return (
    <div>
      <PageHeader title="文化星标" subtitle="季度评选" />
      {/* 建季次 */}
      <div style={{ display: 'flex', gap: 8, margin: '12px 0' }}>
        <input placeholder="季次名 如 2026 Q1" value={name} onChange={(e) => setName(e.target.value)} style={inp} />
        <input placeholder="quarterCode 如 2026Q1" value={qc} onChange={(e) => setQc(e.target.value)} style={inp} />
        <Button tone="primary" onClick={create}>
          新建季次
        </Button>
      </div>
      {/* 季次列表 */}
      {seasons.length === 0 && <EmptyState icon="⭐" title="还没有季次" />}
      {seasons.map((s) => (
        <button
          key={s.id}
          type="button"
          style={{ ...card, width: '100%', textAlign: 'left' }}
          onClick={() => setSel(s)}
        >
          <b>{s.name}</b> <span style={badge}>{statusLabel(s.status)}</span>
          <div style={{ marginTop: 6, display: 'flex', gap: 6 }}>
            {nextStatus(s.status) && (
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  advance(s, nextStatus(s.status) as string);
                }}
              >
                {`→ ${statusLabel(nextStatus(s.status) as string)}`}
              </Button>
            )}
          </div>
        </button>
      ))}
      {/* 评审台 */}
      {sel && <StarsJudgingPanel sel={sel} noms={noms} setNoms={setNoms} msg={msg} setMsg={setMsg} onScore={score} />}
      {!sel && msg && <div style={{ color: '#ef4444', marginTop: 8 }}>{msg}</div>}
    </div>
  );
}

function StarsJudgingPanel({
  sel,
  noms,
  setNoms,
  msg,
  setMsg,
  onScore,
}: {
  sel: Season;
  noms: Nomination[];
  setNoms: (noms: Nomination[]) => void;
  msg: string | null;
  setMsg: (msg: string | null) => void;
  onScore: (n: Nomination, v: number) => void;
}) {
  const [digest, setDigest] = useState<{ summary: string; duplicates: string[] } | null>(null);
  const [picks, setPicks] = useState<Record<number, boolean>>({});

  const disabled = sel.status !== 'judging';

  const runDigest = async () => {
    try {
      setDigest(await cultureApi.aiDigest(sel.id));
    } catch (e: unknown) {
      const err = e as { response?: { status?: number } };
      setMsg(err?.response?.status === 503 ? 'AI 暂未开启' : '生成失败');
    }
  };

  const confirmSelect = async () => {
    const chosen = noms
      .filter((n) => picks[n.ID])
      .map((n) => ({ userId: n.NomineeID, dimensionId: n.DimensionID, sourceNominationId: n.ID }));
    if (chosen.length === 0) {
      setMsg('请先勾选当选提名');
      return;
    }
    try {
      await cultureApi.selectWinners(sel.id, chosen);
      setMsg(`已定榜 ${chosen.length} 位`);
      cultureApi
        .listNominations(sel.id)
        .then(setNoms)
        .catch(() => {});
    } catch {
      setMsg('定榜失败');
    }
  };

  return (
    <div style={{ marginTop: 18 }}>
      <h3>
        评审台 · {sel.name}（{statusLabel(sel.status)}）
      </h3>
      {/* AI 摘要 + 定榜操作区 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <Button size="sm" onClick={runDigest} disabled={disabled}>
          🧮 AI 评审摘要
        </Button>
      </div>
      {digest && (
        <div
          style={{
            background: 'var(--cpm-surface-2,#f9f9f9)',
            border: '1px solid #eee',
            borderRadius: 10,
            padding: 12,
            marginBottom: 12,
            fontSize: 13,
          }}
        >
          <b>AI 摘要：</b>
          {digest.summary}
          {digest.duplicates?.length > 0 && (
            <div style={{ marginTop: 6, color: '#d97706' }}>疑似重复：{digest.duplicates.join('、')}</div>
          )}
        </div>
      )}
      {noms.length === 0 && <EmptyState icon="📝" title="本季暂无提报" />}
      {noms.map((n) => (
        <NominationRow
          key={n.ID}
          n={n}
          disabled={disabled}
          onScore={onScore}
          checked={!!picks[n.ID]}
          onCheck={(id, checked) => setPicks((p) => ({ ...p, [id]: checked }))}
        />
      ))}
      {!disabled && noms.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <Button tone="primary" onClick={confirmSelect}>
            确认定榜
          </Button>
        </div>
      )}
      {msg && <div style={{ color: '#ef4444', marginTop: 8 }}>{msg}</div>}
    </div>
  );
}
