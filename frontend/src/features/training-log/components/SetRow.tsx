import { Control, FieldErrors } from 'react-hook-form';
import { Input } from '@/shared/ui';
import { CreateWorkoutLogDto } from '../api/training-log.api';

// Use the DTO directly as the form type
type WorkoutLogForm = CreateWorkoutLogDto;

interface SetRowProps {
  control: Control<WorkoutLogForm>;
  exerciseIndex: number;
  setIndex: number;
  onSetCompleted?: () => void;
  errors: FieldErrors<WorkoutLogForm>;
}

export const SetRow = ({
  control,
  exerciseIndex,
  setIndex,
  onSetCompleted,
  errors,
}: SetRowProps) => {
  const setErrors = errors.exercises?.[exerciseIndex]?.sets?.[setIndex];

  return (
    <div className="flex gap-2 items-end mb-2">
      <div className="w-12 text-center py-2 bg-gray-100 rounded text-sm font-medium">
        {setIndex + 1}
      </div>
      <div className="flex-1">
        <Input
          type="number"
          placeholder="Kg"
          error={setErrors?.weight?.message}
          {...control.register(`exercises.${exerciseIndex}.sets.${setIndex}.weight`, {
            valueAsNumber: true,
            min: { value: 0, message: 'Min 0' }
          })}
        />
      </div>
      <div className="flex-1">
        <Input
          type="number"
          placeholder="Reps"
          error={setErrors?.reps?.message}
          {...control.register(`exercises.${exerciseIndex}.sets.${setIndex}.reps`, {
            valueAsNumber: true,
            min: { value: 1, message: 'Min 1' }
          })}
        />
      </div>
      <div className="flex-1">
        <Input
          type="number"
          placeholder="RPE"
          error={setErrors?.rpe?.message}
          {...control.register(`exercises.${exerciseIndex}.sets.${setIndex}.rpe`, {
            valueAsNumber: true,
            min: { value: 1, message: 'Min 1' },
            max: { value: 10, message: 'Max 10' }
          })}
        />
      </div>
      <div className="flex items-center justify-center w-10">
        <input
            type="checkbox"
            className="w-5 h-5 text-blue-600 rounded cursor-pointer"
            {...(() => {
              const { onChange, ...rest } = control.register(`exercises.${exerciseIndex}.sets.${setIndex}.completed`);
              return {
                ...rest,
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                  onChange(e);
                  if (e.target.checked && onSetCompleted) {
                    onSetCompleted();
                  }
                }
              };
            })()}
        />
      </div>
    </div>
  );
};

