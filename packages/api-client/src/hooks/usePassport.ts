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
