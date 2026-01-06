import { useQuery } from '@tanstack/react-query';
import { exercisesApi, MuscleGroup, Equipment } from './exercises.api';

export const exerciseKeys = {
  all: ['exercises'] as const,
  list: (params?: { muscleGroup?: MuscleGroup; equipment?: Equipment; search?: string }) =>
    [...exerciseKeys.all, 'list', params] as const,
  details: () => [...exerciseKeys.all, 'detail'] as const,
  detail: (id: string) => [...exerciseKeys.details(), id] as const,
};

export function useExercises(params?: { muscleGroup?: MuscleGroup; equipment?: Equipment; search?: string }) {
  return useQuery({
    queryKey: exerciseKeys.list(params),
    queryFn: () => exercisesApi.findAll(params),
  });
}

export function useExercise(id: string) {
  return useQuery({
    queryKey: exerciseKeys.detail(id),
    queryFn: () => exercisesApi.findOne(id),
    enabled: !!id,
  });
}

