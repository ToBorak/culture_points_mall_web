export interface User {
  id: number;
  tenantId: number;
  dingUserId: string | null;
  name: string;
  avatarUrl: string;
  deptId: number | null;
}
