export type LeaderboardScope = 'total' | 'dim' | 'dept';
export type LeaderboardWindow = 'week' | 'month' | 'quarter' | 'year';

export interface LeaderboardEntry {
  rank: number;
  userId: number;
  name: string;
  avatarUrl: string;
  deptName: string;
  score: number;
  trend: number;
}

export interface LeaderboardResponse {
  scope: LeaderboardScope;
  window: LeaderboardWindow;
  dimensionId: number | null;
  entries: LeaderboardEntry[];
  total: number;
}
