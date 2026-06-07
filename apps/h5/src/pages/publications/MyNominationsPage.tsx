import { useCurrentSeason, useMyNominations } from '@cpm/api-client';
import type { Nomination } from '@cpm/types';
import { EmptyState, PageHeader } from '@cpm/ui';
import type React from 'react';

export function MyNominationsPage() {
  const seasonQ = useCurrentSeason();
  const seasonId = seasonQ.data?.season?.id ?? 0;
  const q = useMyNominations(seasonId);

  if (seasonQ.isLoading || q.isLoading) {
    return <div style={{ padding: 24, fontFamily: 'var(--cpm-font-sans)', color: 'var(--cpm-ink-2)' }}>加载中…</div>;
  }

  const submitted = q.data?.submitted ?? [];
  const received = q.data?.received ?? [];

  return (
    <div style={shellStyle}>
      <PageHeader title="我的提报" subtitle={seasonQ.data?.season?.name} />

      <h3 style={h3}>我提报的（{submitted.length}）</h3>
      {submitted.length === 0 ? (
        <EmptyState icon="✍️" title="还没提报过" />
      ) : (
        submitted.map((n) => <NominationRow key={n.ID} n={n} />)
      )}

      <h3 style={h3}>我被提名的（{received.length}）</h3>
      {received.length === 0 ? (
        <EmptyState icon="🌟" title="还没被提名" />
      ) : (
        received.map((n) => <NominationRow key={n.ID} n={n} />)
      )}
    </div>
  );
}

function NominationRow({ n }: { n: Nomination }) {
  return (
    <div
      style={{
        background: 'var(--cpm-surface)',
        border: '1px solid var(--cpm-border-subtle)',
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
        boxShadow: 'var(--cpm-elev-soft)',
        fontFamily: 'var(--cpm-font-sans)',
      }}
    >
      <div style={{ fontSize: 13, whiteSpace: 'pre-wrap', color: 'var(--cpm-ink-1)', lineHeight: 1.65 }}>
        {n.CaseRefined || n.CaseText}
      </div>
      <div style={{ fontSize: 11, color: 'var(--cpm-ink-2)', marginTop: 6 }}>状态：{statusLabel(n.Status)}</div>
    </div>
  );
}

function statusLabel(s: string): string {
  const map: Record<string, string> = {
    submitted: '已提交',
    shortlisted: '入围',
    selected: '当选星标',
    rejected: '未入选',
    duplicate: '重复',
  };
  return map[s] ?? s;
}

const shellStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: 640,
  margin: '0 auto',
  boxSizing: 'border-box',
  padding: '12px 16px 80px',
  fontFamily: 'var(--cpm-font-sans)',
};

const h3: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  margin: '16px 0 8px',
  color: 'var(--cpm-ink-1)',
  fontFamily: 'var(--cpm-font-sans)',
};
