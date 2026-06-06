import type { LeaderboardEntry } from '@cpm/types';
import { Crown, Trophy } from 'lucide-react';
import { Avatar } from './Avatar.tsx';

export interface PodiumTop3Props {
  entries: LeaderboardEntry[];
}

function Column({ entry, place }: { entry: LeaderboardEntry | undefined; place: 1 | 2 | 3 }) {
  if (!entry) return <div style={{ width: 78 }} />;
  const isFirst = place === 1;
  const size = isFirst ? 62 : 52;
  const baseH = isFirst ? 72 : place === 2 ? 52 : 40;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, width: 78 }}>
      {isFirst && <Crown size={22} style={{ color: '#fff' }} />}
      <Avatar name={entry.name} avatarUrl={entry.avatarUrl || undefined} size={size} ringColor="#fff" />
      <div
        style={{
          fontFamily: 'var(--cpm-font-sans)',
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--cpm-on-primary)',
          maxWidth: 74,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {entry.name}
      </div>
      <div style={{ fontFamily: 'var(--cpm-font-num)', fontWeight: 800, fontSize: 15, color: 'var(--cpm-on-primary)' }}>
        {entry.score.toLocaleString('en-US')}
      </div>
      <div
        style={{
          width: '100%',
          height: baseH,
          borderRadius: '14px 14px 0 0',
          background: 'rgba(255,255,255,0.2)',
          display: 'grid',
          placeItems: 'center',
          fontFamily: 'var(--cpm-font-num)',
          fontWeight: 800,
          fontSize: isFirst ? 28 : 22,
          color: 'var(--cpm-on-primary)',
        }}
      >
        {place}
      </div>
    </div>
  );
}

export function PodiumTop3({ entries }: PodiumTop3Props) {
  const [first, second, third] = entries;
  return (
    <div
      style={{
        background: 'var(--cpm-grad-brand)',
        borderRadius: 24,
        padding: '16px 14px 14px',
        boxShadow: 'var(--cpm-elev-candy)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          fontFamily: 'var(--cpm-font-sans)',
          fontWeight: 800,
          fontSize: 15,
          color: 'var(--cpm-on-primary)',
        }}
      >
        <Trophy size={16} style={{ color: '#fff' }} />
        文化分 TOP 3
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 12, marginTop: 14 }}>
        <Column entry={second} place={2} />
        <Column entry={first} place={1} />
        <Column entry={third} place={3} />
      </div>
    </div>
  );
}
