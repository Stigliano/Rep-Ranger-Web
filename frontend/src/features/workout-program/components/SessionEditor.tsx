import { useFormContext, useFieldArray } from 'react-hook-form';
import { Button, Input } from '@/shared/ui';
import { CreateWorkoutProgramDto } from '../api/workout-program.api';
import { WorkoutExerciseEditor } from './WorkoutExerciseEditor';

interface SessionEditorProps {
  microcycleIndex: number;
}

export function SessionEditor({ microcycleIndex }: SessionEditorProps) {
  const { control, register } = useFormContext<CreateWorkoutProgramDto>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: `microcycles.${microcycleIndex}.sessions`,
  });

  return (
    <div className="space-y-4 mt-4">
      {fields.map((field, index) => (
        <div key={field.id} className="border border-gray-200 rounded-lg p-4 bg-white">
          <div className="flex justify-between items-center mb-4 pb-2 border-b">
            <h4 className="font-semibold text-gray-700">Sessione {index + 1}</h4>
            <Button
              variant="danger"
              size="small"
              onClick={() => remove(index)}
            >
              Rimuovi Sessione
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input
              label="Nome Sessione (es. Push, Pull, Upper)"
              {...register(`microcycles.${microcycleIndex}.sessions.${index}.name`, { required: true })}
            />
            <Input
              label="Giorno della settimana (1-7)"
              type="number"
              min={1}
              max={7}
              {...register(`microcycles.${microcycleIndex}.sessions.${index}.dayOfWeek`, { valueAsNumber: true })}
            />
          </div>

          <div className="mt-4">
            <h5 className="text-sm font-semibold text-gray-600 mb-2">Esercizi</h5>
            <WorkoutExerciseEditor microcycleIndex={microcycleIndex} sessionIndex={index} />
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="secondary"
        onClick={() => append({
          name: '',
          dayOfWeek: 1,
          orderIndex: fields.length,
          exercises: []
        })}
      >
        + Aggiungi Sessione
      </Button>
    </div>
  );
}

