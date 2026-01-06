import { useQuery } from '@tanstack/react-query';
import { progressApi } from './progress.api';

export const progressKeys = {
  all: ['progress'] as const,
  stats: () => [...progressKeys.all, 'stats'] as const,
};

export function useProgressStats() {
  return useQuery({
    queryKey: progressKeys.stats(),
    queryFn: progressApi.getStats,
  });
}

