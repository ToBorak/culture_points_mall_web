import type { LeaderboardResponse, LeaderboardScope, LeaderboardWindow } from '@cpm/types';
import { useQuery } from '@tanstack/react-query';
import { http } from '../http';

export interface LeaderboardParams {
  scope: LeaderboardScope;
  window: LeaderboardWindow;
  dimensionId?: number;
}

export function useLeaderboard(p: LeaderboardParams) {
  return useQuery<LeaderboardResponse>({
    queryKey: ['leaderboard', p],
    queryFn: async () =>
      (
        await http().get('/api/v1/leaderboard', {
          params: { scope: p.scope, window: p.window, dimension_id: p.dimensionId },
        })
      ).data,
  });
}
