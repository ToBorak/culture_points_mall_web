import { useDimensions, useLeaderboard } from '@cpm/api-client';
import type { LeaderboardEntry, LeaderboardScope, LeaderboardWindow } from '@cpm/types';
import type { LeaderboardInsightData } from '@cpm/ui';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useAuth } from '../../store/auth';

export interface LeaderboardState {
  scope: LeaderboardScope;
  setScope: (s: LeaderboardScope) => void;
  win: LeaderboardWindow;
  setWin: (w: LeaderboardWindow) => void;
  dimId: number | undefined;
  setDimId: (id: number | undefined) => void;
  dims: ReturnType<typeof useDimensions>;
  q: ReturnType<typeof useLeaderboard>;
  entries: LeaderboardEntry[];
  myEntry: LeaderboardEntry | null;
  total: number;
  insight: LeaderboardInsightData | null;
}

export function useLeaderboardState(): LeaderboardState {
  const [scope, setScope] = useState<LeaderboardScope>('total');
  const [win, setWin] = useState<LeaderboardWindow>('week');
  const [dimId, setDimId] = useState<number | undefined>();
  const dims = useDimensions();
  const q = useLeaderboard({ scope, window: win, dimensionId: dimId });
  // 修 bug：旧代码读 'cpm_user_id'（不存在），实际 key 是 'cpm_uid'，统一走 auth store。
  const myUserId = useAuth((s) => s.userId);

  const [insight, setInsight] = useState<LeaderboardInsightData | null>(null);
  useEffect(() => {
    const token = localStorage.getItem('cpm_jwt');
    axios
      .get<LeaderboardInsightData>('/api/v1/me/leaderboard-insight', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((r) => setInsight(r.data))
      .catch(() => {});
  }, []);

  const entries: LeaderboardEntry[] = q.data?.entries ?? [];
  const myEntry = entries.find((e) => e.userId === myUserId) ?? null;
  const total = q.data?.total ?? entries.length;

  return { scope, setScope, win, setWin, dimId, setDimId, dims, q, entries, myEntry, total, insight };
}
