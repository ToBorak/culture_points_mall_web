import type { Dimension } from '@cpm/types';
import { useQuery } from '@tanstack/react-query';
import { http } from '../http';

export function useDimensions() {
  return useQuery<Dimension[]>({
    queryKey: ['dimensions'],
    queryFn: async () => {
      const { data } = await http().get<{ items: Dimension[] }>('/api/v1/values/dimensions');
      return data.items;
    },
    staleTime: 5 * 60_000,
  });
}
