import { BadgeCard, PointLedgerRow, SegmentedControl } from '@cpm/ui';
import { useState } from 'react';
import { PassportRadar } from '../passport/PassportRadar';
import { DnaEntry, MeEmpty, MeHero, loadMoreStyle } from './MeParts';
import type { MeState } from './useMeState';

type View = 'radar' | 'badges' | 'tx';
const VIEWS: { key: View; label: string }[] = [
  { key: 'radar', label: '价值观雷达' },
  { key: 'badges', label: '徽章墙' },
  { key: 'tx', label: '积分流水' },
];

export function MeMobile(s: MeState) {
  const [view, setView] = useState<View>('radar');
  const dimCount = s.dims.filter((d) => d.totalScore > 0).length;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '12px 16px 24px' }}>
      <MeHero name={s.name} total={s.total} badgeCount={s.badgeCount} dimCount={dimCount} loading={s.p.isLoading} />
      <DnaEntry />
      <SegmentedControl items={VIEWS} value={view} onChange={setView} />

      {view === 'radar' && (
        <div
          style={{
            background: 'var(--cpm-surface)',
            borderRadius: 22,
            padding: 20,
            boxShadow: 'var(--cpm-elev-soft)',
            border: '1px solid var(--cpm-border-subtle)',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          {s.p.data ? <PassportRadar scoresByDimension={s.p.data.scoresByDimension} /> : <MeEmpty text="加载中…" />}
        </div>
      )}

      {view === 'badges' &&
        (s.badges.length === 0 ? (
          <MeEmpty text="还没有徽章，快去赚积分吧" />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {s.badges.map((bd) => (
              <BadgeCard key={bd.id} badge={bd} />
            ))}
          </div>
        ))}

      {view === 'tx' &&
        (s.txItems.length === 0 && !s.txQ.isLoading ? (
          <MeEmpty text="还没有积分流水" />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {s.txItems.map((t) => (
              <PointLedgerRow key={t.id} tx={t} />
            ))}
            {s.txQ.hasNextPage && (
              <button
                type="button"
                onClick={() => {
                  s.txQ.fetchNextPage();
                }}
                style={loadMoreStyle}
              >
                加载更多
              </button>
            )}
          </div>
        ))}
    </div>
  );
}
