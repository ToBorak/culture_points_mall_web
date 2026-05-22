export type DimensionCode =
  | 'customer_first'
  | 'team_collab'
  | 'innovation'
  | 'integrity'
  | 'craftsmanship'
  | 'growth';

export interface Dimension {
  id: number;
  tenantId: number;
  code: DimensionCode | string;
  name: string;
  keywords: string;
  weight: number;
  sortOrder: number;
  enabled: boolean;
}
