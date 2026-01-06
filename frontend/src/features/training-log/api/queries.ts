import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { trainingLogApi, CreateWorkoutLogDto } from './training-log.api';

export const useCreateWorkoutLog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateWorkoutLogDto) => trainingLogApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-logs'] });
    },
  });
};

export const useWorkoutLogs = () => {
  return useQuery({
    queryKey: ['training-logs'],
    queryFn: trainingLogApi.findAll,
  });
};

