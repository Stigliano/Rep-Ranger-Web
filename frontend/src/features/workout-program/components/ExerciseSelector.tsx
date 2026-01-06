import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/shared/ui';
import { exercisesApi, MuscleGroup, Equipment, Exercise } from '@/features/exercises/api/exercises.api';

interface ExerciseSelectorProps {
  onSelect: (exercise: Exercise) => void;
  onCancel: () => void;
}

export function ExerciseSelector({ onSelect, onCancel }: ExerciseSelectorProps) {
  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | undefined>(undefined);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | undefined>(undefined);
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: exercises, isLoading } = useQuery({
    queryKey: ['exercises', debouncedSearch, selectedMuscle, selectedEquipment],
    queryFn: () => exercisesApi.findAll({ 
      search: debouncedSearch, 
      muscleGroup: selectedMuscle,
      equipment: selectedEquipment
    }),
  });

  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-semibold text-gray-700">Seleziona Esercizio</h4>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700 text-sm"
        >
          Annulla
        </button>
      </div>

      <div className="flex flex-col gap-2 mb-4">
        <Input
          placeholder="Cerca..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="text-sm"
        />
        <div className="flex gap-2">
          <select
            className="flex-1 px-2 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedMuscle || ''}
            onChange={(e) => setSelectedMuscle(e.target.value ? (e.target.value as MuscleGroup) : undefined)}
          >
            <option value="">Tutti i muscoli</option>
            {Object.values(MuscleGroup).map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>
          <select
            className="flex-1 px-2 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedEquipment || ''}
            onChange={(e) => setSelectedEquipment(e.target.value ? (e.target.value as Equipment) : undefined)}
          >
            <option value="">Tutta l'attrezzatura</option>
            {Object.values(Equipment).map((eq) => (
              <option key={eq} value={eq}>
                {eq}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="max-h-60 overflow-y-auto space-y-2">
        {isLoading ? (
          <div className="text-center py-4 text-gray-500">Caricamento...</div>
        ) : exercises && exercises.length > 0 ? (
          exercises.map((exercise) => (
            <div
              key={exercise.id}
              className="p-3 border rounded hover:bg-blue-50 cursor-pointer transition-colors"
              onClick={() => onSelect(exercise)}
            >
              <div className="flex justify-between items-start">
                <span className="font-medium text-gray-800">{exercise.name}</span>
                <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                  {exercise.muscleGroup}
                </span>
              </div>
              {exercise.description && (
                <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                  {exercise.description}
                </p>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-gray-500">Nessun esercizio trovato</div>
        )}
      </div>
    </div>
  );
}

