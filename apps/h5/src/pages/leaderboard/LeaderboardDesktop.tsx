import type { LeaderboardScope } from '@cpm/types';
import { LeaderboardInsightCard, LeaderboardRow, PodiumTop3, SegmentedControl, TrendIndicator } from '@cpm/ui';
import type { LeaderboardState } from './useLeaderboardState';

const SCOPES: { key: LeaderboardScope; label: string }[] = [
  { key: 'total', label: '总榜' },
  { key: 'dept', label: '部门榜' },
];

export function LeaderboardDesktop(s: LeaderboardState) {
  const { entries, myEntry } = s;
  return (
    <div
      style={{
        maxWidth: 1180,
        margin: '0 auto',
        padding: '24px 28px',
        display: 'flex',
        flexDirection: 'column',
        gap: 22,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <h1
          style={{
            fontFamily: 'var(--cpm-font-sans)',
            fontSize: 24,
            fontWeight: 800,
            color: 'var(--cpm-ink-1)',
            flex: 1,
            margin: 0,
          }}
        >
          排行榜
        </h1>
        <div style={{ width: 240 }}>
          <SegmentedControl items={SCOPES} value={s.scope} onChange={s.setScope} />
        </div>
      </div>

      {s.q.isLoading ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 0',
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
            padding: '80px 0',
            color: 'var(--cpm-ink-2)',
            fontFamily: 'var(--cpm-font-sans)',
          }}
        >
          暂无数据
        </div>
      ) : (
        <>
          {entries.length >= 3 && <PodiumTop3 entries={entries} />}
          <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: 22, alignItems: 'start' }}>
            <div
              style={{
                background: 'var(--cpm-surface)',
                borderRadius: 20,
                padding: '20px 22px',
                boxShadow: 'var(--cpm-elev-soft)',
                border: '1px solid var(--cpm-border-subtle)',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--cpm-font-sans)',
                  fontWeight: 800,
                  fontSize: 15,
                  color: 'var(--cpm-ink-1)',
                  marginBottom: 14,
                }}
              >
                完整榜单
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {entries.map((e) => (
                  <LeaderboardRow key={e.userId} entry={e} highlight={e.userId === myEntry?.userId} />
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18, position: 'sticky', top: 24 }}>
              {myEntry && (
                <div
                  style={{
                    background: 'linear-gradient(135deg,#7b6bff,#5646e0)',
                    borderRadius: 20,
                    padding: 22,
                    color: 'var(--cpm-on-primary)',
                    boxShadow: 'var(--cpm-elev-candy)',
                  }}
                >
                  <div style={{ fontSize: 12, opacity: 0.85, fontWeight: 700 }}>我的排名</div>
                  <div
                    style={{
                      fontFamily: 'var(--cpm-font-num)',
                      fontWeight: 800,
                      fontSize: 46,
                      lineHeight: 1.1,
                      margin: '6px 0 2px',
                    }}
                  >
                    #{myEntry.rank}
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.85 }}>
                    {myEntry.name} · {myEntry.deptName}
                  </div>
                  <div style={{ display: 'flex', gap: 24, marginTop: 16 }}>
                    <div>
                      <div style={{ opacity: 0.8, fontSize: 11 }}>当前文化分</div>
                      <div style={{ fontFamily: 'var(--cpm-font-num)', fontSize: 18, fontWeight: 800 }}>
                        {myEntry.score.toLocaleString('en-US')}
                      </div>
                    </div>
                    <div>
                      <div style={{ opacity: 0.8, fontSize: 11 }}>累计获得</div>
                      <div style={{ fontFamily: 'var(--cpm-font-num)', fontSize: 18, fontWeight: 800 }}>
                        {(myEntry.earned ?? 0).toLocaleString('en-US')}
                      </div>
                    </div>
                    <div>
                      <div style={{ opacity: 0.8, fontSize: 11 }}>趋势</div>
                      <div style={{ fontSize: 18 }}>
                        <TrendIndicator value={myEntry.trend} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <LeaderboardInsightCard data={s.insight} loading={!s.insight} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
