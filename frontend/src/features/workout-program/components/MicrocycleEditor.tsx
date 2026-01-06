import { useFormContext, useFieldArray } from 'react-hook-form';
import { Button, Input } from '@/shared/ui';
import { CreateWorkoutProgramDto } from '../api/workout-program.api';
import { SessionEditor } from './SessionEditor';

export function MicrocycleEditor() {
  const { control, register } = useFormContext<CreateWorkoutProgramDto>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'microcycles',
  });

  return (
    <div className="space-y-6">
      {fields.map((field, index) => (
        <div key={field.id} className="border-2 border-blue-100 rounded-xl p-6 bg-blue-50/30">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">Microciclo {index + 1}</h3>
            <Button
              variant="danger"
              size="small"
              onClick={() => remove(index)}
            >
              Rimuovi Microciclo
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Input
              label="Nome Microciclo (es. Ipertrofia 1)"
              {...register(`microcycles.${index}.name`, { required: true })}
            />
            <Input
              label="Durata (settimane)"
              type="number"
              min={1}
              max={4}
              {...register(`microcycles.${index}.durationWeeks`, { valueAsNumber: true })}
            />
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Obiettivi</label>
              <textarea
                 {...register(`microcycles.${index}.objectives`)}
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                 rows={2}
              />
            </div>
          </div>

          <SessionEditor microcycleIndex={index} />
        </div>
      ))}

      <div className="flex justify-center pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={() => append({
            name: '',
            durationWeeks: 1,
            orderIndex: fields.length,
            sessions: []
          })}
        >
          + Aggiungi Microciclo
        </Button>
      </div>
    </div>
  );
}

