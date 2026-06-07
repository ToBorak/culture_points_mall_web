import { BadgeCard, PointLedgerRow } from '@cpm/ui';
import { AdminEntry, DnaEntry, MeEmpty, MeHero, MePanel, loadMoreStyle } from './MeParts';
import type { MeState } from './useMeState';

export function MeDesktop(s: MeState) {
  const dimCount = s.dims.filter((d) => d.totalScore > 0).length;
  return (
    <div
      style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: '24px 28px',
        display: 'flex',
        flexDirection: 'column',
        gap: 22,
      }}
    >
      <h1
        style={{
          fontFamily: 'var(--cpm-font-sans)',
          fontSize: 24,
          fontWeight: 800,
          color: 'var(--cpm-ink-1)',
          margin: 0,
        }}
      >
        我的
      </h1>
      <MeHero
        name={s.name}
        avatarUrl={s.avatarUrl}
        total={s.total}
        badgeCount={s.badgeCount}
        dimCount={dimCount}
        loading={s.p.isLoading}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22, alignItems: 'start' }}>
        <MePanel title="徽章墙">
          {s.badges.length === 0 ? (
            <MeEmpty text="还没有徽章" />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 10 }}>
              {s.badges.map((bd) => (
                <BadgeCard key={bd.id} badge={bd} />
              ))}
            </div>
          )}
        </MePanel>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <DnaEntry />
          <AdminEntry />
          <MePanel title="积分流水">
            {s.txItems.length === 0 && !s.txQ.isLoading ? (
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
            )}
          </MePanel>
        </div>
      </div>
    </div>
  );
}
