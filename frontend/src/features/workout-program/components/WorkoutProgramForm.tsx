import { ReactNode } from 'react';
import { useFormContext } from 'react-hook-form';
import { ProgramBasicInfo } from './ProgramBasicInfo';
import { MicrocycleEditor } from './MicrocycleEditor';
import { Button } from '@/shared/ui/Button';

interface WorkoutProgramFormProps {
  onCancel: () => void;
  isSubmitting: boolean;
  submitLabel?: string;
  children?: ReactNode; // For extra errors or content
}

export const WorkoutProgramForm = ({ 
  onCancel, 
  isSubmitting, 
  submitLabel = 'Salva',
  children 
}: WorkoutProgramFormProps) => {
  const { formState: { errors } } = useFormContext();

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold mb-6 pb-2 border-b">Informazioni Generali</h2>
        <ProgramBasicInfo />
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold mb-6 pb-2 border-b">Struttura Programma</h2>
        <p className="text-sm text-gray-500 mb-4">
          Definisci i microcicli (es. fasi di 4 settimane) e le sessioni di allenamento per ciascuno.
        </p>
        
        {/* Show global validation error for microcycles if any */}
        {(errors.microcycles as { root?: { message?: string } })?.root?.message && (
            <div className="mb-4 text-red-600 text-sm">
              {(errors.microcycles as { root: { message: string } }).root.message}
            </div>
        )}
        {/* Or generic array error */}
        {errors.microcycles?.message && (
            <div className="mb-4 text-red-600 text-sm">
              {errors.microcycles.message as string}
            </div>
        )}

        <MicrocycleEditor />
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
        >
          Annulla
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Salvataggio...' : submitLabel}
        </Button>
      </div>
      
      {/* Form submission errors */}
      {Object.keys(errors).length > 0 && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mt-4">
            <p className="font-medium">Ci sono errori nel modulo:</p>
            <ul className="list-disc ml-5 text-sm">
              {Object.entries(errors).map(([key, error]) => (
                <li key={key}>
                    {key}: {error?.message as string}
                </li>
              ))}
            </ul>
          </div>
      )}

      {children}
    </div>
  );
};

