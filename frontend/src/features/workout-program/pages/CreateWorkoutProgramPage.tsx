import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Button, Input, Card } from '@/shared/ui';
import {
  workoutProgramApi,
  CreateWorkoutProgramDto,
} from '../api/workout-program.api';

const createProgramSchema = z.object({
  name: z.string().min(1, 'Nome obbligatorio'),
  description: z.string().optional(),
  durationWeeks: z.number().min(1).max(52),
  author: z.string().optional(),
});

type CreateProgramFormData = z.infer<typeof createProgramSchema>;

export function CreateWorkoutProgramPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateProgramFormData>({
    resolver: zodResolver(createProgramSchema),
    defaultValues: {
      durationWeeks: 4,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateWorkoutProgramDto) =>
      workoutProgramApi.create(data),
    onSuccess: () => {
      navigate('/workout-programs');
    },
    onError: (err: any) => {
      setError(
        err.response?.data?.message || 'Errore nella creazione del programma',
      );
    },
  });

  const onSubmit = (data: CreateProgramFormData) => {
    createMutation.mutate(data);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Crea Nuovo Programma</h1>

      <Card>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nome Programma"
            {...register('name')}
            error={errors.name?.message}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrizione
            </label>
            <textarea
              {...register('description')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
            />
          </div>

          <Input
            label="Durata (settimane)"
            type="number"
            min={1}
            max={52}
            {...register('durationWeeks', { valueAsNumber: true })}
            error={errors.durationWeeks?.message}
          />

          <Input
            label="Autore (opzionale)"
            {...register('author')}
            error={errors.author?.message}
          />

          <div className="flex gap-2">
            <Button
              type="submit"
              variant="primary"
              isLoading={createMutation.isPending}
            >
              Crea Programma
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/workout-programs')}
            >
              Annulla
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

