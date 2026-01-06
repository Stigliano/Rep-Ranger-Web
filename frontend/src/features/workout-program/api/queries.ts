import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workoutProgramApi, CreateWorkoutProgramDto, UpdateWorkoutProgramDto } from './workout-program.api';

export const workoutProgramKeys = {
  all: ['workout-programs'] as const,
  lists: () => [...workoutProgramKeys.all, 'list'] as const,
  details: () => [...workoutProgramKeys.all, 'detail'] as const,
  detail: (id: string) => [...workoutProgramKeys.details(), id] as const,
};

export function useWorkoutPrograms() {
  return useQuery({
    queryKey: workoutProgramKeys.lists(),
    queryFn: workoutProgramApi.findAll,
  });
}

export function useWorkoutProgram(id: string) {
  return useQuery({
    queryKey: workoutProgramKeys.detail(id),
    queryFn: () => workoutProgramApi.findOne(id),
    enabled: !!id,
  });
}

export function useCreateWorkoutProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWorkoutProgramDto) => workoutProgramApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workoutProgramKeys.lists() });
    },
  });
}

export function useUpdateWorkoutProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWorkoutProgramDto }) =>
      workoutProgramApi.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: workoutProgramKeys.lists() });
      queryClient.invalidateQueries({ queryKey: workoutProgramKeys.detail(data.id) });
    },
  });
}

export function useDeleteWorkoutProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => workoutProgramApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workoutProgramKeys.lists() });
    },
  });
}

