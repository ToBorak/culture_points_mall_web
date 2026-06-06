import type { LeaderboardScope, LeaderboardWindow } from '@cpm/types';
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
  { key: 'dim', label: '维度榜' },
  { key: 'dept', label: '部门榜' },
];
const WINDOWS: { key: LeaderboardWindow; label: string }[] = [
  { key: 'week', label: '周' },
  { key: 'month', label: '月' },
  { key: 'quarter', label: '季' },
  { key: 'year', label: '年' },
];

export function LeaderboardMobile(s: LeaderboardState) {
  const { entries, myEntry } = s;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14, padding: '12px 16px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ fontFamily: 'var(--cpm-font-sans)', fontSize: 22, fontWeight: 800, color: 'var(--cpm-ink-1)' }}>
            排行榜
          </h1>
          <PointsPill value={myEntry?.score ?? 0} />
        </div>

        <SegmentedControl
          items={SCOPES}
          value={s.scope}
          onChange={(k) => {
            s.setScope(k);
            if (k !== 'dim') s.setDimId(undefined);
          }}
        />

        <div style={{ display: 'flex', gap: 8 }}>
          {WINDOWS.map((w) => {
            const on = s.win === w.key;
            return (
              <button
                key={w.key}
                type="button"
                aria-pressed={on}
                onClick={() => s.setWin(w.key)}
                style={{
                  padding: '6px 16px',
                  minHeight: 32,
                  borderRadius: 'var(--cpm-r-pill)',
                  cursor: 'pointer',
                  fontFamily: 'var(--cpm-font-sans)',
                  fontSize: 12,
                  fontWeight: 700,
                  border: on ? 'none' : '1px solid var(--cpm-border-subtle)',
                  background: on ? 'var(--cpm-primary)' : 'var(--cpm-surface)',
                  color: on ? 'var(--cpm-on-primary)' : 'var(--cpm-ink-2)',
                  transition: 'all 200ms ease',
                }}
              >
                {w.label}
              </button>
            );
          })}
        </div>

        {s.scope === 'dim' && s.dims.data && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {s.dims.data.map((d) => {
              const on = d.id === s.dimId;
              return (
                <button
                  key={d.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => s.setDimId(on ? undefined : d.id)}
                  style={{
                    padding: '5px 12px',
                    minHeight: 30,
                    borderRadius: 'var(--cpm-r-pill)',
                    cursor: 'pointer',
                    fontFamily: 'var(--cpm-font-sans)',
                    fontSize: 12,
                    fontWeight: 600,
                    border: 'none',
                    background: on ? 'var(--cpm-primary)' : 'var(--cpm-primary-soft)',
                    color: on ? 'var(--cpm-on-primary)' : 'var(--cpm-primary-strong)',
                  }}
                >
                  {d.name}
                </button>
              );
            })}
          </div>
        )}

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

      {myEntry && (
        <div
          style={{
            position: 'sticky',
            bottom: 0,
            margin: '0 12px 12px',
            padding: '11px 12px',
            borderRadius: 18,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: 'linear-gradient(120deg,#ecebff,#f4f1ff)',
            border: '1.5px solid #dcd7ff',
            boxShadow: '0 -2px 16px rgba(25,26,44,0.08)',
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
              {myEntry.name} · 第 {myEntry.rank} 名
            </div>
            <div style={{ fontFamily: 'var(--cpm-font-sans)', fontSize: 11, color: 'var(--cpm-ink-2)' }}>
              本期文化分
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
