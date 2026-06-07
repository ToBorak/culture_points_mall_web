export type ActivityStatus = 'draft' | 'published' | 'running' | 'closed';

export type EnrollStatus = '' | 'enrolled' | 'checked_in' | 'absent';

export interface ActivityMine {
  enrolled: boolean;
  status: EnrollStatus;
  checkedIn: boolean;
}

/**
 * 活动卡片视图。后端 `activities.ActivityView` 内嵌原始活动结构，
 * 故活动本体字段沿用 Go 的 PascalCase 命名，聚合字段为 camelCase。
 */
export interface Activity {
  ID: number;
  TenantID: number;
  DimensionID: number;
  Title: string;
  Status: ActivityStatus;
  Capacity: number | null;
  StartAt: string | null;
  EndAt: string | null;
  LocationLat: number | null;
  LocationLng: number | null;
  RadiusM: number | null;
  PointsReward: number;
  CreatedAt: string;
  dimensionCode: string;
  dimensionName: string;
  enrolledCount: number;
  mine: ActivityMine;
}
