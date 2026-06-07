import { useQuery } from '@tanstack/react-query';
import type { Publication, PublishedView } from '@cpm/types';
import { http } from '../http';

export function usePublications() {
  return useQuery<{ items: Publication[] | null }>({
    queryKey: ['publications', 'list'],
    queryFn: async () => (await http().get('/api/v1/publications')).data,
    staleTime: 5 * 60_000,
  });
}

export function useCurrentPublication() {
  return useQuery<PublishedView | { publication: null }>({
    queryKey: ['publications', 'current'],
    queryFn: async () => (await http().get('/api/v1/publications/current')).data,
    staleTime: 5 * 60_000,
  });
}

export function usePublicationDetail(id: number) {
  return useQuery<PublishedView>({
    queryKey: ['publications', 'detail', id],
    queryFn: async () => (await http().get(`/api/v1/publications/${id}`)).data,
    enabled: id > 0,
  });
}
