import { useFormContext } from 'react-hook-form';
import { Input } from '@/shared/ui';
import { CreateWorkoutProgramDto } from '../api/workout-program.api';

export function ProgramBasicInfo() {
  const { register, formState: { errors } } = useFormContext<CreateWorkoutProgramDto>();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="col-span-2">
        <Input
          label="Nome Programma"
          {...register('name', { required: 'Nome obbligatorio' })}
          error={errors.name?.message}
        />
      </div>

      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descrizione
        </label>
        <textarea
          {...register('description')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
      </div>

      <Input
        label="Durata Totale (settimane)"
        type="number"
        min={1}
        max={52}
        {...register('durationWeeks', { valueAsNumber: true })}
        error={errors.durationWeeks?.message}
      />

      <Input
        label="Autore (opzionale)"
        {...register('author')}
      />
    </div>
  );
}

