import { useActivities, usePassport } from '@cpm/api-client';
import type { Activity } from '@cpm/types';
import { EmptyState, PointsPill, SegmentedControl, useBreakpoint } from '@cpm/ui';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ActivityCard } from './ActivityCard';
import { phaseOf } from './lib';

type Filter = 'all' | 'published' | 'running' | 'mine';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'published', label: '报名中' },
  { key: 'running', label: '进行中' },
  { key: 'mine', label: '我的' },
];

function applyFilter(list: Activity[], f: Filter): Activity[] {
  const visible = list.filter((a) => a.Status !== 'draft');
  switch (f) {
    case 'published':
      return visible.filter((a) => a.Status === 'published');
    case 'running':
      return visible.filter((a) => phaseOf(a) === 'live');
    case 'mine':
      return visible.filter((a) => a.mine.enrolled);
    default:
      return visible;
  }
}

export function ActivitiesPage() {
  const { isDesktop } = useBreakpoint();
  const navigate = useNavigate();
  const points = usePassport().data?.totalScore ?? 0;
  const [filter, setFilter] = useState<Filter>('all');
  const { data, isLoading, isError } = useActivities();

  const shown = useMemo(() => applyFilter(data ?? [], filter), [data, filter]);

  return (
    <div style={{ width: '100%', height: '100%', overflowY: 'auto', overscrollBehavior: 'contain' }}>
      <div
        style={{
          width: '100%',
          maxWidth: isDesktop ? 1040 : '100%',
          margin: '0 auto',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          padding: isDesktop ? '24px 28px 40px' : '12px 16px 24px',
          fontFamily: 'var(--cpm-font-sans)',
        }}
      >
        {/* 标题栏 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: isDesktop ? 28 : 22, fontWeight: 800, color: 'var(--cpm-ink-1)', margin: 0 }}>
              活动
            </h1>
            <p style={{ fontSize: 13, color: 'var(--cpm-ink-2)', margin: '4px 0 0' }}>报名参加 · 现场扫码签到领积分</p>
          </div>
          <PointsPill value={points} />
        </div>

        {/* 筛选 */}
        <div style={{ maxWidth: 420, width: '100%' }}>
          <SegmentedControl items={FILTERS} value={filter} onChange={setFilter} />
        </div>

        {/* 列表 */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--cpm-ink-2)' }}>加载中…</div>
        ) : isError ? (
          <EmptyState icon="⚠" title="加载失败" description="请检查网络后重试" />
        ) : shown.length === 0 ? (
          <EmptyState
            icon="◎"
            title={filter === 'mine' ? '还没有报名的活动' : '暂无活动'}
            description={filter === 'mine' ? '去「全部」看看有哪些活动可以参加吧' : '新的活动发布后会展示在这里'}
          />
        ) : (
          <div
            style={{
              display: 'grid',
              width: '100%',
              gridTemplateColumns: isDesktop ? 'repeat(2, minmax(0, 1fr))' : '1fr',
              gap: 12,
            }}
          >
            {shown.map((a) => (
              <ActivityCard key={a.ID} activity={a} onClick={() => navigate(`/activities/${a.ID}`)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
