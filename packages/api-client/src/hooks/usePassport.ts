import type { PassportSummary, PointTransaction, Badge } from '@cpm/types';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
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

// checkNewBadges 结算并返回本次「新解锁」的勋章（后端只返回首次达成的，已拥有不再返回）。
// 供全局庆祝弹窗在积分变化后调用。
export async function checkNewBadges(): Promise<Badge[]> {
  const { data } = await http().post<{ items: Badge[] }>('/api/v1/me/badges/check');
  return data.items ?? [];
}
