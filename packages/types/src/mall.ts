// 注意：GET /api/v1/mall/items 的后端 domain.Item 无 json tag，序列化为 PascalCase。
export interface MallItem {
  ID: number;
  Type: 'item' | 'blindbox';
  Name: string;
  Cost: number;
  Stock: number | null;
  ImageURL: string;
  // 仅 blindbox 有意义：未中奖是否也扣分（true=都扣，false=中奖才扣）
  ChargeOnMiss?: boolean;
}

// GET /api/v1/mall/blindbox/:id/prizes —— 奖池展示（关联好物的实时名称/图片/积分）
export interface BlindboxPrize {
  id: number;
  itemId: number | null; // null = 无奖品（谢谢参与）
  prizeName: string;
  prizeImage: string;
  weight: number;
  stock: number | null;
  cost: number;
}

// GET /api/v1/admin/mall/blindbox/:id/config —— 后台奖池配置
export interface BlindboxConfigPrize {
  itemId: number;
  weight: number;
  stock: number | null;
  name: string;
  image: string;
  cost: number;
}
export interface BlindboxConfig {
  box: { id: number; name: string; cost: number; chargeOnMiss: boolean };
  noPrizeWeight: number;
  prizes: BlindboxConfigPrize[];
  goods: MallItem[];
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
