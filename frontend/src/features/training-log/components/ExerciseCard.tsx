import { Control, useFieldArray, FieldErrors } from 'react-hook-form';
import { Card } from '@/shared/ui';
import { CreateWorkoutLogDto } from '../api/training-log.api';
import { SetRow } from './SetRow';

type WorkoutLogForm = CreateWorkoutLogDto;

interface ExerciseCardProps {
  control: Control<WorkoutLogForm>;
  exerciseIndex: number;
  exerciseName: string;
  onSetCompleted?: () => void;
  errors: FieldErrors<WorkoutLogForm>;
}

export const ExerciseCard = ({
  control,
  exerciseIndex,
  exerciseName,
  onSetCompleted,
  errors,
}: ExerciseCardProps) => {
  const { fields } = useFieldArray({
    control,
    name: `exercises.${exerciseIndex}.sets`,
  });

  return (
    <Card className="mb-4">
      <h3 className="font-semibold text-lg mb-4">{exerciseName}</h3>
      <div className="flex gap-2 mb-2 text-sm text-gray-500 font-medium">
        <div className="w-12 text-center">Set</div>
        <div className="flex-1">Kg</div>
        <div className="flex-1">Reps</div>
        <div className="flex-1">RPE</div>
        <div className="w-10 text-center">✓</div>
      </div>
      {fields.map((field, idx) => (
        <SetRow
          key={field.id}
          control={control}
          exerciseIndex={exerciseIndex}
          setIndex={idx}
          onSetCompleted={onSetCompleted}
          errors={errors}
        />
      ))}
    </Card>
  );
};

