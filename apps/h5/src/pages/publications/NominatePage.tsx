import { useAiDraftCase, useCurrentSeason, useDimensions, useNominate } from '@cpm/api-client';
import { PageHeader } from '@cpm/ui';
import { Sparkles } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function NominatePage() {
  const nav = useNavigate();
  const seasonQ = useCurrentSeason();
  const dimsQ = useDimensions();
  const nominate = useNominate();
  const aiDraft = useAiDraftCase();

  const [dimId, setDimId] = useState<number>(0);
  const [nomineeId, setNomineeId] = useState<string>(''); // 空=自荐
  const [caseText, setCaseText] = useState('');
  const [err, setErr] = useState<string | null>(null);

  const season = seasonQ.data?.season;
  // useDimensions 返回 Dimension[] 直接
  const dims = dimsQ.data ?? [];
  const dimName = dims.find((d) => d.id === dimId)?.name ?? '';

  if (seasonQ.isLoading) {
    return <div style={{ padding: 24, fontFamily: 'var(--cpm-font-sans)', color: 'var(--cpm-ink-2)' }}>加载中…</div>;
  }

  if (!season) {
    return (
      <div style={{ padding: 24, fontFamily: 'var(--cpm-font-sans)', color: 'var(--cpm-ink-2)' }}>
        当前没有开放提报的季次
      </div>
    );
  }

  const onAiDraft = () => {
    if (!dimName) {
      setErr('请先选价值观');
      return;
    }
    setErr(null);
    aiDraft.mutate(
      { dimensionName: dimName, hint: caseText || '请根据该价值观写一段示例' },
      {
        onSuccess: (r) => setCaseText(r.draft),
        onError: (e: unknown) => {
          const axiosErr = e as { response?: { status?: number } };
          setErr(axiosErr?.response?.status === 503 ? 'AI 暂未开启' : '生成失败');
        },
      },
    );
  };

  const onSubmit = () => {
    if (!dimId || !caseText.trim()) {
      setErr('请选价值观并填写案例');
      return;
    }
    setErr(null);
    nominate.mutate(
      {
        seasonId: season.id,
        dimensionId: dimId,
        caseText,
        nomineeId: nomineeId ? Number(nomineeId) : undefined,
      },
      {
        onSuccess: () => nav('/publications/mine'),
        onError: (e: unknown) => {
          const axiosErr = e as { response?: { data?: { error?: string } } };
          setErr(axiosErr?.response?.data?.error ?? '提交失败');
        },
      },
    );
  };

  return (
    <div style={shellStyle}>
      <PageHeader
        title="提报星标"
        subtitle={`${season.name} · 本月还可得 ${seasonQ.data?.nominateRemaining ?? 0} 分`}
      />

      <label htmlFor="nomineeId" style={lbl}>
        提报对象（留空=自荐）
      </label>
      <input
        id="nomineeId"
        value={nomineeId}
        onChange={(e) => setNomineeId(e.target.value)}
        placeholder="同事 ID，自荐留空"
        style={inp}
      />

      {/* biome-ignore lint/a11y/noLabelWithoutControl: chips group, not a single input */}
      <label style={lbl}>践行的价值观</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {dims.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => setDimId(d.id)}
            style={{ ...chip, ...(dimId === d.id ? chipActive : {}) }}
          >
            {d.name}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '14px 0 5px' }}>
        <label htmlFor="caseText" style={{ ...lbl, margin: 0 }}>
          案例描述
        </label>
        <button type="button" onClick={onAiDraft} disabled={aiDraft.isPending} style={aiBtn}>
          <Sparkles size={13} />
          {aiDraft.isPending ? '生成中…' : 'AI 帮我写'}
        </button>
      </div>
      <textarea
        id="caseText"
        value={caseText}
        onChange={(e) => setCaseText(e.target.value)}
        rows={5}
        placeholder="说一两句他做了啥…"
        style={{ ...inp, minHeight: 96, resize: 'vertical' }}
      />

      {err && (
        <div style={{ color: '#ef4444', fontSize: 12, marginTop: 8, fontFamily: 'var(--cpm-font-sans)' }}>{err}</div>
      )}

      <button type="button" onClick={onSubmit} disabled={nominate.isPending} style={submitBtn}>
        {nominate.isPending ? '提交中…' : '提交提报'}
      </button>
    </div>
  );
}

const shellStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: 640,
  margin: '0 auto',
  boxSizing: 'border-box',
  padding: '12px 16px 80px',
  fontFamily: 'var(--cpm-font-sans)',
};

const lbl: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  color: 'var(--cpm-ink-2)',
  margin: '14px 0 5px',
};

const inp: React.CSSProperties = {
  width: '100%',
  padding: 10,
  borderRadius: 10,
  border: '1px solid var(--cpm-border-subtle)',
  background: 'var(--cpm-surface)',
  color: 'var(--cpm-ink-1)',
  fontSize: 13,
  fontFamily: 'var(--cpm-font-sans)',
  boxSizing: 'border-box',
};

const chip: React.CSSProperties = {
  fontSize: 12,
  padding: '6px 12px',
  borderRadius: 16,
  border: '1px solid var(--cpm-border-subtle)',
  background: 'var(--cpm-surface)',
  color: 'var(--cpm-ink-1)',
  cursor: 'pointer',
  fontFamily: 'var(--cpm-font-sans)',
};

const chipActive: React.CSSProperties = {
  background: 'var(--cpm-primary)',
  color: 'var(--cpm-on-primary)',
  borderColor: 'transparent',
};

const aiBtn: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  fontSize: 11,
  padding: '4px 10px',
  borderRadius: 14,
  border: 'none',
  color: '#fff',
  background: 'linear-gradient(135deg,#a855f7,#4f7cff)',
  cursor: 'pointer',
  fontFamily: 'var(--cpm-font-sans)',
  fontWeight: 700,
};

const submitBtn: React.CSSProperties = {
  width: '100%',
  marginTop: 16,
  padding: 13,
  borderRadius: 12,
  border: 'none',
  background: 'var(--cpm-primary)',
  color: 'var(--cpm-on-primary)',
  fontWeight: 700,
  fontSize: 14,
  cursor: 'pointer',
  fontFamily: 'var(--cpm-font-sans)',
  boxShadow: 'var(--cpm-elev-candy)',
};
