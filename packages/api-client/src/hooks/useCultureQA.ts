import { useMutation } from '@tanstack/react-query';
import { http } from '../http';

export function useCultureQA() {
  return useMutation<{ answer: string }, Error, string>({
    mutationFn: async (question) =>
      (await http().post('/api/v1/culture-qa/ask', { question })).data,
  });
}
