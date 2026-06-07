export type LeaderboardScope = 'total' | 'dim' | 'dept';
export type LeaderboardWindow = 'week' | 'month' | 'quarter' | 'year';

export interface LeaderboardEntry {
  rank: number;
  userId: number;
  name: string;
  avatarUrl: string;
  deptName: string;
  score: number; // 当前积分余额（消费会扣减）
  earned: number; // 累计获得积分（历史正向流水之和，不随消费减少）
  trend: number;
}

export interface LeaderboardResponse {
  scope: LeaderboardScope;
  window: LeaderboardWindow;
  dimensionId: number | null;
  entries: LeaderboardEntry[];
  total: number;
}
