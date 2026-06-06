import type { MeProfile } from '@cpm/types';
import { useQuery } from '@tanstack/react-query';
import { http } from '../http';

/** 当前登录用户档案（含钉钉头像）。 */
export function useMe() {
  return useQuery<MeProfile>({
    queryKey: ['me', 'profile'],
    queryFn: async () => (await http().get('/api/v1/me')).data,
    staleTime: 5 * 60_000,
  });
}
