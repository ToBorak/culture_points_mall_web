import type { Badge, PassportSummary, PointTransaction } from '@cpm/types';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { http } from '../http';

export function usePassport() {
  return useQuery<PassportSummary>({
    queryKey: ['me', 'passport'],
    queryFn: async () => (await http().get('/api/v1/me/passport')).data,
  });
}

export function useMyTransactions(limit = 20) {
  return useInfiniteQuery<{ items: PointTransaction[]; nextCursor: string | null }>({
    queryKey: ['me', 'transactions'],
    initialPageParam: '',
    queryFn: async ({ pageParam }) => {
      const { data } = await http().get('/api/v1/me/transactions', {
        params: { cursor: pageParam, limit },
      });
      return data;
    },
    getNextPageParam: (last) => last.nextCursor,
  });
}

export function useMyBadges() {
  return useQuery<{ items: Badge[] }>({
    queryKey: ['me', 'badges'],
    queryFn: async () => (await http().get('/api/v1/me/badges')).data,
  });
}

// checkNewBadges 结算授予并返回所有「尚未庆祝」(celebrated=0) 的已得勋章。
// 授予与庆祝解耦：返回的勋章需经 ackCelebratedBadges 回执才落定，否则下次仍会返回（零丢失）。
// 供全局庆祝弹窗在加载 / 积分变化后调用。
export async function checkNewBadges(): Promise<Badge[]> {
  const { data } = await http().post<{ items: Badge[] }>('/api/v1/me/badges/check');
  return data.items ?? [];
}

// ackCelebratedBadges 勋章弹窗展示后回执，落定「已庆祝」，之后后端不再返回这些勋章。
export async function ackCelebratedBadges(badgeIds: number[]): Promise<void> {
  if (badgeIds.length === 0) return;
  await http().post('/api/v1/me/badges/celebrated', { badgeIds });
}
