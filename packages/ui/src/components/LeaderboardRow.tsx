import type { LeaderboardEntry } from '@cpm/types';
import { Avatar } from './Avatar.tsx';
import { TrendIndicator } from './TrendIndicator.tsx';

export interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  highlight?: boolean;
}

const MEDAL_BG: Record<number, string> = {
  1: 'var(--cpm-medal-gold)',
  2: 'var(--cpm-medal-silver)',
  3: 'var(--cpm-medal-bronze)',
};

export function LeaderboardRow({ entry, highlight = false }: LeaderboardRowProps) {
  const medal = MEDAL_BG[entry.rank];
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '11px 12px',
        borderRadius: 16,
        background: highlight ? 'var(--cpm-primary-soft)' : 'var(--cpm-surface)',
        border: highlight ? '1.5px solid #dcd7ff' : '1px solid var(--cpm-border-subtle)',
        boxShadow: 'var(--cpm-elev-soft)',
      }}
    >
      <div
        style={{
          width: 28,
          minWidth: 28,
          height: 28,
          display: 'grid',
          placeItems: 'center',
          borderRadius: medal ? 8 : 0,
          background: medal ?? 'transparent',
          color: medal ? '#fff' : 'var(--cpm-ink-2)',
          fontFamily: 'var(--cpm-font-num)',
          fontWeight: 800,
          fontSize: medal ? 13 : 16,
        }}
      >
        {entry.rank}
      </div>
      <Avatar name={entry.name} avatarUrl={entry.avatarUrl || undefined} size={40} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: 'var(--cpm-font-sans)',
            fontWeight: 600,
            fontSize: 14,
            color: 'var(--cpm-ink-1)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {entry.name}
        </div>
        <div style={{ fontFamily: 'var(--cpm-font-sans)', fontSize: 11, color: 'var(--cpm-ink-2)', marginTop: 1 }}>
          {entry.deptName}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
        <div style={{ fontFamily: 'var(--cpm-font-num)', fontWeight: 800, fontSize: 15, color: 'var(--cpm-gold-ink)' }}>
          {entry.score.toLocaleString('en-US')}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontFamily: 'var(--cpm-font-sans)', fontSize: 10.5, color: 'var(--cpm-ink-2)' }}>
            累计 {(entry.earned ?? 0).toLocaleString('en-US')}
          </span>
          <TrendIndicator value={entry.trend} />
        </div>
      </div>
    </div>
  );
}
