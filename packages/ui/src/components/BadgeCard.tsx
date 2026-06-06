import type { Badge } from '@cpm/types';
import { Award } from 'lucide-react';

const RARITY: Record<string, { label: string; color: string; bg: string }> = {
  common: { label: 'Common', color: '#64748b', bg: 'rgba(100,116,139,0.10)' },
  rare: { label: 'Rare', color: '#22d3ee', bg: 'rgba(34,211,238,0.12)' },
  epic: { label: 'Epic', color: '#6a5cff', bg: 'rgba(106,92,255,0.12)' },
  legendary: { label: 'Legendary', color: '#ffb020', bg: 'rgba(255,176,32,0.14)' },
};

export interface BadgeCardProps {
  badge: Badge;
}

export function BadgeCard({ badge }: BadgeCardProps) {
  const rc = RARITY[badge.rarity] ?? RARITY.common;
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 5,
        padding: '12px 8px',
        borderRadius: 16,
        background: badge.earned ? 'var(--cpm-surface)' : 'var(--cpm-sunken)',
        border: badge.earned ? '1px solid var(--cpm-border-subtle)' : '1px solid transparent',
        boxShadow: badge.earned ? 'var(--cpm-elev-soft)' : 'none',
        filter: badge.earned ? 'none' : 'grayscale(1) opacity(0.45)',
      }}
    >
      {badge.iconUrl ? (
        <img src={badge.iconUrl} alt={badge.name} style={{ width: 40, height: 40, objectFit: 'contain' }} />
      ) : (
        <div style={{ width: 40, height: 40, borderRadius: 12, background: rc.bg, display: 'grid', placeItems: 'center' }}>
          <Award size={22} style={{ color: rc.color }} />
        </div>
      )}
      <div style={{ fontFamily: 'var(--cpm-font-sans)', fontSize: 11, fontWeight: 500, color: 'var(--cpm-ink-1)', textAlign: 'center', lineHeight: 1.3 }}>
        {badge.name}
      </div>
      <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 999, background: rc.bg, color: rc.color }}>
        {rc.label}
      </span>
    </div>
  );
}
