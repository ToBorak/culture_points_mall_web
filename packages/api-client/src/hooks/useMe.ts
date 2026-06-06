import type { MeProfile } from '@cpm/types';
import { useQuery } from '@tanstack/react-query';
import { http } from '../http';

/** 当前登录用户档案（含钉钉头像）。 */
export function meProfileQueryKey(userId?: number | null) {
  return ['me', 'profile', userId ?? 'anonymous'] as const;
}

export function useMe(userId?: number | null) {
  return useQuery<MeProfile>({
    queryKey: meProfileQueryKey(userId),
    queryFn: async () => (await http().get('/api/v1/me')).data,
    staleTime: 5 * 60_000,
  });
}
