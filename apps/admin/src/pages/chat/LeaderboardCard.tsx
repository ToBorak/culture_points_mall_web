import { LeaderboardRow, PodiumTop3 } from '@cpm/ui';

// LeaderboardCard 把 get_leaderboard 的结构化结果渲染成与 H5 一致的排行榜（前三名领奖台 + 名次行），
// 复用 @cpm/ui 的 PodiumTop3 / LeaderboardRow（H5 排行榜同款组件）。

export interface RawEntry {
  rank: number;
  userId: number;
  name: string;
  avatarUrl?: string;
  deptName?: string;
  score: number;
  earned?: number;
}

// 后端 Agent 工具结果可能缺少 trend / earned 字段，这里做展示兜底。
function toEntry(e: RawEntry) {
  return {
    rank: e.rank,
    userId: e.userId,
    name: e.name,
    avatarUrl: e.avatarUrl ?? '',
    deptName: e.deptName ?? '',
    score: e.score,
    earned: e.earned ?? e.score,
    trend: 0,
  };
}

export function LeaderboardCard({ entries, title }: { entries: RawEntry[]; title?: string }) {
  const list = entries.map(toEntry);
  const rest = list.length >= 3 ? list.slice(3) : list;
  return (
    <div
      style={{
        alignSelf: 'flex-start',
        width: '100%',
        maxWidth: 460,
        borderRadius: 16,
        borderTopLeftRadius: 4,
        border: '1px solid var(--cpm-card-border)',
        background: '#fff',
        boxShadow: 'var(--cpm-shadow-soft)',
        overflow: 'hidden',
        fontFamily: 'var(--cpm-font-sans)',
      }}
    >
      <div
        style={{
          padding: '11px 16px',
          background: 'rgba(124,58,237,0.05)',
          borderBottom: '1px solid var(--cpm-card-border)',
          fontSize: 13,
          fontWeight: 700,
          color: 'var(--cpm-brand-violet)',
        }}
      >
        🏆 {title ?? '积分排行榜'}
      </div>
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {list.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--cpm-text-muted)', fontSize: 13, padding: '20px 0' }}>
            暂无数据
          </div>
        )}
        {list.length >= 3 && <PodiumTop3 entries={list} />}
        {rest.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {rest.map((e) => (
              <LeaderboardRow key={e.userId} entry={e} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
