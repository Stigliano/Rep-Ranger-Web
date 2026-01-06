import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { Button, Input, Card } from '@/shared/ui';
import { exercisesApi, CreateExerciseDto, MuscleGroup, Equipment } from '../api/exercises.api';

export function CreateExercisePage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateExerciseDto>();

  const createMutation = useMutation({
    mutationFn: exercisesApi.create,
    onSuccess: () => {
      navigate('/exercises');
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      setError(
        err.response?.data?.message || 'Errore nella creazione dell\'esercizio',
      );
    },
  });

  const onSubmit = (data: CreateExerciseDto) => {
    createMutation.mutate(data);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Nuovo Esercizio</h1>

      <Card>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nome Esercizio"
            {...register('name', { required: 'Nome obbligatorio' })}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gruppo Muscolare
            </label>
            <select
              {...register('muscleGroup')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={MuscleGroup.OTHER}>Altro</option>
              {Object.values(MuscleGroup).filter(v => v !== MuscleGroup.OTHER).map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Equipaggiamento
            </label>
            <select
              {...register('equipment')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={Equipment.OTHER}>Altro</option>
              {Object.values(Equipment).filter(v => v !== Equipment.OTHER).map((eq) => (
                <option key={eq} value={eq}>
                  {eq}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="URL Video (opzionale)"
            {...register('videoUrl')}
            error={errors.videoUrl?.message}
          />

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              variant="primary"
              isLoading={createMutation.isPending}
            >
              Crea Esercizio
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/exercises')}
            >
              Annulla
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

