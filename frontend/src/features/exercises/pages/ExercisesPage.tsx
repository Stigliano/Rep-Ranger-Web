import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Input } from '@/shared/ui';
import { exercisesApi, MuscleGroup } from '../api/exercises.api';

export function ExercisesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | undefined>(undefined);

  const { data: exercises, isLoading, error } = useQuery({
    queryKey: ['exercises', search, selectedMuscle],
    queryFn: () => exercisesApi.findAll({ search, muscleGroup: selectedMuscle }),
  });

  const deleteMutation = useMutation({
    mutationFn: exercisesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Caricamento...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-red-600">Errore nel caricamento degli esercizi</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Catalogo Esercizi</h1>
        <Button
          variant="primary"
          onClick={() => navigate('/exercises/new')}
        >
          Nuovo Esercizio
        </Button>
      </div>

      <div className="mb-6 flex gap-4 flex-wrap">
        <div className="w-full md:w-64">
          <Input
            placeholder="Cerca esercizio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={selectedMuscle || ''}
          onChange={(e) => setSelectedMuscle(e.target.value ? (e.target.value as MuscleGroup) : undefined)}
        >
          <option value="">Tutti i gruppi muscolari</option>
          {Object.values(MuscleGroup).map((group) => (
            <option key={group} value={group}>
              {group}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {exercises?.map((exercise) => (
          <Card key={exercise.id}>
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-semibold">{exercise.name}</h3>
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                {exercise.muscleGroup}
              </span>
            </div>
            {exercise.description && (
              <p className="text-gray-600 mb-4 line-clamp-2">{exercise.description}</p>
            )}
            <div className="text-sm text-gray-500 mb-4">
              Equipaggiamento: {exercise.equipment}
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="danger"
                size="small"
                onClick={() => {
                  if (confirm('Sei sicuro di voler eliminare questo esercizio?')) {
                    deleteMutation.mutate(exercise.id);
                  }
                }}
              >
                Elimina
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

