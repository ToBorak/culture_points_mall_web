import { useLeaderboard } from '@cpm/api-client';
import type { LeaderboardEntry, LeaderboardScope } from '@cpm/types';
import type { LeaderboardInsightData } from '@cpm/ui';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useAuth } from '../../store/auth';

export interface LeaderboardState {
  scope: LeaderboardScope; // 仅 'total' | 'dept'
  setScope: (s: LeaderboardScope) => void;
  q: ReturnType<typeof useLeaderboard>;
  entries: LeaderboardEntry[];
  myEntry: LeaderboardEntry | null;
  total: number;
  insight: LeaderboardInsightData | null;
}

export function useLeaderboardState(): LeaderboardState {
  const [scope, setScope] = useState<LeaderboardScope>('total');
  // 不再有维度榜与周/月/季/年：后端忽略 window，这里固定占位。
  const q = useLeaderboard({ scope, window: 'year' });
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

  return { scope, setScope, q, entries, myEntry, total, insight };
}
