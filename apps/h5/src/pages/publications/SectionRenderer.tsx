import type { ActivityRow, HonorRow, LeaderRow, LotteryRow, SectionView, StarWinnerRow, ValueRow } from '@cpm/types';
import { Avatar } from '@cpm/ui';
import type React from 'react';

export function SectionRenderer({ view }: { view: SectionView }) {
  const { section, snapshot, articles } = view;
  return (
    <section style={{ marginBottom: 18 }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--cpm-ink-1)', margin: '0 0 4px' }}>{section.title}</h3>
      {section.aiCopy && (
        <p style={{ fontSize: 12, color: 'var(--cpm-ink-2)', margin: '0 0 10px' }}>{section.aiCopy}</p>
      )}
      {snapshot != null && <SnapshotBody type={section.type} data={snapshot} />}
      {articles?.map((a) => (
        <article key={a.id} style={cardStyle}>
          <div style={{ fontWeight: 600, marginBottom: 4, color: 'var(--cpm-ink-1)', fontSize: 14 }}>{a.title}</div>
          <div
            style={{
              fontSize: 13,
              color: 'var(--cpm-ink-2)',
              whiteSpace: 'pre-wrap',
              lineHeight: 1.7,
              fontFamily: 'var(--cpm-font-sans)',
            }}
          >
            {a.contentHtml}
          </div>
        </article>
      ))}
    </section>
  );
}

const cardStyle: React.CSSProperties = {
  background: 'var(--cpm-surface)',
  borderRadius: 14,
  padding: 12,
  marginBottom: 8,
  border: '1px solid var(--cpm-border-subtle)',
  boxShadow: 'var(--cpm-elev-soft)',
};

function SnapshotBody({ type, data }: { type: string; data: unknown }) {
  switch (type) {
    case 'star': {
      const rows = data as StarWinnerRow[];
      return (
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
          {rows.map((r) => (
            <div key={`${r.userId}-${r.dimension}`} style={{ textAlign: 'center', width: 72 }}>
              <Avatar name={r.name} avatarUrl={r.avatarUrl} size={48} />
              <div style={{ fontSize: 11, marginTop: 4, color: 'var(--cpm-ink-1)', fontWeight: 600 }}>{r.name}</div>
              <div style={{ fontSize: 9, color: 'var(--cpm-ink-2)' }}>{r.dimension}</div>
            </div>
          ))}
        </div>
      );
    }
    case 'leaderboard': {
      const rows = data as LeaderRow[];
      return (
        <ol style={listStyle}>
          {rows.map((r, i) => (
            <li key={r.userId}>
              {i + 1}. {r.name} · {r.score}
            </li>
          ))}
        </ol>
      );
    }
    case 'honors': {
      const rows = data as HonorRow[];
      return (
        <ul style={listStyle}>
          {rows.map((r, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: snapshot rows lack stable id
            <li key={i}>
              🏅 {r.name} · {r.badge}
            </li>
          ))}
        </ul>
      );
    }
    case 'lottery': {
      const rows = data as LotteryRow[];
      return (
        <ul style={listStyle}>
          {rows.map((r, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: snapshot rows lack stable id
            <li key={i}>
              🎁 {r.name} · {r.prize}
            </li>
          ))}
        </ul>
      );
    }
    case 'activity': {
      const rows = data as ActivityRow[];
      return (
        <ul style={listStyle}>
          {rows.map((r) => (
            <li key={r.id}>
              📸 {r.title} · {r.startAt}
            </li>
          ))}
        </ul>
      );
    }
    case 'values': {
      const rows = data as ValueRow[];
      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
          {rows.map((r) => (
            <span
              key={r.dimensionId}
              style={{
                fontSize: 11,
                padding: '4px 10px',
                borderRadius: 16,
                background: r.color ? `${r.color}22` : 'var(--cpm-surface)',
                color: r.color || 'var(--cpm-ink-1)',
                border: '1px solid var(--cpm-border-subtle)',
              }}
            >
              {r.name}
              {r.nominationCount > 0 ? ` · ${r.nominationCount}` : ''}
            </span>
          ))}
        </div>
      );
    }
    default:
      return null;
  }
}

const listStyle: React.CSSProperties = {
  fontSize: 13,
  lineHeight: 1.9,
  color: 'var(--cpm-ink-1)',
  paddingLeft: 0,
  listStyle: 'none',
  margin: '0 0 8px',
  fontFamily: 'var(--cpm-font-sans)',
};
