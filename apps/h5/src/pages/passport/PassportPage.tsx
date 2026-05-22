import { useMyBadges, usePassport } from '@cpm/api-client';
import { BadgeWall, ComicButton, Halftone, Panel, Shout } from '@cpm/ui';
import { useState } from 'react';
import { PassportRadar } from './PassportRadar';
import { PassportTransactions } from './PassportTransactions';

type View = 'radar' | 'badges' | 'tx';

export function PassportPage() {
  const [view, setView] = useState<View>('radar');
  const p = usePassport();
  const b = useMyBadges();

  if (p.isLoading) return <div className="p-6 font-kuaile">加载中...</div>;
  if (p.error) return <div className="p-6 font-kuaile text-cRed">{String(p.error)}</div>;

  return (
    <Halftone className="min-h-screen pb-20">
      <div className="p-4">
        <Panel shadow="yellow">
          <Shout tone="red" rotation={-2}>
            我的文化护照
          </Shout>
          <div className="flex items-baseline gap-3 mt-3">
            <div className="text-5xl font-bangers text-cRed" style={{ WebkitTextStroke: '2px var(--cpm-ink)' }}>
              {p.data?.totalScore ?? 0}
            </div>
            <div className="font-kuaile">总积分 · 获得 {p.data?.badgeCount ?? 0} 枚徽章</div>
          </div>
        </Panel>

        <div className="flex gap-2 mt-4">
          <ComicButton tone={view === 'radar' ? 'red' : 'yellow'} size="sm" onClick={() => setView('radar')}>
            雷达
          </ComicButton>
          <ComicButton tone={view === 'badges' ? 'red' : 'yellow'} size="sm" onClick={() => setView('badges')}>
            徽章墙
          </ComicButton>
          <ComicButton tone={view === 'tx' ? 'red' : 'yellow'} size="sm" onClick={() => setView('tx')}>
            积分流水
          </ComicButton>
        </div>

        <div className="mt-4">
          {view === 'radar' && p.data && (
            <Panel>
              <PassportRadar scoresByDimension={p.data.scoresByDimension} />
            </Panel>
          )}
          {view === 'badges' && b.data && (
            <Panel shadow="pink">
              <BadgeWall items={b.data.items} />
            </Panel>
          )}
          {view === 'tx' && <PassportTransactions />}
        </div>
      </div>
    </Halftone>
  );
}
