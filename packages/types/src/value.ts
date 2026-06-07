export type DimensionCode = 'customer_first' | 'candor' | 'ownership' | 'innovation';

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
