import type { LeaderboardScope } from '@cpm/types';
import {
  Avatar,
  LeaderboardInsightCard,
  LeaderboardRow,
  PodiumTop3,
  PointsPill,
  SegmentedControl,
  TrendIndicator,
} from '@cpm/ui';
import type { LeaderboardState } from './useLeaderboardState';

const SCOPES: { key: LeaderboardScope; label: string }[] = [
  { key: 'total', label: '总榜' },
  { key: 'dept', label: '部门榜' },
];

export function LeaderboardMobile(s: LeaderboardState) {
  const { entries, myEntry } = s;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          padding: '12px 16px 16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ fontFamily: 'var(--cpm-font-sans)', fontSize: 22, fontWeight: 800, color: 'var(--cpm-ink-1)' }}>
            排行榜
          </h1>
          <PointsPill value={myEntry?.score ?? 0} />
        </div>

        <SegmentedControl items={SCOPES} value={s.scope} onChange={s.setScope} />

        <LeaderboardInsightCard data={s.insight} loading={!s.insight} />

        {s.q.isLoading ? (
          <div
            style={{
              textAlign: 'center',
              padding: '40px 0',
              color: 'var(--cpm-ink-2)',
              fontFamily: 'var(--cpm-font-sans)',
            }}
          >
            加载中…
          </div>
        ) : entries.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 0',
              color: 'var(--cpm-ink-2)',
              fontFamily: 'var(--cpm-font-sans)',
            }}
          >
            暂无数据
          </div>
        ) : (
          <>
            {entries.length >= 3 && <PodiumTop3 entries={entries} />}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {entries.slice(3).map((e) => (
                <LeaderboardRow key={e.userId} entry={e} highlight={e.userId === myEntry?.userId} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* 固定在排行榜页底部：我的积分 + 我的排名（不随列表滚动） */}
      {myEntry && (
        <div
          style={{
            flexShrink: 0,
            margin: '8px 12px 12px',
            padding: '11px 12px',
            borderRadius: 18,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: 'linear-gradient(120deg,#ecebff,#f4f1ff)',
            border: '1.5px solid #dcd7ff',
            boxShadow: '0 -2px 16px rgba(25,26,44,0.10)',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--cpm-font-sans)',
              fontSize: 11,
              fontWeight: 800,
              color: 'var(--cpm-primary-strong)',
              background: 'var(--cpm-surface)',
              borderRadius: 8,
              padding: '2px 7px',
            }}
          >
            你
          </span>
          <Avatar name={myEntry.name} avatarUrl={myEntry.avatarUrl || undefined} size={38} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{ fontFamily: 'var(--cpm-font-sans)', fontWeight: 700, fontSize: 14, color: 'var(--cpm-ink-1)' }}
            >
              {myEntry.rank} · {myEntry.name}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
            <span
              style={{ fontFamily: 'var(--cpm-font-num)', fontWeight: 800, fontSize: 16, color: 'var(--cpm-gold-ink)' }}
            >
              {myEntry.score.toLocaleString('en-US')}
            </span>
            <TrendIndicator value={myEntry.trend} />
          </div>
        </div>
      )}
    </div>
  );
}
