import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SeasonQuota, MyNominations, Nomination } from '@cpm/types';
import { http } from '../http';

export function useCurrentSeason() {
  return useQuery<SeasonQuota>({
    queryKey: ['stars', 'season', 'current'],
    queryFn: async () => (await http().get('/api/v1/stars/seasons/current')).data,
    staleTime: 60_000,
  });
}

export function useMyNominations(seasonId?: number) {
  return useQuery<MyNominations>({
    queryKey: ['stars', 'nominations', 'mine', seasonId ?? 0],
    queryFn: async () =>
      (await http().get('/api/v1/stars/nominations/mine', { params: { seasonId: seasonId ?? 0 } })).data,
    enabled: (seasonId ?? 0) > 0,
  });
}

export interface NominateInput {
  seasonId: number;
  nomineeId?: number;
  dimensionId: number;
  caseText: string;
}

export function useNominate() {
  const qc = useQueryClient();
  return useMutation<Nomination, Error, NominateInput>({
    mutationFn: async (input) => (await http().post('/api/v1/stars/nominations', input)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stars', 'season', 'current'] });
      qc.invalidateQueries({ queryKey: ['stars', 'nominations', 'mine'] });
    },
  });
}

export function useAiDraftCase() {
  return useMutation<{ draft: string }, Error, { dimensionName: string; hint: string }>({
    mutationFn: async (input) =>
      (await http().post('/api/v1/stars/nominations/ai-draft', input)).data,
  });
}
