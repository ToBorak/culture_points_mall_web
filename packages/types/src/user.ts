export interface User {
  id: number;
  tenantId: number;
  dingUserId: string | null;
  name: string;
  avatarUrl: string;
  deptId: number | null;
}

/** GET /api/v1/me 返回的当前登录用户档案（含钉钉头像） */
export interface MeProfile {
  id: number;
  name: string;
  avatarUrl: string;
  deptId: number | null;
}
