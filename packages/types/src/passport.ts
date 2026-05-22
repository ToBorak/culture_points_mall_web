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
  rarity: BadgeRarity;
  iconUrl: string;
  earned: boolean;
  earnedAt: string | null;
}
