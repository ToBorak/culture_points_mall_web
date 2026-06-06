// 注意：GET /api/v1/mall/items 的后端 domain.Item 无 json tag，序列化为 PascalCase。
export interface MallItem {
  ID: number;
  Type: 'item' | 'blindbox';
  Name: string;
  Cost: number;
  Stock: number | null;
  ImageURL: string;
}

// GET /api/v1/me/orders（camelCase）
export interface MallOrder {
  id: number;
  itemId: number | null;
  itemName: string;
  prizeId: number | null;
  prizeName: string;
  cost: number;
  status: string;
}

// POST /api/v1/mall/items/:id/redeem
export interface RedeemResult {
  itemName: string;
  cost: number;
}

// POST /api/v1/mall/blindbox/draw
export interface DrawResult {
  win: boolean;
  prizeId?: number;
  prizeName: string;
  prizeImage?: string;
  amount: number;
}
