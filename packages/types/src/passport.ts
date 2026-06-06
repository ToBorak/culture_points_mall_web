import type { Dimension } from './value';

export interface DimensionScore {
  dimensionId: number;
  dimensionCode: string;
  dimensionName: string;
  totalScore: number;
  quarterScore: number;
  yearScore: number;
}

export interface PassportSummary {
  totalScore: number;
  scoresByDimension: DimensionScore[];
  badgeCount: number;
  dimensions: Dimension[];
}

export interface PointTransaction {
  id: number;
  dimensionId: number;
  dimensionCode: string;
  amount: number;
  reason: string;
  activityId: number | null;
  createdAt: string;
}

export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Badge {
  id: number;
  dimensionId: number;
  dimensionCode: string;
  name: string;
  /** 解锁条件文案，如"累计赚取满 5 分" */
  description?: string;
  rarity: BadgeRarity;
  /** emblem 代码（如 "sprout"），由 BadgeMedal 渲染成拟物奖牌 */
  iconUrl: string;
  earned: boolean;
  earnedAt: string | null;
  /** 进度（仅累计赚取/消费类勋章）：当前累计值 */
  progressCurrent?: number;
  /** 进度目标阈值；0 或缺省表示无进度条 */
  progressTarget?: number;
}
