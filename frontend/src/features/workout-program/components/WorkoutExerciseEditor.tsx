import { useState } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { Button, Input, Modal } from '@/shared/ui';
import { CreateWorkoutProgramDto } from '../api/workout-program.api';
import { ExerciseSelector } from './ExerciseSelector';

interface WorkoutExerciseEditorProps {
  microcycleIndex: number;
  sessionIndex: number;
}

export function WorkoutExerciseEditor({ microcycleIndex, sessionIndex }: WorkoutExerciseEditorProps) {
  const { control, register, watch } = useFormContext<CreateWorkoutProgramDto>();
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  const { fields, append, remove } = useFieldArray({
    control,
    name: `microcycles.${microcycleIndex}.sessions.${sessionIndex}.exercises`,
  });

  return (
    <div className="space-y-4">
      {fields.map((field, index) => (
        <div key={field.id} className="flex flex-wrap items-end gap-2 p-3 bg-gray-50 rounded border">
          <div className="flex-1 min-w-[200px]">
             {/* Hidden exercise ID */}
             <input
              type="hidden"
              {...register(`microcycles.${microcycleIndex}.sessions.${sessionIndex}.exercises.${index}.exerciseId`)}
            />
             <label className="block text-xs font-medium text-gray-700 mb-1">Esercizio</label>
             <div className="font-medium text-sm py-2">
                 {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                 {watch(`microcycles.${microcycleIndex}.sessions.${sessionIndex}.exercises.${index}.uiName` as any) || 'Esercizio selezionato'}
             </div>
          </div>
          
          <div className="w-20">
            <Input
              label="Serie"
              type="number"
              min={1}
              {...register(`microcycles.${microcycleIndex}.sessions.${sessionIndex}.exercises.${index}.sets`, { valueAsNumber: true })}
              className="text-sm"
            />
          </div>
          <div className="w-20">
            <Input
              label="Reps"
              type="number"
              min={1}
              {...register(`microcycles.${microcycleIndex}.sessions.${sessionIndex}.exercises.${index}.reps`, { valueAsNumber: true })}
              className="text-sm"
            />
          </div>
          <div className="w-24">
             <Input
              label="Carico (kg)"
              type="number"
              step="0.5"
              min={0}
              {...register(`microcycles.${microcycleIndex}.sessions.${sessionIndex}.exercises.${index}.weightKg`, { valueAsNumber: true })}
              className="text-sm"
            />
          </div>
          <div className="w-20">
             <Input
              label="RPE"
              type="number"
              min={0}
              max={10}
              step="0.5"
              {...register(`microcycles.${microcycleIndex}.sessions.${sessionIndex}.exercises.${index}.rpe`, { valueAsNumber: true })}
              className="text-sm"
            />
          </div>
          
          <Button
            variant="danger"
            size="small"
            className="mb-1"
            onClick={() => remove(index)}
          >
            X
          </Button>
        </div>
      ))}

      <Button
        type="button"
        variant="secondary"
        size="small"
        onClick={() => setIsSelectorOpen(true)}
      >
        + Aggiungi Esercizio
      </Button>

      <Modal
        isOpen={isSelectorOpen}
        onClose={() => setIsSelectorOpen(false)}
        title="Seleziona Esercizio"
      >
        <ExerciseSelector
          onSelect={(exercise) => {
            append({
              exerciseId: exercise.id,
              // @ts-expect-error - Adding UI only field
              uiName: exercise.name, 
              sets: 3,
              reps: 10,
              weightKg: 0,
              rpe: 8,
              orderIndex: fields.length,
            });
            setIsSelectorOpen(false);
          }}
          onCancel={() => setIsSelectorOpen(false)}
        />
      </Modal>
    </div>
  );
}
