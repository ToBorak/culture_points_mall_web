import { useDimensions, useLeaderboard } from '@cpm/api-client';
import type { LeaderboardEntry } from '@cpm/types';
import { ComicButton, DimChip, Halftone, Panel } from '@cpm/ui';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { TopThree } from './TopThree';

type Scope = 'total' | 'dim' | 'dept';
type Win = 'week' | 'month' | 'quarter' | 'year';

export function LeaderboardPage() {
  const [scope, setScope] = useState<Scope>('total');
  const [win, setWin] = useState<Win>('year');
  const [dimId, setDimId] = useState<number | undefined>();
  const dims = useDimensions();
  const q = useLeaderboard({ scope, window: win, dimensionId: dimId });

  return (
    <Halftone className="min-h-screen pb-20">
      <div className="p-4 space-y-4">
        <Panel shadow="red">
          <div className="flex gap-2 flex-wrap">
            {(['total', 'dim', 'dept'] as Scope[]).map((s) => (
              <ComicButton key={s} size="sm" tone={scope === s ? 'red' : 'yellow'} onClick={() => setScope(s)}>
                {s === 'total' ? '总榜' : s === 'dim' ? '维度榜' : '部门榜'}
              </ComicButton>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap mt-2">
            {(['week', 'month', 'quarter', 'year'] as Win[]).map((w) => (
              <ComicButton key={w} size="sm" tone={win === w ? 'blue' : 'yellow'} onClick={() => setWin(w)}>
                {w === 'week' ? '本周' : w === 'month' ? '本月' : w === 'quarter' ? '本季' : '本年'}
              </ComicButton>
            ))}
          </div>
          {scope === 'dim' && dims.data && (
            <div className="flex gap-2 flex-wrap mt-2">
              {dims.data.map((d) => (
                <DimChip
                  key={d.id}
                  code={d.code}
                  name={d.name}
                  active={d.id === dimId}
                  onClick={() => setDimId(d.id)}
                />
              ))}
            </div>
          )}
        </Panel>

        {q.isLoading && <div className="font-kuaile">加载中...</div>}
        {q.data && q.data.entries.length >= 3 && (
          <TopThree
            entries={q.data.entries.slice(0, 3).map((e: LeaderboardEntry) => ({
              rank: e.rank,
              name: e.name,
              avatarUrl: e.avatarUrl,
              score: e.score,
            }))}
          />
        )}

        <div className="space-y-2">
          {q.data?.entries.slice(3).map((e: LeaderboardEntry, i: number) => (
            <motion.div
              key={e.userId}
              layout
              initial={{ x: -60, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center gap-3 border-3 border-ink rounded-xl bg-paper p-2 shadow-[3px_3px_0_var(--cpm-ink)]"
            >
              <span className="font-bangers text-2xl w-8 text-center">#{e.rank}</span>
              {e.avatarUrl && (
                <img src={e.avatarUrl} className="w-10 h-10 rounded-full border-2 border-ink" alt={e.name} />
              )}
              <div className="flex-1">
                <div className="font-kuaile">{e.name}</div>
                <div className="text-xs text-ink/60">{e.deptName}</div>
              </div>
              <div className="font-bangers text-xl text-cRed">{e.score}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </Halftone>
  );
}
